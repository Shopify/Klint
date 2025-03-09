interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    // ... other env vars
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly vitest: typeof import('vitest');
  }