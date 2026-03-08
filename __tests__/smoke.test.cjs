/**
 * Smoke test — root
 * Validates that the package builds without errors.
 */

const { execSync } = require('child_process');
const path = require('path');

const pkgDir = path.resolve(__dirname, '..');

try {
  execSync('pnpm build', { cwd: pkgDir, stdio: 'pipe' });
  console.log('PASS: Build completed successfully');
  process.exit(0);
} catch (err) {
  console.error('FAIL: Build failed');
  console.error(err.stderr?.toString() || err.message);
  process.exit(1);
}
