export interface StorageAdapter {
  /**
   * Upload a file. Returns the public URL or storage key.
   */
  upload(
    key: string,
    data: Buffer | Uint8Array,
    contentType?: string
  ): Promise<string>;

  /**
   * Download a file by key. Returns null if not found.
   */
  download(key: string): Promise<Buffer | null>;

  /**
   * Delete a file by key.
   */
  delete(key: string): Promise<boolean>;

  /**
   * List files under a prefix.
   */
  list(prefix?: string): Promise<string[]>;

  /**
   * Get a URL for the file (signed or public depending on adapter).
   */
  getUrl(key: string): Promise<string>;
}
