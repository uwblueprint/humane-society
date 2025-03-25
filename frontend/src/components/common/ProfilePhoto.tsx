import React from "react";
import { Flex, Image } from "@chakra-ui/react";

export interface ProfilePhotoProps {
  name: string;
  color: string;
  image: string;
}

const ProfilePhoto = ({
  name,
  color,
  image,
}: ProfilePhotoProps): React.ReactElement => (
  <Flex
    padding="0.19rem"
    height="8.69rem"
    width="8.69rem"
    justify="center"
    align="center"
    borderRadius="full"
    backgroundColor={color}
  >
    <Image
      src={image}
      alt={name}
      fit="cover"
      borderRadius="full"
      boxSize="8.06rem"
    />
  </Flex>
);

export default ProfilePhoto;
