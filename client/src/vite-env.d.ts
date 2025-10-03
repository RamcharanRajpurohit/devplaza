/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly BACKEND_URL: string
  // add other env vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}