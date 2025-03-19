import React from "react";
import { useHistory } from "react-router-dom";
import { Flex, IconButton, Text, Image } from "@chakra-ui/react";

interface NavLinkProps {
  icon: string;
  ariaLabel: string;
  route: string;
  text: string;
}

const NavLink = ({
  icon,
  ariaLabel,
  route,
  text,
}: NavLinkProps): React.ReactElement => {
  const history = useHistory();

  const handleClick = () => {
    history.push(route);
  };

  return (
    <Flex
      onClick={handleClick}
      cursor="pointer"
      gap="0.25rem"
      alignItems="center"
    >
      <IconButton
        aria-label={ariaLabel}
        fontSize={{ base: "1.25rem", md: "1.5rem" }}
        variant="unstyled"
        icon={<Image src={icon} alt={ariaLabel} boxSize="1.75rem" />}
        display="flex"
        justifyContent="center"
        alignItems="center"
      />
      <Text margin="0" textStyle={{ base: "h4", md: "h5" }}>
        {text}
      </Text>
    </Flex>
  );
};

export default NavLink;
