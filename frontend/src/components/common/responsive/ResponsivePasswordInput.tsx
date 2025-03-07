import React from "react";
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface ResponsivePasswordInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ResponsivePasswordInput = ({
  value,
  onChange,
}: ResponsivePasswordInputProps): React.ReactElement => {
  const [showPassword, setShowPassword] = React.useState(false);
  const handlePasswordClick = () => setShowPassword(!showPassword);

  return (
    <InputGroup size="md">
      <Input
        fontSize="14px"
        height="2.4rem"
        pr="2rem"
        type={showPassword ? "text" : "password"}
        bg="#FFFFFF"
        value={value}
        placeholder="••••••••••"
        onChange={onChange}
      />
      <InputRightElement width="2rem" top="50%" transform="translateY(-50%)">
        {showPassword ? (
          <IconButton
            variant="unstyled"
            isRound
            bg="transparent"
            onClick={handlePasswordClick}
            aria-label="view"
            icon={<ViewIcon/>}
            color="gray.400" 

          />
        ) : (
          <IconButton
            variant="unstyled"
            isRound
            bg="transparent"
            onClick={handlePasswordClick}
            aria-label="hide"
            icon={<ViewOffIcon />}
            color="gray.400" 
          />
        )}
      </InputRightElement>
    </InputGroup>
  );
};

export default ResponsivePasswordInput;
