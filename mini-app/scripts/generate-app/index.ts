import path from 'path'
import { Plop, run } from 'plop'

async function generateTemplate() {
  Plop.prepare(
    {
      configPath: path.resolve(__dirname, 'plopfile.ts')
    },
    env => {
      run(env, undefined, true)
    }
  )
}

generateTemplate()
