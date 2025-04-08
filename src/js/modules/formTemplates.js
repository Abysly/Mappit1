// src/js/modules/formTemplates.js

export const loginForm = `
  <form id="loginForm" class="space-y-4">
    <div>
      <label class="block mb-1 text-primary">Email</label>
      <input type="email" name="email" required class="w-full p-2 border rounded-lg text-black" />
    </div>
    <div>
      <label class="block mb-1 text-primary">Password</label>
      <input type="password" name="password" required class="w-full p-2 border rounded-lg text-black" />
    </div>
    <button type="submit" class="w-full bg-blue-700 text-white p-2 rounded-lg">Login</button>
  </form>
`;

export const registerForm = `
  <form id="registerForm" class="space-y-4">
    <div>
      <label class="block mb-1 text-primary">Name</label>
      <input type="text" name="name" required class="w-full p-2 border rounded-lg text-black" />
    </div>
    <div>
      <label class="block mb-1 text-primary">Email</label>
      <input type="email" name="email" required class="w-full p-2 border rounded-lg text-black" />
    </div>
    <div>
      <label class="block mb-1 text-primary">Password</label>
      <input type="password" name="password" required class="w-full p-2 border rounded-lg text-black" />
    </div>
    <button type="submit" class="w-full bg-blue-700 text-white p-2 rounded-lg">Register</button>
  </form>
`;

export const forgotPasswordForm = `
  <form id="forgotForm" class="space-y-4">
    <div>
      <label class="block mb-1 text-primary">Email</label>
      <input type="email" name="email" required class="w-full p-2 border rounded-lg text-black" />
    </div>
    <button type="submit" class="w-full bg-blue-700 text-white p-2 rounded-lg">Reset Password</button>
  </form>
`;
