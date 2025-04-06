// routes/backup.js
import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const BACKUP_DIR = "./backups";

router.get("/", async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sqlPath = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
    const zipPath = path.join(BACKUP_DIR, `backup-${timestamp}.zip`);

    // Use spawn for better cross-platform support
    const pgDump = spawn(
      "pg_dump",
      [
        "-U",
        DB_USER,
        "-h",
        DB_HOST,
        "-p",
        DB_PORT,
        "-d",
        DB_NAME,
        "-f",
        sqlPath,
      ],
      {
        env: {
          ...process.env,
          PGPASSWORD: DB_PASSWORD,
        },
      }
    );

    let errorOutput = "";

    pgDump.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pgDump.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ Backup error:", errorOutput);
        return res.status(500).json({ error: "Failed to backup database" });
      }

      // ZIP the file
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(`✅ Backup ready: ${zipPath}`);
        res.download(zipPath, (err) => {
          if (err) console.error("❌ Download error:", err);
          fs.unlinkSync(sqlPath);
          fs.unlinkSync(zipPath);
        });
      });

      archive.on("error", (err) => {
        console.error("❌ Archive error:", err);
        res.status(500).json({ error: "Failed to zip backup" });
      });

      archive.pipe(output);
      archive.file(sqlPath, { name: `backup-${timestamp}.sql` });
      archive.finalize();
    });
  } catch (err) {
    console.error("🔥 Unexpected error during backup:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
