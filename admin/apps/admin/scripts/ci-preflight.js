/* CI 预检：在构建前验证关键依赖的可用性与解析路径。
   注意：该脚本不强制失败，只打印 [OK]/[WARN] 便于定位。 */
const path = require('path');

const appDir = path.join(process.cwd(), 'apps', 'admin');
const ok = (msg, val) => console.log(`[OK] ${msg}`, val ?? '');
const warn = (msg, err) => console.log(`[WARN] ${msg}: ${err && err.message || err}`);

function resolvePkg(pkg) {
  try {
    return require.resolve(`${pkg}/package.json`, { paths: [appDir] });
  } catch (e) {
    return null;
  }
}

// vue-demi：检查是否能从 apps/admin 解析到包（pnpm 隔离下，root 直接 require 可能失败）
try {
  const vueDemiPath = resolvePkg('vue-demi');
  vueDemiPath ? ok('vue-demi found', vueDemiPath) : warn('vue-demi not found (may be optional)', 'resolve failed');
} catch (e) { warn('vue-demi check failed', e); }

// esbuild：验证变换与二进制存在
try {
  const es = require('esbuild');
  es.transformSync('let x=1', { loader: 'js' });
  ok('esbuild transformSync', es.version);
  const bin = require.resolve('esbuild/bin/esbuild', { paths: [appDir] });
  ok('esbuild bin', bin);
} catch (e) { warn('esbuild check failed', e); }

// @tailwindcss/oxide：很多环境下不提供 JS 入口，改为检测包目录
try {
  const oxidePkg = resolvePkg('@tailwindcss/oxide');
  oxidePkg ? ok('@tailwindcss/oxide pkg', oxidePkg) : warn('@tailwindcss/oxide not found (tailwind v4 may still work via fallback)', 'resolve failed');
} catch (e) { warn('oxide check failed', e); }

// sass：验证编译函数
try {
  const sass = require('sass');
  sass.compileString('a{b:c}');
  ok('sass compileString', sass.info);
} catch (e) { warn('sass check failed', e); }

// sass-embedded：仅检查存在性（不是必需）
try {
  const emb = require.resolve('sass-embedded/package.json', { paths: [appDir] });
  ok('sass-embedded present', emb);
} catch (e) { warn('sass-embedded not present', e.message); }

// 永远以 0 退出，不阻断构建
process.exit(0);