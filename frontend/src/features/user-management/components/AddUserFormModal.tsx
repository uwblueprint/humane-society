import React, { useState } from "react";
import { JSONSchema7 } from "json-schema";
import { Form } from "@rjsf/bootstrap-4";
import { IChangeEvent, ISubmitEvent } from "@rjsf/core";

export interface AddUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: "Administrator" | "Animal Behaviourist" | "Staff" | "Volunteer";
}

interface AddUserFormModalProps {
  onSubmit: (formData: AddUserRequest) => Promise<void>;
}

const userSchema: JSONSchema7 = {
  title: "Invite a user",
  description: "Enter user details to send an invite",
  type: "object",
  required: ["firstName", "lastName", "phoneNumber", "email", "role"],
  properties: {
    firstName: { type: "string", title: "First Name" },
    lastName: { type: "string", title: "Last Name" },
    phoneNumber: { type: "string", title: "Phone Number" },
    email: { type: "string", format: "email", title: "Email" },
    role: {
      type: "string",
      title: "Role",
      enum: ["Administrator", "Animal Behaviourist", "Staff", "Volunteer"],
      default: "Staff",
    },
  },
};

const uiSchema = {
  role: {
    "ui:widget": "select",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validate = (formData: AddUserRequest, errors: any) => {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  const phoneRegex2 = /^\d{10}$/;
  if (
    !phoneRegex.test(formData.phoneNumber) &&
    !phoneRegex2.test(formData.phoneNumber)
  ) {
    errors.phoneNumber.addError("Phone number must be in xxx-xxx-xxxx format.");
  }
  if (!formData.email.includes("@")) {
    errors.email.addError("Email must be in address@domain format.");
  }
  return errors;
};

const AddUserFormModal = ({
  onSubmit,
}: AddUserFormModalProps): React.ReactElement => {
  const [formFields, setFormFields] = useState<AddUserRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async ({ formData }: ISubmitEvent<AddUserRequest>) => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      setFormFields(null);
    } catch (err) {
      setError("An error occurred while sending the invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form
        formData={formFields}
        schema={userSchema}
        uiSchema={uiSchema}
        validate={validate}
        onChange={({ formData }: IChangeEvent<AddUserRequest>) =>
          setFormFields(formData)
        }
        onSubmit={handleSubmit}
      >
        <div style={{ textAlign: "center" }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </Form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddUserFormModal;
