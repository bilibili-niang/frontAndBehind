import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const distPath = path.resolve(appRoot, 'dist')

function getBaseDestDir() {
  // 优先读取命令行参数 --dest=...，其次读取环境变量
  const arg = process.argv.find((a) => a.startsWith('--dest='))
  if (arg) return arg.replace('--dest=', '')
  const envDest =
    process.env.DIST_BASE_DIR ||
    process.env.DIST_DEST ||
    process.env.DIST_DIR ||
    ''
  if (envDest) return envDest
  // 默认：仓库根目录下 dist
  return path.resolve(repoRoot, 'dist')
}

async function getProjectName() {
  try {
    const pkgJson = await fs.promises.readFile(path.resolve(appRoot, 'package.json'), 'utf-8')
    const pkg = JSON.parse(pkgJson)
    return pkg.name || 'admin'
  } catch {
    return 'admin'
  }
}

async function ensureParentDir(p) {
  const parent = path.dirname(p)
  await fs.promises.mkdir(parent, { recursive: true })
}

async function pathExists(p) {
  try {
    await fs.promises.access(p, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.promises.stat(src)
  if (stat.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true })
    const entries = await fs.promises.readdir(src)
    for (const e of entries) {
      await copyRecursive(path.join(src, e), path.join(dest, e))
    }
  } else {
    await fs.promises.copyFile(src, dest)
  }
}

async function main() {
  const projectName = await getProjectName()
  const baseDest = getBaseDestDir()
  const destPath = path.resolve(baseDest, projectName)
  const distExists = await pathExists(distPath)
  if (!distExists) {
    console.warn(`[postbuild] skip: dist not found at ${distPath}`)
    return
  }

  await ensureParentDir(destPath)

  // Remove old dest if exists
  try {
    await fs.promises.rm(destPath, { recursive: true, force: true })
  } catch {}

  // Try rename first
  try {
    await fs.promises.rename(distPath, destPath)
    console.log(`[postbuild] moved dist -> ${destPath}`)
    return
  } catch (err) {
    console.warn(`[postbuild] rename failed, fallback to copy: ${err?.code || err}`)
  }

  // Fallback: copy then remove dist
  await copyRecursive(distPath, destPath)
  await fs.promises.rm(distPath, { recursive: true, force: true })
  console.log(`[postbuild] copied dist -> ${destPath}`)
}

main().catch((e) => {
  console.error('[postbuild] failed:', e)
  process.exit(0) // 不让构建失败
})