import { Buffer } from 'node:buffer';
import { Client } from 'minio';
import type {
  ObjectStorage,
  StoredObject,
} from '../../../ports/driven/ObjectStorage.js';

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

const CONTENT_TYPE_BY_EXT: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * MinIO (S3-compatible) implementation of the ObjectStorage port.
 */
export class MinioObjectStorage implements ObjectStorage {
  private readonly client: Client;
  private readonly bucket: string;

  constructor(config: MinioConfig) {
    this.client = new Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucket = config.bucket;
  }

  /**
   * Create the bucket if it does not exist. Retries a few times so a slow
   * MinIO startup (e.g. in docker compose) does not race the backend.
   */
  async ensureBucket(attempts = 10, delayMs = 1500): Promise<void> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        const exists = await this.client.bucketExists(this.bucket);
        if (!exists) {
          await this.client.makeBucket(this.bucket);
        }
        return;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, key, body, body.length, {
      'Content-Type': contentType,
    });
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const stream = await this.client.getObject(this.bucket, key);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
      }
      return { body: Buffer.concat(chunks), contentType: contentTypeFor(key) };
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}

export function contentTypeFor(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase() ?? '';
  return CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';
}

function isNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const code = (error as { code?: unknown }).code;
  return code === 'NoSuchKey' || code === 'NotFound' || code === 'NoSuchBucket';
}
