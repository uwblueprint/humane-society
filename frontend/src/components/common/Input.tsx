import React from "react";
import { Input as ChakraInput, InputProps } from "@chakra-ui/react";

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <ChakraInput
    ref={ref}
    size="lg"
    borderRadius="md"
    borderColor="gray.400"
    bg="white.default"
    _placeholder={{ color: "gray.400" }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

Input.displayName = "Input";

export default Input;
