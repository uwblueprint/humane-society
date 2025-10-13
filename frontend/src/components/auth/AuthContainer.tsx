import React from "react";
import { Flex, Box, Text, BoxProps } from "@chakra-ui/react";

type AuthContainerProps = {
    containerProps: BoxProps,
    children: React.ReactNode,
};

const AuthContainer = ({ containerProps, children }: AuthContainerProps): React.ReactElement => {
    return (
    <Flex direction="column" justifyContent="center" {...containerProps}>
        {children}
    </Flex>
    );
}

export default AuthContainer;