import React from "react";
import { Input } from "@chakra-ui/react";

interface ResponsiveEmailInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ResponsiveEmailInput = ({
  value,
  onChange,
}: ResponsiveEmailInputProps): React.ReactElement => {
  return (
    <Input
      fontSize="14px"
      height="2.4rem"
      bg="#FFFFFF"
      placeholder="user@humanesociety.org"
      value={value}
      onChange={onChange}
    />
  );
};

export default ResponsiveEmailInput;
