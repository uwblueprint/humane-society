import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useToast,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { HiUpload, HiRefresh } from 'react-icons/hi';
import EntityAPIClient, { EntityResponse } from '../APIClients/EntityAPIClient';


interface FileStatus {
  id: string;
  name: string;
  status: 'uploaded' | 'error';
  url?: string;
}

const DevFileStorageUpload: React.FC = () => {
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
            file.name === fileName ? { ...file, url: fileUrl } : file
          )
        );
      }
    } catch (err) {
      console.error('Failed to fetch file URL:', err);
    }
  }, []);

  const fetchAllFiles = useCallback(async () => {
    try {
      // Clear existing files before fetching
      setUploadedFiles([]);
      
      const entities = await EntityAPIClient.get();

      // If entities is null, undefined, or an error occurred, clear the files and return
      if (!entities || !Array.isArray(entities)) {
        setUploadedFiles([]);
        setError('No files available or error occurred');
        return;
      }

      const files: FileStatus[] = entities
        .filter((entity: EntityResponse): entity is EntityResponse & { fileName: string } => 
          // [Optional] Additional validation to ensure the entity has required properties
          entity && 
          typeof entity.fileName === 'string' && 
          typeof entity.id !== 'undefined'
        )
        .map((entity) => ({
          id: entity.id.toString(),
          name: entity.fileName,
          status: 'uploaded'
        }));

      // Set the initial files first
      setUploadedFiles(files);

      // Fetch all URLs in parallel
      const urlPromises = files.map(async (file) => {
        try {
          const fileUrl = await EntityAPIClient.getFile(file.name);
          if (!fileUrl) {
            throw new Error('File URL does not exist');
          }
          return { name: file.name, url: fileUrl };
        } catch (err) {
          console.error(`Failed to fetch URL for file ${file.name}:`, err);
          return null;
        }
      });

      // Wait for all URL fetches to complete
      const results = await Promise.all(urlPromises);

      // Update state once with all URLs
      setUploadedFiles(prevFiles => 
        prevFiles.map(prevFile => {
          const result = results.find(r => r?.name === prevFile.name);
          return result?.url ? { ...prevFile, url: result.url } : prevFile;
        })
      );

    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load existing files');
      setUploadedFiles([]);
    }
  }, []);

  // Add a refresh function
  const handleRefresh = useCallback(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  useEffect(() => {
    fetchAllFiles();
  }, [fetchAllFiles]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    
    const file = files[0];
    // Check file size - 25MB in bytes
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 25MB limit');
      toast({
        title: 'File too large',
        description: 'Maximum file size is 25MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const entityData = {
        stringField: file.name,
        intField: 0,
        enumField: "A",
        stringArrayField: [],
        boolField: true
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('body', JSON.stringify(entityData));

      const response = await EntityAPIClient.create({ formData });
      if (!response || !response.fileName) {
        throw new Error('Upload failed - no response or fileName');
      }

      // Get the URL for the newly uploaded file
      const fileUrl = await EntityAPIClient.getFile(response.fileName);
      
      // Add only the new file to state
      const newFile: FileStatus = {
        id: response.id.toString(),
        name: response.fileName,
        status: 'uploaded',
        url: fileUrl || undefined
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      
      toast({
        title: 'File uploaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload file');
      toast({
        title: 'Upload failed',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
  };

  const handleDelete = async (id: string) => {
    try {
      await EntityAPIClient.deleteEntity(id);
      setUploadedFiles(prev => prev.filter(file => file.id !== id));
      toast({
        title: 'File deleted successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Delete failed:', err);
      toast({
        title: 'Failed to delete file',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const FileGrid = ({ files }: { files: FileStatus[] }) => (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Uploaded Files</Heading>
        <Button
          size="sm"
          leftIcon={<Icon as={HiRefresh} />}
          onClick={handleRefresh}
        >
          Refresh All
        </Button>
      </Flex>
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {files.map(file => (
          <Box 
            key={file.id} 
            borderWidth="1px" 
            borderRadius="lg" 
            overflow="hidden"
            p={4}
          >
            <VStack spacing={3}>
              <Text noOfLines={1}>{file.name}</Text>
              {file.url ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  maxH="200px"
                  objectFit="contain"
                  fallback={
                    <Box 
                      height="200px" 
                      width="100%" 
                      bg="gray.100" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                    >
                      <Text color="gray.500">Image not available</Text>
                    </Box>
                  }
                />
              ) : (
                <Box 
                  height="200px" 
                  width="100%" 
                  bg="gray.100" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Text color="gray.500">Image not available</Text>
                </Box>
              )}
              <Flex gap={2} width="100%">
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => fetchFileUrl(file.name)}
                  flex={1}
                >
                  {file.url ? 'Reload' : 'Load Image'}
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(file.id)}
                >
                  Delete
                </Button>
              </Flex>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Heading>File Storage Upload</Heading>

        <Box
          borderWidth="2px"
          borderStyle="dashed"
          borderRadius="md"
          p={6}
          textAlign="center"
          position="relative"
        >
          <Input
            type="file"
            height="100%"
            width="100%"
            position="absolute"
            top="0"
            left="0"
            opacity="0"
            aria-hidden="true"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileChange}
            cursor="pointer"
          />
          <VStack spacing={2}>
            <HiUpload size={24} />
            <Text>Drag and drop here to upload</Text>
            <Text fontSize="sm" color="gray.700">Accepted formats: .png, .jpg, .jpeg, .gif, .pdf</Text>
            <Text fontSize="sm" color="gray.500">or click to select</Text>
            <Text fontSize="sm" color="gray.500">(Max file size: 25 MB)</Text>
            <Button
              colorScheme="blue"
              isLoading={isUploading}
              loadingText="Uploading..."
              pointerEvents="none"
            >
              Select File
            </Button>
          </VStack>
        </Box>

        {error && (
          <Box p={4} bg="red.100" color="red.700" borderRadius="md">
            {error}
          </Box>
        )}

        {uploadedFiles.length > 0 && <FileGrid files={uploadedFiles} />}
      </Stack>
    </Container>
  );
};

export default DevFileStorageUpload;
