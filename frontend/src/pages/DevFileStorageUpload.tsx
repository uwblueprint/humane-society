import React from "react";
import {
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";
import {
  FileStatus,
  useFileUploadManager,
} from "../hooks/useFileUploadManager";

const DevFileStorageUpload: React.FC = () => {
  const {
    uploadedFiles,
    isUploading,
    error,
    handleUpload,
    handleDelete,
    fetchFileUrl,
  } = useFileUploadManager(25);

  const FileGrid = ({ files }: { files: typeof uploadedFiles }) => (
    <Flex direction="column">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Uploaded Files</Heading>
      </Flex>
      <SimpleGrid columns={[1, 2, 3]} spacing="4rem">
        {files.map((file: FileStatus) => (
          <Flex
            key={file.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
          >
            <Flex direction="column" gap="3rem">
              <Text noOfLines={1}>{file.name}</Text>
              {file.url ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  maxH="12.5rem"
                  objectFit="contain"
                  fallback={
                    <Flex
                      height="12.5rem"
                      width="100%"
                      bg="gray.100"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="gray.500" textStyle="body">
                        Image not available
                      </Text>
                    </Flex>
                  }
                />
              ) : (
                <Flex
                  height="12.5rem"
                  width="100%"
                  bg="gray.100"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="gray.500" textStyle="body">
                    Image not available
                  </Text>
                </Flex>
              )}
              <Flex gap="0.5rem" width="100%">
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => fetchFileUrl(file.name)}
                  flex={1}
                >
                  {file.url ? "Reload" : "Load Image"}
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(file.id)}
                >
                  Delete
                </Button>
              </Flex>
            </Flex>
          </Flex>
        ))}
      </SimpleGrid>
    </Flex>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction="column" gap="8rem">
        <Heading>File Storage Upload</Heading>

        <Flex
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
            onChange={(e) => handleUpload(e.target.files)}
            cursor="pointer"
          />
          <Flex direction="column" gap="2rem">
            <HiUpload size={24} />
            <Text>Drag and drop here to upload</Text>
            <Text fontSize="sm" color="gray.700">
              Accepted formats: .png, .jpg, .jpeg, .gif, .pdf
            </Text>
            <Text fontSize="sm" color="gray.500">
              or click to select
            </Text>
            <Text fontSize="sm" color="gray.500">
              (Max file size: 25 MB)
            </Text>
            <Button
              colorScheme="blue"
              isLoading={isUploading}
              loadingText="Uploading..."
              pointerEvents="none"
            >
              Select File
            </Button>
          </Flex>
        </Flex>

        {error && (
          <Flex p={4} bg="red.100" color="red.700" borderRadius="md">
            {error}
          </Flex>
        )}

        {uploadedFiles.length > 0 && <FileGrid files={uploadedFiles} />}
      </Flex>
    </Container>
  );
};

export default DevFileStorageUpload;
