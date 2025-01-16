import React from "react";

import { useFormContext } from "../context/FormContext";

export type FormProviderProps = {
  children: (context: ReturnType<typeof useFormContext>) => React.ReactNode;
};

const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const context = useFormContext();

  return <>{children(context)}</>;
};

export default FormProvider;