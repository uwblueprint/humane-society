import React, { ChangeEvent } from "react";
import {
  FormControl,
  FormLabel,
  Textarea as ChakraTextarea,
  FormErrorMessage,
} from "@chakra-ui/react";

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const TextArea = ({
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  ...props
}: TextAreaProps): React.ReactElement => {
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
      <ChakraTextarea
        minHeight="fit-content"
        size="lg"
        borderRadius="md"
        borderWidth="1px"
        borderColor={error ? "red.500" : "gray.400"}
        bg={disabled ? "gray.100" : "white.default"}
        _placeholder={{ color: "gray.400" }}
        value={value}
        onChange={onChange}
        maxHeight="25rem"
        resize="vertical"
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
      {error && <FormErrorMessage fontSize="12px">{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default TextArea;
