import React from "react";
import {
  FormControl,
  FormLabel,
  Input as ChakraInput,
  FormErrorMessage,
} from "@chakra-ui/react";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  type = "text",
}: InputProps): React.ReactElement => {
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
      <ChakraInput
        size="lg"
        borderRadius="md"
        borderColor={error ? "red.500" : "gray.400"}
        bg={disabled ? "gray.100" : "white.default"}
        _placeholder={{ color: "gray.400" }}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        _disabled={{
          bg: "gray.100",
          color: "gray.500",
          cursor: "not-allowed",
        }}
      />
      {error && <FormErrorMessage fontSize="12px">{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default Input;
