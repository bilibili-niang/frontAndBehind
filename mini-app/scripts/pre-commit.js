const { execSync } = require('child_process')

console.log('正在检查代码格式...')
console.time('✅ 代码格式化完成，用时：')
try {
  const { stdout, stderr } = execSync('npx --no-install lint-staged')
} catch (error) {
  console.error(`代码格式失败 ${error}`)
}

console.timeEnd('✅ 代码格式化完成，用时：')
