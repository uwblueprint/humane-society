import React from "react";
import { Flex, Box, Text, BoxProps } from "@chakra-ui/react";

type AuthContainerProps = {
    children: React.ReactNode,
};

const authContainerProps: BoxProps = {
    bg: "gray.50",
    display: "flex",
    flexDirection: "column",
    width: { base: "21.5625", md: "28.875rem" },
    px: { base: "2.5rem", md: "3.75rem" },
    py: { base: "2.5rem", md: "4rem" },
    gap: { base: "2.25rem", md: "2.25rem" },
    borderRadius: { base: "0.375rem", md: "0.375rem" },
};

const AuthContainer = ({ children }: AuthContainerProps): React.ReactElement => {
    return (
    <Flex direction="column" justifyContent="center" {...authContainerProps}>
        {children}
    </Flex>
    );
}

export default AuthContainer;