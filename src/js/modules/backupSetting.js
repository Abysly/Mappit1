// public/js/backup.js

async function handleDatabaseBackup() {
  try {
    const res = await fetch("http://localhost:5000/api/backup");

    if (!res.ok) throw new Error("Backup failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "database-backup.zip";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("❌ Failed to download backup:", err);
    alert("Backup download failed");
  }
}

// Exported init function to attach event listener
export function initBackupExport() {
  const btn = document.getElementById("export-backup-btn");
  if (btn) {
    btn.addEventListener("click", handleDatabaseBackup);
  }
}
