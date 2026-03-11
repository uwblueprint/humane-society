import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import IFileStorageService from "../interfaces/fileStorageService";
import { getErrorMessage } from "../../utilities/errorUtils";
import logger from "../../utilities/logger";

const Logger = logger(__filename);

class FileStorageService implements IFileStorageService {
  bucketName: string;

  supabase: SupabaseClient;

  constructor(bucketName: string) {
    this.bucketName = bucketName;

    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName = bucketName;
  }

  async getFile(fileName: string, expirationTimeMinutes = 60): Promise<string> {
    const bucket = await this.supabase.storage.from(this.bucketName);
    try {
      const { data } = await bucket.getPublicUrl(fileName);
      if (!data) {
        throw new Error(`File name ${fileName} does not exist`);
      }
      const { publicUrl } = data;
      return publicUrl;
    } catch (error: unknown) {
      Logger.error(
        `Failed to retrieve file. Reason = ${getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async createFile(
    fileName: string,
    filePath: string,
    contentType: string | null = null,
  ): Promise<void> {
    try {
      const bucket = this.supabase.storage.from(this.bucketName);

      const fileBuffer = await fs.promises.readFile(filePath);

      const { data, error } = await bucket.upload(fileName, fileBuffer, {
        contentType: contentType || undefined,
        upsert: true,
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("File upload failed without a specific error message.");
      }
    } catch (error: unknown) {
      Logger.error(`Failed to upload file. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async updateFile(
    fileName: string,
    filePath: string,
    contentType: string | null = null,
  ): Promise<void> {
    try {
      const fileBuffer = await fs.promises.readFile(filePath);

      const bucket = this.supabase.storage.from(this.bucketName);

      await bucket.update(fileName, fileBuffer, {
        contentType: contentType || undefined,
        upsert: true,
      });
    } catch (error: unknown) {
      Logger.error(`Failed to update file. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.supabase.storage.from(this.bucketName);
      const { data, error } = await bucket.remove([fileName]);
      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      Logger.error(`Failed to delete file. Reason = ${getErrorMessage(error)}`);
      throw error;
    }
  }
}

export default FileStorageService;
