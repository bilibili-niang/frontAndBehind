#!/usr/bin/env bash
set -Eeuo pipefail
set -x

echo "=== 构建诊断信息 ==="
uname -a || true
cat /etc/os-release || true
ldd --version || true
ulimit -a || true
free -h || true
echo "Node/PNPM 版本:" && node --version && pnpm --version || true
echo "Node 详细版本:" && node -p 'process.versions' || true
echo "pnpm store-dir:" && pnpm config get store-dir || true
echo "依赖体积概览:" && du -sh node_modules 2>/dev/null || true && du -sh apps/admin/node_modules 2>/dev/null || true
echo "依赖版本：esbuild/vite" && pnpm list esbuild vite --depth 0 || true
echo "从 apps/admin 解析依赖路径：" && pnpm --filter ./apps/admin exec node -e "console.log('vite ->', require.resolve('vite')); console.log('esbuild ->', require.resolve('esbuild')); console.log('esbuild version ->', require('esbuild/package.json').version)" || true
## 不再使用 pnpm run -l（在当前 pnpm 版本会报 Unknown option: 'long'）
echo "apps/admin scripts 概览：" && cat apps/admin/package.json | sed -n '1,120p' || true
echo "检查构建后脚本文件:" && ls -lah apps/admin/scripts/move-dist.mjs || true

echo "切换 Node 版本到 18.20.5（pnpm env）"
pnpm env use --global 18.20.5 || true
node --version || true

echo "开始执行 Vite 测试构建..."
export VITE_APP_NAME=$(node -p 'require("./apps/admin/package.json").name || "admin"')
export DEBUG='vite:* rollup:* esbuild:*'
## 仅保留 NODE_OPTIONS 中允许的选项，移除不被允许的 diagnostic-report-on-fatalerror
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=4096 --trace-uncaught"
# 为避免原生二进制崩溃（139），禁用 Tailwind Oxide，回退到纯 JS 实现
export TAILWIND_DISABLE_OXIDE=1
echo "已设置 TAILWIND_DISABLE_OXIDE=1（禁用 @tailwindcss/oxide 原生编译）"
echo "Sass 诊断：" && node -e 'try{const sass=require("sass");console.log(sass.info)}catch(e){console.error("sass not found",e.message)}'
echo "sass-embedded 状态：" && node -e 'try{console.log("installed",require("sass-embedded/package.json").version)}catch(e){console.log("not installed")}'

# 关键修复：在 CI 中显式允许并重建原生依赖，避免 "Ignored build scripts" 导致的 139 崩溃
echo "开始允许并重建原生依赖..."
pnpm config set store-dir "$(pwd)/.pnpm-store" || true
pnpm config get store-dir || true
pnpm store prune || true
# 使用标准 workspace 安装命令，不附带包名，避免被当作 add 而不支持 --frozen-lockfile
pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile
pnpm rebuild esbuild @swc/core @tailwindcss/oxide @parcel/watcher vue-demi core-js sass-embedded || true

echo "构建前健诊：验证关键原生依赖工作状态"
node apps/admin/scripts/ci-preflight.js || true

pnpm --filter ./apps/admin run build-test
echo "构建完成，列出产物：" && ls -lah apps/admin/dist || true

echo "开始部署到测试环境目录..."
PROJECT_NAME=$(node -p 'require("./apps/admin/package.json").name || "admin"')
DIST_DIR=apps/admin/dist
if [ ! -d "$DIST_DIR" ]; then
  echo "dist not found at $DIST_DIR"; exit 1
fi
# 目标目录：以项目名作为文件夹，如 /www/wwwroot/yesong-admin
# 可通过 CI 变量 DEPLOY_BASE_DIR 覆盖基础路径，默认 /www/wwwroot
BASE_DIR="${DEPLOY_BASE_DIR:-/www/wwwroot/yesongAdminTest/}"
TARGET_DIR="${BASE_DIR}/${PROJECT_NAME}"
echo "部署目标：$TARGET_DIR"
mkdir -p "$TARGET_DIR" || { echo "目标路径无法创建，请预先在服务器创建并授予写权限，或设置 CI 变量 DEPLOY_DIR_FALLBACK"; exit 1; }
if command -v rsync >/dev/null 2>&1; then
  echo '使用 rsync 同步并删除旧产物（保留 .user.ini）'
  rsync -a --delete --no-perms --no-owner --no-group --exclude='.user.ini' "$DIST_DIR/" "$TARGET_DIR/" || {
    echo 'rsync 同步失败，回退到手动清理+拷贝';
    # 手动清理目标旧产物，保留 .user.ini
    find "$TARGET_DIR" -mindepth 1 ! -name '.user.ini' -exec rm -rf {} + || true
    cp -rf "$DIST_DIR/"* "$TARGET_DIR/";
  }
else
  echo 'rsync 不可用，手动清理并覆盖到部署目录（保留 .user.ini）'
  find "$TARGET_DIR" -mindepth 1 ! -name '.user.ini' -exec rm -rf {} + || true
  cp -rf "$DIST_DIR/"* "$TARGET_DIR/"
fi
echo "部署完成：$TARGET_DIR"