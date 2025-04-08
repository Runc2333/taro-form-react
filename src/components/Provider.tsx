import React from "react";

import { omit } from "lodash-es";

import { useFormContext } from "../context/FormContext";

export type FormProviderProps = {
  children: (context: Omit<ReturnType<typeof useFormContext>, "registerField" | "unregisterField" | "setFieldValue" | "setFields" | "resetFields" | "setFieldError" | "setData">) => React.ReactNode;
};

const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const context = omit(
    useFormContext(),
    ["registerField", "unregisterField", "setFieldValue", "setFields", "resetFields", "setFieldError", "setData"],
  );

  return <>{children(context)}</>;
};

export default FormProvider;