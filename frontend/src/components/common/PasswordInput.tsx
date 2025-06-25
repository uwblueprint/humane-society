import React from "react";
import { IconButton, InputGroup, InputRightElement } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import Input from "./Input";

interface PasswordInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = ({
  value,
  onChange,
}: PasswordInputProps): React.ReactElement => {
  const [showPassword, setShowPassword] = React.useState(false);
  const handlePasswordClick = () => setShowPassword(!showPassword);

  return (
    <InputGroup size="md">
      <Input
        borderRadius="md"
        borderColor="gray.400"
        bg="white.default"
        _placeholder={{ color: "gray.400" }}
        type={showPassword ? "text" : "password"}
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
            icon={<ViewIcon />}
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

export default PasswordInput;
