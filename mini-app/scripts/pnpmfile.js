function updateSubmodules() {
  const { execSync } = require('child_process')
  try {
    console.log('Updating Git submodules...')
    execSync('git submodule update --init --recursive', { stdio: 'inherit' })
  } catch (error) {
    console.error('Error updating Git submodules:', error)
  }
}

// 在安装依赖之前更新子模块
updateSubmodules()

module.exports = { hooks: {} }
