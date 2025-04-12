import { useEffect, useMemo, useRef } from "react";

import { get, isEqual } from "lodash-es";

import { isEmpty } from "@/utils/tools";

import { useFormContext } from "@/context/FormContext";
import { namePathToString } from "@/utils";

import type { NamePath } from "@/types";

export type FormSyncProps =
  | {
    source: NamePath;
    target: NamePath[];
  }
  | {
    fields: NamePath[];
  };

const FormSync: React.FC<FormSyncProps> = props => {
  const { data, setFields } = useFormContext();

  const dedupedFields = useMemo(() => {
    const result = new Map<string, NamePath>();
    if ("fields" in props) {
      for (const field of props.fields) {
        result.set(namePathToString(field), field);
      }
    } else {
      result.set(namePathToString(props.source), props.source);
      for (const targetField of props.target) {
        result.set(namePathToString(targetField), targetField);
      }
    }
    return Array.from(result.values());
  }, [props]);

  const memorizedValues = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    const setQuery: any[] = [];
    if (!("fields" in props)) {
      const name = namePathToString(props.source);
      const value = get(data, props.source);
      if (
        !isEqual(memorizedValues.current.get(name), value)
      ) {
        for (const targetField of props.target) {
          setQuery.push({ name: targetField, value });
        }
      }
      memorizedValues.current.set(name, value);
    } else {
      for (const field of dedupedFields) {
        const name = namePathToString(field);
        const value = get(data, field);
        let shouldBreak = false;
        if (
          !isEqual(memorizedValues.current.get(name), value)
        ) {
          shouldBreak = true;
          for (const field of dedupedFields) {
            const name2 = namePathToString(field);
            if (name2 !== name) {
              setQuery.push({ name: field, value });
              memorizedValues.current.set(name2, value);
            }
          }
        }
        memorizedValues.current.set(name, value);
        if (shouldBreak) {
          break;
        }
      }
    }
    if (!isEmpty(setQuery)) {
      setFields(setQuery);
    }
  }, [props, data, dedupedFields, setFields]);

  return null;
};

export default FormSync;