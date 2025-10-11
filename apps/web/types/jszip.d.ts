declare module "jszip" {
  export interface JSZipFile {
    dir: boolean;
    name: string;
    async(type: "string"): Promise<string>;
    uncompressedSize?: number;
    _data?: { uncompressedSize?: number };
  }

  export interface JSZipInstance {
    files: Record<string, JSZipFile>;
    forEach(callback: (relativePath: string, file: JSZipFile) => void): void;
  }

  export default class JSZip {
    static loadAsync(data: ArrayBuffer | Uint8Array | Buffer | Blob): Promise<JSZipInstance>;
  }
}
