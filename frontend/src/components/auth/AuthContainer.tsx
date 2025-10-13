import React from "react";
import { Flex, Box, Text, BoxProps } from "@chakra-ui/react";

type AuthContainerProps = {
    authContainerProps: BoxProps,
    children: React.ReactNode,
};

const AuthContainer = ({ authContainerProps, children }: AuthContainerProps): React.ReactElement => {
    return (
    <Flex direction="column" justifyContent="center" {...authContainerProps}>
        {children}
    </Flex>
    );
}

export default AuthContainer;