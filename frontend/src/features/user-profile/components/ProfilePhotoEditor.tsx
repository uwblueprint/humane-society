import React, { useState } from "react";
import { Flex, FormLabel, Image } from "@chakra-ui/react";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import PencilIcon from "../../../assets/icons/pencil.svg";
import ProfilePhotoModal from "./ProfilePhotoModal";

interface ProfilePhotoEditorProps {
  photoUrl?: string;
  onChange: (file: File | null) => void;
}

const ProfilePhotoEditor = ({
  photoUrl,
  onChange,
}: ProfilePhotoEditorProps): React.ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Flex
      direction="column"
      align="center"
      mb="2.5rem"
      gap="0.5rem"
      position="relative"
    >
      <FormLabel m={0} textStyle="body" color="gray.700">
        Profile Picture:
      </FormLabel>
      <Flex position="relative" align="center" justifyContent="center">
        <ProfilePhoto size="large" type="user" image={photoUrl} />
        <Flex
          as="label"
          htmlFor="profile-photo-upload"
          position="absolute"
          right="0"
          top="0"
          width="2.5rem"
          height="2.5rem"
          borderRadius="50%"
          backgroundColor="gray.200"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          border="none"
          zIndex={2}
          onClick={() => setIsModalOpen(true)}
        >
          <Image src={PencilIcon} alt="edit" style={{ stroke: "black" }} />
        </Flex>
      </Flex>
      <ProfilePhotoModal
        isOpen={isModalOpen}
        profilePhoto={photoUrl}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onChange}
        type="user"
      />
    </Flex>
  );
};

export default ProfilePhotoEditor;
