import React from "react";
import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {
  size?: "x-small" | "small" | "medium" | "large";
  variant?:
    | "dark-blue"
    | "blue"
    | "blue-outline"
    | "white"
    | "gray"
    | "gray-outline"
    | "green"
    | "red";
}

const SIZE_STYLES = {
  "x-small": {
    paddingY: "0.5rem",
    paddingX: "0.75rem",
    fontSize: "0.875rem",
  },
  small: {
    paddingY: "0.5rem",
    paddingX: "1rem",
    fontSize: "1.125rem",
  },
  medium: {
    paddingY: "0.625rem",
    paddingX: "1.25rem",
    fontSize: "1.125rem",
  },
  large: {
    paddingY: "0.625rem",
    paddingX: "1.875rem",
    fontSize: "1.5rem",
  },
};

const VARIANT_STYLES = {
  "dark-blue": {
    bg: "blue.700",
    color: "gray.100",
    border: "none",
    borderColor: undefined,
  },
  blue: {
    bg: "blue.500",
    color: "gray.100",
    border: "none",
    borderColor: undefined,
  },
  "blue-outline": {
    bg: "transparent",
    color: "blue.500",
    border: "1px solid",
    borderColor: "blue.500",
  },
  white: {
    bg: "gray.100",
    color: "gray.700",
    border: "none",
    borderColor: undefined,
  },
  gray: {
    bg: "gray.200",
    color: "gray.700",
    border: "none",
    borderColor: undefined,
  },
  "gray-outline": {
    bg: "transparent",
    color: "gray.700",
    border: "1px solid",
    borderColor: "gray.200",
  },
  green: {
    bg: "green.200",
    color: "green.800",
    border: "none",
    borderColor: undefined,
  },
  red: {
    bg: "red.200",
    color: "red.800",
    border: "none",
    borderColor: undefined,
  },
};

const Button = ({
  size = "medium",
  variant = "blue",
  children,
  onClick,
  disabled,
  type,
  isLoading,
}: CustomButtonProps) => {
  const sizing = SIZE_STYLES[size];
  const styles = VARIANT_STYLES[variant];

  return (
    <ChakraButton
      height="fit-content"
      textStyle="button"
      fontFamily="Poppins"
      fontWeight={500}
      fontSize={sizing.fontSize}
      py={sizing.paddingY}
      px={sizing.paddingX}
      borderRadius="0.375rem"
      bg={styles.bg}
      color={styles.color}
      border={styles.border}
      borderColor={styles.borderColor}
      _hover={{ opacity: 0.75 }}
      _active={{ opacity: 0.8 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      isLoading={isLoading}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;
