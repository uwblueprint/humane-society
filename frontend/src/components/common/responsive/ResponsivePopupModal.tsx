// Serves as a general component for a responsive popup that
// works for mobile and tablet view. Supports up to 2 action buttons
// with red/blue options for the primary button.

import React from "react";
import { Center, Flex, Text, Button } from "@chakra-ui/react";

interface ResponsivePopupModalProps {
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

const ResponsivePopupModal: React.FC<ResponsivePopupModalProps> = ({
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
    <Center
      top="0"
      left="0"
      position="fixed"
      height="100vh"
      width="100vw"
      bg="rgba(26, 32, 44, 0.6)"
      zIndex="1000"
    >
      {/* Popup Container */}
      <Flex
        bg="white"
        align="center"
        direction="column"
        gap={{ base: "20px", md: "30px" }}
        width={{ base: "326px", md: "538px" }}
        pt={{ base: "32px", md: "59px" }}
        pb={{ base: "32px", md: "59px" }}
        pl={{ base: "32px", md: "48px" }}
        pr={{ base: "32px", md: "48px" }}
        borderRadius="md"
        boxShadow="lg"
      >
        {/* Title */}
        <Text
          fontSize={{ base: "20px", md: "40px" }}
          fontWeight="600"
          lineHeight="100%"
          color="blue.700"
          textAlign="center"
        >
          {title}
        </Text>
        {/* Message Body */}
        <Text
          fontSize={{ base: "14px", md: "18px" }}
          fontWeight="400"
          color="gray.600"
          lineHeight="150%"
          textAlign="center"
          pl={{ base: "0px", md: "40px" }}
          pr={{ base: "0px", md: "40px" }}
        >
          {message}
        </Text>

        {/* Buttons */}
        {(hasPrimaryButton || hasSecondaryButton) && (
          <Flex
            height={{ base: hasSecondaryButton ? "80px" : "32px", md: "48px" }}
            minH="32px"
            direction={{ base: "column-reverse", md: "row" }}
            gap={{ base: "16px", md: "24px" }}
            width="100%"
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
                fontSize={{ base: "12px", md: "18px" }}
                _hover={{ bg: "gray.200" }}
                height={{ base: "32px", md: "48px" }}
              >
                {secondaryButtonText}
              </Button>
            )}
            {/* Primary Button */}
            {hasPrimaryButton && (
              <Button
                fontSize={{ base: "12px", md: "18px" }}
                height={{ base: "32px", md: "48px" }}
                minWidth={{ md: "200px" }}
                pl={{ md: "30px" }}
                pr={{ md: "30px" }}
                color={primaryButtonColor === "blue" ? "white" : "red.800"}
                bg={primaryButtonColor === "blue" ? "blue.700" : "red.200"}
                _hover={
                  primaryButtonColor === "blue"
                    ? { bg: "blue.700" }
                    : { bg: "red.200" }
                }
                onClick={onPrimaryClick}
                flex={hasSecondaryButton ? "1" : "unset"}
              >
                {primaryButtonText}
              </Button>
            )}
          </Flex>
        )}
      </Flex>
    </Center>
  );
};

export default ResponsivePopupModal;
