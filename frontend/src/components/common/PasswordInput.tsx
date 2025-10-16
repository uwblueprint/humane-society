import React, { ChangeEvent, useState } from "react";
import {
  FormControl,
  FormLabel,
  Input as ChakraInput,
  FormErrorMessage,
  IconButton,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showToggle?: boolean;
}

const PasswordInput = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  showToggle = true,
  ...props
}: PasswordInputProps): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordToggle = () => setShowPassword(!showPassword);

  return (
    <FormControl isInvalid={!!error} isRequired={required}>
      {label && (
        <FormLabel
          mb="8px"
          fontSize="14px"
          fontWeight="500"
          color={error ? "red.500" : "gray.600"}
        >
          {label}
        </FormLabel>
      )}
      <InputGroup size="lg">
        <ChakraInput
          type={showPassword ? "text" : "password"}
          size="lg"
          borderRadius="md"
          borderWidth="1px"
          borderColor={error ? "red.500" : "gray.400"}
          bg={disabled ? "gray.100" : "white.default"}
          _placeholder={{ color: "gray.400" }}
          placeholder="••••••••••"
          value={value}
          onChange={onChange}
          disabled={disabled}
          _focus={{
            borderColor: error ? "red.500" : "blue.500",
            boxShadow: error ? "0 0 0 1px red" : "0 0 0 1px blue",
          }}
          _disabled={{
            bg: "gray.100",
            color: "gray.500",
            cursor: "not-allowed",
          }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
        {showToggle && (
          <InputRightElement>
            <IconButton
              variant="unstyled"
              size="sm"
              onClick={handlePasswordToggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              color="gray.400"
              _hover={{ color: "gray.600" }}
            />
          </InputRightElement>
        )}
      </InputGroup>
      {error && <FormErrorMessage fontSize="12px">{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default PasswordInput;
