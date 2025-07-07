import React, { ChangeEvent } from "react";
import {
  FormControl,
  FormLabel,
  Input as ChakraInput,
  FormErrorMessage,
} from "@chakra-ui/react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  ...props
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
        value={value}
        onChange={onChange}
        _disabled={{
          bg: "gray.100",
          color: "gray.500",
          cursor: "not-allowed",
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      {error && <FormErrorMessage fontSize="12px">{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default Input;
