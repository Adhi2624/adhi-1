import { promises as fs } from "node:fs";
import path from "node:path";
import type { StorageAdapter } from "./adapter";

export class FsStorageAdapter implements StorageAdapter {
  private baseDir: string;
  private baseUrl: string;

  constructor(
    baseDir: string = "./uploads",
    baseUrl: string = "/uploads"
  ) {
    this.baseDir = path.resolve(/* turbopackIgnore: true */ baseDir);
    this.baseUrl = baseUrl;
  }

  private filePath(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
    return path.join(this.baseDir, normalized);
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    _contentType?: string
  ): Promise<string> {
    const filePath = this.filePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return `${this.baseUrl}/${key}`;
  }

  async download(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(this.filePath(key));
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const dir = prefix
      ? path.join(this.baseDir, prefix)
      : this.baseDir;

    try {
      const entries = await fs.readdir(dir, {
        recursive: true,
        withFileTypes: true,
      });
      return entries
        .filter((e) => e.isFile())
        .map((e) => {
          const full = path.join(e.parentPath || e.path, e.name);
          return path.relative(this.baseDir, full).replace(/\\/g, "/");
        });
    } catch {
      return [];
    }
  }

  async getUrl(key: string): Promise<string> {
    return `${this.baseUrl}/${key}`;
  }
}
