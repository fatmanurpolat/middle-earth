export interface StoredObject {
  body: Buffer;
  contentType: string;
}

/**
 * Driven port for blob/object storage (avatars, etc.). Keeps the application
 * free of any specific provider (MinIO, S3, GCS, local disk...).
 */
export interface ObjectStorage {
  /** Store (or overwrite) an object under `key`. */
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Fetch an object, or null if it does not exist. */
  get(key: string): Promise<StoredObject | null>;
  /** Delete an object. No-op if it does not exist. */
  delete(key: string): Promise<void>;
}
