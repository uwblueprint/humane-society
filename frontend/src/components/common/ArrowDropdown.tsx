import React from "react";
import { Box, Flex, Icon, Image, Text } from "@chakra-ui/react";
import useOpenController from "./petlist/useOpenController";
import { ReactComponent as ExpandIcon } from "../../assets/icons/expand.svg";

export interface ArrowDropdownProps {
  headerText: string;
  iconSrc?: string;
  bodyText: string;
}

// Dropdown with optional icon on left of text and dropdown content is always
// text
const ArrowDropdown = ({
  headerText,
  iconSrc,
  bodyText,
}: ArrowDropdownProps): React.ReactElement => {
  const { isOpen, toggle } = useOpenController(false);

  return (
    <>
      <Flex
        key={headerText}
        width="100%"
        justify="space-between"
        alignItems="center"
      >
        <Flex gap="0.5rem" alignItems="center">
          {iconSrc && (
            <Box
              boxSize="2.5rem"
              bg="gray.100"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image src={iconSrc} alt={headerText} boxSize="1.2rem" />
            </Box>
          )}
          <Text textStyle="body" fontSize="16px" m={0}>
            {headerText}
          </Text>
        </Flex>
        <Box
          as="button"
          type="button"
          aria-label="expand or close section"
          onClick={toggle}
        >
          <Icon
            boxSize="1.5rem"
            as={ExpandIcon}
            transform={`rotate(${isOpen ? 180 : 0}deg)`}
            transition="all 0.25s"
          />
        </Box>
      </Flex>
      {isOpen && (
        <Text textStyle="body" fontSize="16px">
          {bodyText}
        </Text>
      )}
    </>
  );
};

export default ArrowDropdown;
