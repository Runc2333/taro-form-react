import React from "react";

export type Option = {
  label: React.ReactNode;
  value: string | number;
};

export type Name = string | number;
export type NamePath = Name[];

export type Rule =
  | {
    required: boolean;
    message: string;
  }
  | {
    pattern: RegExp;
    message: string;
  }
  | {
    max?: number;
    min?: number;
    message: string;
  }
  | {
    validator: (value: any) => Promise<void | string>;
  };