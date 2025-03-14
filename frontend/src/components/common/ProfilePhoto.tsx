import React from "react";
import { Flex, Image } from "@chakra-ui/react";

export interface ProfilePhotoProps {
    name: string;
    color: string;
    image: string;
}

const ProfilePhoto = ({ name, color, image }: ProfilePhotoProps): React.ReactElement => (
    <Flex
        padding="0.25rem"
        height="9.125rem"
        width="9.125rem"
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
