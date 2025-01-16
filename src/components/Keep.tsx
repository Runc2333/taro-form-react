import React, { useMemo } from "react";

import type { NamePath } from "../types";

import { namePathToString } from "../utils";
import FormItem from "./Item";

export type FormKeepProps = {
  fields: NamePath[];
};

const FormKeep: React.FC<FormKeepProps> = ({ fields }) => {
  const dedupedFields = useMemo(() => {
    const result = new Map<string, NamePath>();

    for (const field of fields) {
      result.set(namePathToString(field), field);
    }

    return Array.from(result.values());
  }, [fields]);

  return dedupedFields.length > 0
    ? dedupedFields.map(field => <FormItem key={namePathToString(field)} name={field} hidden />)
    : null;
};

export default FormKeep;