import React, { useRef, useState } from "react";
import {
  useBreakpointValue,
  Flex,
  Text,
  Image,
  useToast,
} from "@chakra-ui/react";
import ContentModal from "../../../components/common/ContentModal";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ACCEPTED_TYPES,
} from "../../../utils/CommonUtils";

type ModalView = "menu" | "upload" | "preview";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  profilePhoto: string | undefined;
  type: "pet" | "user"
  onClose?: () => void;
  onConfirm?: (file: File | null) => void;
}

export default function ProfilePhotoModal({
  isOpen,
  profilePhoto,
  type,
  onClose,
  onConfirm,
}: ProfilePhotoModalProps) {
  const [view, setView] = useState<ModalView>("menu");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const profilePhotoSize = useBreakpointValue({
    base: "x-large",
    md: "xx-large",
  }) as "x-large" | "xx-large";

  const handleClose = () => {
    setView("menu");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);

    onClose?.();
  };

  const toast = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        position: "top",
        title: "Invalid file format",
        description: "Please upload a JPG, JPEG, or PNG file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (file.size >= MAX_FILE_SIZE_BYTES) {
      toast({
        position: "top",
        title: "File too large",
        description: `File size must be less than ${MAX_FILE_SIZE_MB}MB.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
    setView("preview");
  };

  const menuContent = (
    <Flex justify="center" align="center" backgroundColor="gray.700">
      <ProfilePhoto size={profilePhotoSize} type={type} image={profilePhoto} />
    </Flex>
  );

  const uploadContent = (
    <Flex direction="column" gap="0.5rem" width="100%">
      <Text textStyle="body" color="gray.700" m={0}>
        Click to upload
      </Text>
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="0rem"
        border="0.125rem dashed"
        borderColor="blue.400"
        height={{ base: "12.5rem", md: "20.5rem" }}
        borderRadius="0.5rem"
        p={{ base: "1.5rem", md: "2.5rem" }}
        cursor="pointer"
        bg="gray.50"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault();
        }}
        onDragOver={(event: React.DragEvent<HTMLDivElement>) =>
          event.preventDefault()
        }
      >
        <Text fontSize="2rem" color="gray.600" m={0}>
          ⇧
        </Text>
        <Text
          textStyle={{ base: "caption", md: "body" }}
          color="gray.500"
          textAlign="center"
          m={0}
        >
          Maximum file size: {MAX_FILE_SIZE_MB}MB.
        </Text>
        <Text
          textStyle={{ base: "caption", md: "body" }}
          color="gray.500"
          textAlign="center"
          m={0}
        >
          Accepted formats: JPG, PNG, JPEG
        </Text>
      </Flex>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </Flex>
  );

  const previewContent = (
    <Flex justify="center" align="center" width="100%">
      <Flex
        position="relative"
        boxSize={{ base: "12rem", md: "23rem" }}
        justify="center"
        align="center"
        overflow="hidden"
      >
        {/* Full image shown greyed out */}
        <Image
          src={previewUrl || ""}
          alt="Preview background"
          width="100%"
          height="100%"
          objectFit="cover"
          filter="brightness(0.4)"
        />
        {/* Circular cutout overlay */}
        <Flex
          position="absolute"
          borderRadius="full"
          boxSize={{ base: "12rem", md: "23rem" }}
          overflow="hidden"
        >
          <Image
            src={previewUrl || ""}
            alt="Preview"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Flex>
      </Flex>
    </Flex>
  );

  const getModalProps = () => {
    if (view === "preview") {
      return {
        title: "Upload an Image",
        content: previewContent,
        primaryButtonText: "Confirm",
        onPrimaryClick: () => {
          onConfirm?.(selectedFile);
          handleClose();
        },
        primaryButtonColor: "blue" as const,
        secondaryButtonText: "Replace Image",
        onSecondaryClick: () => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setView("upload");
        },
      };
    }
    if (view === "upload") {
      return {
        title: "Upload an Image",
        content: uploadContent,
        primaryButtonText: undefined,
        onPrimaryClick: undefined,
        primaryButtonColor: "blue" as const,
        secondaryButtonText: undefined,
        onSecondaryClick: undefined,
      };
    }
    return {
      title: "Profile Photo",
      content: menuContent,
      primaryButtonText: "Upload a Photo",
      onPrimaryClick: () => setView("upload"),
      primaryButtonColor: "blue" as const,
      secondaryButtonText: "Use Default",
      onSecondaryClick: () => {
        onConfirm?.(null);
        handleClose();
      },
    };
  };

  const modalProps = getModalProps();

  return (
    <ContentModal
      open={isOpen}
      onClose={handleClose}
      title={modalProps.title}
      content={modalProps.content}
      primaryButtonText={modalProps.primaryButtonText}
      onPrimaryClick={modalProps.onPrimaryClick}
      primaryButtonColor={modalProps.primaryButtonColor}
      secondaryButtonText={modalProps.secondaryButtonText}
      onSecondaryClick={modalProps.onSecondaryClick}
    />
  );
}
