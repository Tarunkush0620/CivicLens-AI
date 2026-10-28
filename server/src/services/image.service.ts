import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

export interface ProcessedImage {
  buffer: Buffer;
  hash: string;
  mimeType: string;
  width?: number;
  height?: number;
  filename: string;
  url: string;
}

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class ImageService {
  /**
   * Sanitizes image:
   * - Strips all EXIF metadata (GPS, device info, camera model)
   * - Resizes if max dimension exceeds 1600px
   * - Converts/standardizes to JPEG (quality 85)
   * - Computes SHA-256 hash for cache lookup
   */
  public static async processAndSanitize(
    inputBuffer: Buffer,
    originalName = 'evidence.jpg'
  ): Promise<ProcessedImage> {
    try {
      const hash = crypto.createHash('sha256').update(inputBuffer).digest('hex');

      // Process with Sharp to remove EXIF and limit size to 1600px
      const imagePipeline = sharp(inputBuffer, { failOnError: false })
        .rotate() // auto-orient based on EXIF before stripping
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true });

      const metadata = await imagePipeline.metadata();
      const sanitizedBuffer = await imagePipeline.toBuffer();

      const filename = `${hash.slice(0, 16)}-${Date.now()}.jpg`;
      const filePath = path.join(UPLOAD_DIR, filename);

      await fs.promises.writeFile(filePath, sanitizedBuffer);

      const url = `/uploads/${filename}`;

      return {
        buffer: sanitizedBuffer,
        hash,
        mimeType: 'image/jpeg',
        width: metadata.width,
        height: metadata.height,
        filename,
        url,
      };
    } catch (error) {
      logger.error('Failed to process image with Sharp', { error: String(error) });
      throw new Error('INVALID_IMAGE');
    }
  }

  /**
   * Prepares image part for Gemini API call
   */
  public static toGeminiPart(buffer: Buffer, mimeType = 'image/jpeg') {
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    };
  }
}
