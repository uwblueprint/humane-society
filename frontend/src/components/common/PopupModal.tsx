// Serves as a general component for a  popup that
// works for mobile and tablet view. Supports up to 2 action buttons
// with red/blue options for the primary button.

import React from "react";
import { Flex, Text, Button } from "@chakra-ui/react";

interface PopupModalProps {
  open: boolean; // Controls whether the modal is visible
  title: string; // Title displayed at the top of the modal
  message: string; // Main message or body text of the modal
  // Primary button props
  primaryButtonText?: string; // Text for the primary action button
  onPrimaryClick?: () => void; // Function to call when the primary button is clicked
  primaryButtonColor?: "blue" | "red"; // Optional: sets primary button color; defaults to "blue"
  // Secondary button props
  secondaryButtonText?: string; // Optional: text for the secondary button (if shown)
  onSecondaryClick?: () => void; // Optional: function to call when the secondary button is clicked
}

const PopupModal: React.FC<PopupModalProps> = ({
  open,
  title,
  message,
  primaryButtonText,
  primaryButtonColor = "blue",
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
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
        align="center"
        direction="column"
        gap={{ base: "1.25rem", md: "1.875rem" }}
        width={{ base: "20.375rem", md: "33.625rem" }}
        pt={{ base: "2rem", md: "3.6875rem" }}
        pb={{ base: "2rem", md: "3.6875rem" }}
        pl={{ base: "2rem", md: "3rem" }}
        pr={{ base: "2rem", md: "3rem" }}
        borderRadius="md"
        boxShadow="lg"
      >
        {/* Title */}
        <Text
          textStyle={{ base: "h3", md: "h1" }}
          color="blue.700"
          textAlign="center"
          m={0}
        >
          {title}
        </Text>
        {/* Message Body */}
        <Text
          textStyle={{ base: "bodyMobile", md: "body" }}
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
            height={{ base: hasSecondaryButton ? "5rem" : "2rem", md: "3rem" }}
            minH="2rem"
            direction={{ base: "column-reverse", md: "row" }}
            gap={{ base: "1rem", md: "1.5rem" }}
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
                _hover={{ bg: "gray.200" }}
                height={{ base: "2rem", md: "3rem" }}
                pl={ "2rem" }
                pr={ "2rem" }
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
                m={0}
                pl={ "2rem" }
                pr={ "2rem" }
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

export default PopupModal;
