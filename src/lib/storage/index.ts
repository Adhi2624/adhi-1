import type { StorageAdapter } from "./adapter";

let instance: StorageAdapter | null = null;

async function createAdapter(): Promise<StorageAdapter> {
  const adapterType = process.env.STORAGE_ADAPTER || "fs";

  switch (adapterType) {
    case "s3": {
      const bucket = process.env.S3_BUCKET;
      if (!bucket) throw new Error("S3_BUCKET is required for s3 adapter");

      const { S3StorageAdapter } = await import("./s3");
      return new S3StorageAdapter({
        bucket,
        region: process.env.S3_REGION || "us-east-1",
        endpoint: process.env.S3_ENDPOINT,
        accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:
          process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
        publicUrl: process.env.S3_PUBLIC_URL,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      });
    }

    case "r2": {
      // First try the Workers binding
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const binding = (globalThis as any).BUCKET || (globalThis as any).__env?.BUCKET;

      if (binding) {
        const { R2BindingAdapter } = await import("./r2");
        return new R2BindingAdapter(binding, process.env.R2_PUBLIC_URL);
      }

      // Fall back to S3-compatible API
      const accountId = process.env.R2_ACCOUNT_ID;
      const bucket = process.env.R2_BUCKET;
      const accessKeyId = process.env.R2_ACCESS_KEY_ID;
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

      if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
        throw new Error(
          "R2 adapter requires either a Workers binding (BUCKET) or R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY"
        );
      }

      const { createR2S3Adapter } = await import("./r2");
      return createR2S3Adapter({
        accountId,
        bucket,
        accessKeyId,
        secretAccessKey,
        publicUrl: process.env.R2_PUBLIC_URL,
      });
    }

    case "fs":
    default: {
      const { FsStorageAdapter } = await import("./fs");
      return new FsStorageAdapter(
        process.env.UPLOAD_DIR || "./uploads",
        process.env.UPLOAD_BASE_URL || "/uploads"
      );
    }
  }
}

export async function getStorage(): Promise<StorageAdapter> {
  if (instance) return instance;
  instance = await createAdapter();
  return instance;
}

export type { StorageAdapter } from "./adapter";
