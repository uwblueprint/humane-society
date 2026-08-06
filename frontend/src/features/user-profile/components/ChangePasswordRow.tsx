import React from "react";
import { Flex } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import PasswordInput from "../../../components/common/PasswordInput";
import Button from "../../../components/common/Button";

// "Change Password" sends you to the forgot-password email flow instead.
const ChangePasswordRow = (): React.ReactElement => {
  const history = useHistory();

  const handleChangePassword = () => {
    history.push("/forgot-password");
  };

  return (
    <Flex width="100%" gap="1.5rem" alignItems="end">
      <Flex flex={1}>
        <PasswordInput label="Password" value="" disabled showToggle={false} />
      </Flex>
      <Flex flex={1} align="center">
        <Button
          variant="dark-blue"
          size="large"
          width="100%"
          type="button"
          onClick={handleChangePassword}
        >
          Change Password
        </Button>
      </Flex>
    </Flex>
  );
};

export default ChangePasswordRow;
