import { useCallback, useMemo, useRef } from "react";

import { useDeepCompareEffect } from "ahooks";
import { get } from "lodash-es";

import type { FieldRef } from "../context/FormContext";
import type { NamePath } from "../types";

import { useFormContext } from "../context/FormContext";

export type UseFormItemProps = {
  ref: FieldRef;
  name: NamePath;
  initialValue?: any;
  dependencies?: NamePath[];
};

export type UseFormItemResult = {
  value: any;
  errors: string[];
  isTouched: boolean;
  dependencyValues: any[];
  onChange: (value: any) => void;
  onErrorsChange: (errors: string[]) => void;
};

export default function useFormItem ({
  ref,
  name,
  initialValue,
  dependencies,
}: UseFormItemProps): UseFormItemResult {
  const isFieldRegistered = useRef(false);
  const { data, registerField, unregisterField, setFieldValue, setFieldError, getFieldError, isFieldsTouched } = useFormContext();

  useDeepCompareEffect(() => {
    const currentName = name;
    const currentRef = ref;
    registerField(currentName, currentRef, initialValue);
    isFieldRegistered.current = true;

    return () => {
      unregisterField(currentName, currentRef);
      isFieldRegistered.current = false;
    };
  }, [name]);

  const value = useMemo(() => {
    return get(data, name);
  }, [data, name]);

  const errors = isFieldRegistered.current ? getFieldError(name) : [];
  const isTouched = isFieldRegistered.current ? isFieldsTouched([name]) : false;

  const onChange = useCallback((value: any) => {
    setFieldValue(name, value);
  }, [name, setFieldValue]);

  const onErrorsChange = useCallback((errors: string[]) => {
    setFieldError(name, errors);
  }, [name, setFieldError]);

  const dependencyValues = useMemo(() => {
    return (dependencies || []).map(dep => get(data, dep));
  }, [data, dependencies]);

  return {
    value,
    errors,
    isTouched,
    onChange,
    onErrorsChange,
    dependencyValues,
  };
}