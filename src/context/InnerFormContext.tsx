import { createContext, useContext } from "react";

export type InnerFormContextProps = {
  submit: () => Promise<Record<string, any> | undefined>;
  reset: () => void;
};

export const InnerFormContext = createContext<InnerFormContextProps | undefined>(void 0);

export const useInnerFormContext = () => {
  const context = useContext(InnerFormContext);
  if (!context) {
    throw new Error("useInnerFormContext must be used within a InnerFormContextProvider");
  }
  return context;
};