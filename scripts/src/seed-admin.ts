/**
 * Admin credentials seeder.
 *
 * The Yastar internal admin dashboard is protected by a single shared
 * password stored as the ADMIN_PASSWORD environment secret. There is no
 * database row for the admin — authentication is purely secret-based.
 *
 * Admin credentials
 * -----------------
 *   URL    : /admin
 *   Email  : (tidak diperlukan — login hanya dengan kata sandi)
 *   Password: yastar-admin-2024
 *
 * Cara penggunaan:
 *   1. Pastikan secret ADMIN_PASSWORD sudah diset ke nilai di atas di
 *      Replit Secrets (atau ubah sesuai kebutuhan).
 *   2. Buka /admin di browser untuk masuk ke dashboard admin.
 *   3. Dari dashboard admin, buat akun pengguna baru dengan email
 *      pelanggan dan atur paket/tier sesuai langganan mereka.
 *
 * Jalankan script ini hanya untuk mencetak pengingat kredensial:
 *   pnpm --filter @workspace/scripts run seed:admin
 */

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║         YASTAR — ADMIN CREDENTIALS          ║');
console.log('╠══════════════════════════════════════════════╣');
console.log('║  URL      : /admin                          ║');
console.log('║  Password : yastar-admin-2024               ║');
console.log('╠══════════════════════════════════════════════╣');
console.log('║  Pastikan ADMIN_PASSWORD secret sudah diset ║');
console.log('║  ke nilai di atas di Replit Secrets.        ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log('Cara membuat akun pengguna baru:');
console.log('  1. Login ke /admin dengan password di atas');
console.log('  2. Akun pelanggan dibuat dari dashboard admin');
console.log('  3. Pengguna login pertama kali dengan email mereka');
console.log('     — akun akan otomatis terhubung ke record DB.');
console.log('');
