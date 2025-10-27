import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import EntityAPIClient, { EntityResponse } from "../APIClients/EntityAPIClient";

export interface FileStatus {
  id: string;
  name: string;
  status: "uploaded" | "error";
  url?: string;
}

const buildFormData = (file: File) => {
  const entityData = {
    stringField: file.name,
    intField: 0,
    enumField: "A",
    stringArrayField: [],
    boolField: true,
  };
  const formData = new FormData();
  formData.append("file", file);
  formData.append("body", JSON.stringify(entityData));
  return formData;
};

const mapApiResponseToFileStatus = (resp: EntityResponse): FileStatus => ({
  id: resp.id.toString(),
  name: resp.fileName,
  status: "uploaded",
});

export function useFileUploadManager(maxFileSizeMB: number = 25) {
  const [uploadedFiles, setUploadedFiles] = useState<FileStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchFileUrl = useCallback(async (fileName: string) => {
    try {
      const fileUrl = await EntityAPIClient.getFile(fileName);
      if (fileUrl) {
        setUploadedFiles((prevFiles: FileStatus[]) =>
          prevFiles.map((file: FileStatus) =>
            file.name === fileName ? { ...file, url: fileUrl } : file,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to fetch file URL:", err);
    }
  }, []);

  const fetchAllFiles = useCallback(async () => {
    try {
      setUploadedFiles([]);
      const entities = await EntityAPIClient.get();
      if (!entities || !Array.isArray(entities)) {
        setUploadedFiles([]);
        setError("No files available or error occurred");
        return;
      }
      const files: FileStatus[] = entities.map(mapApiResponseToFileStatus);
      setUploadedFiles(files);
      const urlPromises = files.map(async (file) => {
        try {
          const fileUrl = await EntityAPIClient.getFile(file.name);
          if (!fileUrl) throw new Error("File URL does not exist");
          return { name: file.name, url: fileUrl };
        } catch (err) {
          console.error(`Failed to fetch URL for file ${file.name}:`, err);
          return null;
        }
      });
      const results = await Promise.all(urlPromises);
      setUploadedFiles((prevFiles) =>
        prevFiles.map((prevFile) => {
          const result = results.find((r) => r?.name === prevFile.name);
          return result?.url ? { ...prevFile, url: result.url } : prevFile;
        }),
      );
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError("Failed to load existing files");
      setUploadedFiles([]);
    }
  }, []);

  useEffect(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const MAX_FILE_SIZE = maxFileSizeMB * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${maxFileSizeMB}MB limit`);
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxFileSizeMB}MB`,
        status: "error",
        duration: 3000,
      });
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const formData = buildFormData(file);
      const response = await EntityAPIClient.create({ formData });
      if (!response) {
        throw new Error("Upload failed - no response");
      }
      const { fileName } = response;
      if (!fileName) {
        throw new Error("Upload failed - no fileName in response");
      }
      const fileUrl = await EntityAPIClient.getFile(fileName);
      const newFile: FileStatus = {
        ...mapApiResponseToFileStatus(response),
        url: fileUrl || undefined,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
      toast({
        title: "File uploaded successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload file");
      toast({
        title: "Upload failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await EntityAPIClient.deleteEntity(id);
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      toast({
        title: "File deleted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Delete failed:", err);
      toast({
        title: "Failed to delete file",
        status: "error",
        duration: 3000,
      });
    }
  };

  return {
    uploadedFiles,
    isUploading,
    error,
    handleUpload,
    handleDelete,
    fetchFileUrl,
  };
}
