import React from "react";

import { omit } from "lodash-es";

import { useFormContext } from "@/context/FormContext";
import { useInnerFormContext } from "@/context/InnerFormContext";

export type FormProviderProps = {
  children: (context:
    Omit<ReturnType<typeof useFormContext>, "registerField" | "unregisterField" | "setFieldValue" | "setFields" | "resetFields" | "setFieldError" | "setData"> & ReturnType<typeof useInnerFormContext>
  ) => React.ReactNode;
};

const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const context = omit(
    useFormContext(),
    ["registerField", "unregisterField", "setFieldValue", "setFields", "resetFields", "setFieldError", "setData"],
  );

  const innerContext = useInnerFormContext();

  return <>{children({ ...context, ...innerContext })}</>;
};

export default FormProvider;