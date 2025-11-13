/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  // 在这里继续补充你需要的变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}