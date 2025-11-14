'use strict'

const { execSync } = require('child_process')
const fg = require('fast-glob')

const projects = [
  ...fg.sync('*', { cwd: './apps/', onlyDirectories: true }),
  ...fg.sync('*', { cwd: './packages/', onlyDirectories: true })
]

// precomputed scope
const scopeComplete = execSync('git status --porcelain || true')
  .toString()
  .trim()
  .split('\n')
  .find(r => ~r.indexOf('M  '))
  ?.replace(/(\/)/g, '%%')
  ?.match(/projects%%((\w|-)*)/)?.[1]

/** @type {import('cz-git').CommitizenGitOptions} */
const config = {
  scopes: ['scripts', ...projects],
  scopeFilters: ['__tests__', '_util'],
  customScopesAlign: !scopeComplete ? 'top' : 'bottom',
  defaultScope: scopeComplete,
  maxHeaderLength: 100,
  allowEmptyIssuePrefixs: false,
  allowCustomIssuePrefixs: false
}
module.exports = config
