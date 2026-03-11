// Serves as a general component for a  popup that
// works for mobile and tablet view. Supports up to 2 action buttons
// with red/blue options for the primary button.

import React from "react";
import { Flex, Text, Button, Image } from "@chakra-ui/react";
import CloseIcon from "../../assets/icons/close.svg";

interface ContentModalProps {
  open: boolean; // Controls whether the modal is visible
  title: string; // Title displayed at the top of the modal
  message?: string; // Main message or body text of the modal
  // Primary button props
  content?: React.ReactNode;
  primaryButtonText?: string; // Text for the primary action button
  onPrimaryClick?: () => void; // Function to call when the primary button is clicked
  primaryButtonColor?: "blue" | "red"; // Optional: sets primary button color; defaults to "blue"
  // Secondary button props
  secondaryButtonText?: string; // Optional: text for the secondary button (if shown)
  onSecondaryClick?: () => void; // Optional: function to call when the secondary button is clicked
  onClose?: () => void; // Optional: function to call when the close icon is clicked
}

const ContentModal: React.FC<ContentModalProps> = ({
  open,
  title,
  message,
  content,
  primaryButtonText,
  primaryButtonColor = "blue",
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  onClose,
}) => {
  const hasPrimaryButton = primaryButtonText && onPrimaryClick;
  const hasSecondaryButton = secondaryButtonText && onSecondaryClick;

  if (!open) return null;

  return (
    <Flex
      top="0"
      left="0"
      position="fixed"
      height="100vh"
      width="100vw"
      bg="rgba(26, 32, 44, 0.6)"
      zIndex="1000"
      justifyContent="center"
      alignItems="center"
    >
      {/* Popup Container */}
      <Flex
        bg="white"
        align="left"
        direction="column"
        gap="1rem"
        width={{ base: "15.375rem", md: "29.625rem" }}
        pt={{ base: "0.75rem", md: "2rem" }}
        pb={{ base: "1.5rem", md: "3.6875rem" }}
        pl={{ base: "1.5rem", md: "3rem" }}
        pr={{ base: "1.5rem", md: "3rem" }}
        borderRadius="md"
        boxShadow="lg"
      >
        {/* Title */}
        <Flex align="center" justify="space-between" width="100%">
          <Text
            textStyle={{ base: "bodyBold", md: "h2" }}
            fontWeight="bold"
            color="blue.700"
            textAlign="left"
            m={0}
            flex="1"
          >
            {title}
          </Text>
          <Flex
            as="button"
            type="button"
            align="center"
            justify="flex-end"
            borderRadius="0.5rem"
            border="none"
            cursor="pointer"
            onClick={onClose}
          >
            <Image
              src={CloseIcon}
              boxSize={{ base: "0.875rem", md: "1.25rem" }}
              alt="Close"
            />
          </Flex>
        </Flex>

        {/* Content Area */}
        {content}

        {/* Message Body */}
        <Text
          textStyle={{ base: "caption", md: "body" }}
          color="gray.600"
          lineHeight="150%"
          textAlign="center"
          pl={{ base: "0", md: "2.5rem" }}
          pr={{ base: "0", md: "2.5rem" }}
          m={0}
        >
          {message}
        </Text>

        {/* Buttons */}
        {(hasPrimaryButton || hasSecondaryButton) && (
          <Flex
            height={{ base: hasSecondaryButton ? "4rem" : "2rem", md: "3rem" }}
            minH={{ base: "2rem", md: "3rem" }}
            direction={{ base: "column-reverse", md: "row" }}
            gap={{ base: "0.75rem", md: "1.5rem" }}
            justifyContent="center"
          >
            {/* Secondary Button */}
            {hasSecondaryButton && (
              <Button
                flex="1"
                variant="outline"
                onClick={onSecondaryClick}
                bg="gray.200"
                color="gray.700"
                textStyle={{ base: "caption", md: "button" }}
                fontSize={{ base: "0.725rem", md: "inherit" }}
                _hover={{ bg: "gray.200" }}
                height={{ base: "1.75rem", md: "3rem" }}
                m={0}
              >
                {secondaryButtonText}
              </Button>
            )}
            {/* Primary Button */}
            {hasPrimaryButton && (
              <Button
                type="submit"
                size="lg"
                width="100%"
                variant="solid"
                color={primaryButtonColor === "blue" ? "white" : "red.800"}
                bg={primaryButtonColor === "blue" ? "blue.700" : "red.200"}
                _hover={
                  primaryButtonColor === "blue"
                    ? { bg: "blue.700" }
                    : { bg: "red.200" }
                }
                onClick={onPrimaryClick}
                flex={hasSecondaryButton ? "1" : "unset"}
                textStyle={{ base: "caption", md: "button" }}
                fontSize={{ base: "0.725rem", md: "inherit" }}
                m={0}
              >
                {primaryButtonText}
              </Button>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default ContentModal;
