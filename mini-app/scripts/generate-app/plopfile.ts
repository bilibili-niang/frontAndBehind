import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { NodePlopAPI } from 'plop'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** 校验命名 */
const checkName = (name: string) => {
  return !/^[a-z][a-z|-]*[a-z]$/.test(name)
}

/** 校验组件是否已经创建 */
const checkExist = (name: string) => {
  return (
    fs.existsSync(path.resolve(__dirname, `../../packages/${name}`)) ||
    fs.existsSync(path.resolve(__dirname, `../../apps/${name}`))
  )
}

module.exports = async function (plop: NodePlopAPI) {
  console.log(`${chalk.cyanBright.bold('准备生成项目模板')}`)
  await plop.setGenerator('component', {
    description: '创建项目模板',
    prompts: [
      {
        name: 'name',
        type: 'input',
        message: '请输入项目名 @anteng/',
        validate: (input, answer) => {
          if (!input) {
            return '请输入项目名'
          }
          if (checkName(input)) {
            return '请使用 kebab-case 方式命名'
          }
          if (checkExist(input)) {
            return `项目 @anteng/${input} 已存在`
          }
          return true
        }
      }
    ],
    actions: answer => {
      const { name, type = 'app' } = answer!
      const dir = `../../template/${type}-template`
      return [
        {
          type: 'addMany',
          destination: `../../${type}s/${name}`,
          base: dir,
          templateFiles: [dir, `${dir}/.*`, `!${dir}/.swc`, `!${dir}/dist`, `!${dir}/node_modules`],
          verbose: false,
          abortOnFail: true,
          skipInterpolation: true,
          transform(template, data, cfg) {
            return template
          }
        }
      ]
    }
  })
  Promise.resolve()
}
