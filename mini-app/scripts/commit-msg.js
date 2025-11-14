import chalk from 'chalk'

import { readFileSync } from 'node:fs'
import path from 'node:path'

const msgPath = path.resolve('.git/COMMIT_EDITMSG')

if (!msgPath) {
  console.error(chalk.redBright('异常中断'))
  process.exit(1)
}

const msg = readFileSync(msgPath, 'utf-8').trim()

const commitRE =
  /^(revert: )?(wip|feat|fix|docs|style|refactor|perf|test|build|ci|revert|chore|types)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.error(`${chalk.bgRed.white(' ERROR ')} ${chalk.red('提交信息不规范, 请执行 git cz 命令生成')}`)
  process.exit(1)
}
