import { S3StorageAdapter, type S3StorageConfig } from "./s3";
import type { StorageAdapter } from "./adapter";

/**
 * Cloudflare R2 Workers binding interface.
 * Available as env.BUCKET in a Cloudflare Workers/Pages runtime.
 */
export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<R2Object | null>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<R2Objects>;
}

interface R2Object {
  key: string;
  size: number;
}

interface R2ObjectBody extends R2Object {
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

/**
 * R2 adapter using the Workers binding directly.
 * Use this when deployed to Cloudflare Workers/Pages with an R2 binding.
 */
export class R2BindingAdapter implements StorageAdapter {
  private bucket: R2Bucket;
  private publicUrl?: string;

  constructor(bucket: R2Bucket, publicUrl?: string) {
    this.bucket = bucket;
    this.publicUrl = publicUrl;
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    contentType?: string
  ): Promise<string> {
    await this.bucket.put(key, data, {
      httpMetadata: contentType ? { contentType } : undefined,
    });
    return this.getUrl(key);
  }

  async download(key: string): Promise<Buffer | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;
    const arrayBuffer = await obj.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.bucket.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor: string | undefined;

    do {
      const result = await this.bucket.list({ prefix, cursor });
      for (const obj of result.objects) {
        keys.push(obj.key);
      }
      cursor = result.truncated ? result.cursor : undefined;
    } while (cursor);

    return keys;
  }

  async getUrl(key: string): Promise<string> {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return key;
  }
}

/**
 * R2 adapter using the S3-compatible API.
 * Use this when connecting to R2 from outside Cloudflare (e.g., Vercel, Node.js).
 * Requires R2 API tokens with S3 API access enabled.
 */
export function createR2S3Adapter(config: {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
}): StorageAdapter {
  const s3Config: S3StorageConfig = {
    bucket: config.bucket,
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    publicUrl: config.publicUrl,
    forcePathStyle: true,
  };
  return new S3StorageAdapter(s3Config);
}
