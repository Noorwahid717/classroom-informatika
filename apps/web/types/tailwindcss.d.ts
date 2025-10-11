declare module 'tailwindcss' {
  export interface Config {
    darkMode?: string | string[];
    content?: Array<string | { files: string[] }>;
    theme?: Record<string, unknown>;
    plugins?: Array<unknown>;
    presets?: Array<unknown>;
  }
}
