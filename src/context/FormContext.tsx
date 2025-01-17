import React, { createContext, useCallback, useContext, useState } from "react";

import { cloneDeep, get, merge, set, unset } from "lodash-es";

import useMap from "../hooks/useMap";

import type { FormLabelProps } from "../components/Label";
import type { NamePath } from "../types";

import { namePathToString } from "../utils";

export type FieldTransformResult = {
  __form_internals_should_merge?: boolean;
  value: any;
};

export type FieldRefActions = {
  validate: () => (void | string[] | Promise<void | string[]>);
  // transform 会将返回的对象 merge 到整个表单的 data 中
  // 如果设置了 transform 且 __form_internals_should_merge 为 true
  // 那么 field 的 name 会被忽略（仅在使用 getFieldsFormattedValue 时有效）
  // 否则会直接使用返回的值
  transform?: () => FieldTransformResult | Promise<FieldTransformResult>;
};
export type FieldRef = React.RefObject<FieldRefActions>;

export type Field = {
  refs: FieldRef[];
  name: NamePath;
  touched: boolean;
  errors: string[];
  initialValue?: any;
  count: number;
};

export type FormContextProps = {
  initialValues?: Record<string, any>;

  showError?: boolean;
  colon?: boolean;
  labelProps?: FormLabelProps;
  layout?: "horizontal" | "vertical";
  validateFirst?: boolean | "parallel";
  showErrors?: boolean;
  passthroughErrors?: boolean;
  // merge 会将 transform 返回的对象 merge 到整个表单的 data 中
  // replace 会直接使用 transform 返回的值填充到对应的 field 中
  transformBehavior?: "merge" | "replace";
  // 限制 onChange 的触发频率
  // throttle(updateTickLimit: number) ms 内只会触发一次 onChange
  // 默认为 50
  // 过小的值可能导致数据异常
  updateTickLimit?: number;
  getRequiredMessage?: (label: string) => string;

  data: Record<string, any>;
  setData: (data: Record<string, any>) => void;

  fields: Map<string, Field>;
  registerField: (name: NamePath, ref: FieldRef, initialValue?: any) => void;
  unregisterField: (name: NamePath, ref: FieldRef) => void;

  setFieldValue: (name: NamePath, value: any) => void;
  getFieldValue: (name: NamePath) => any;
  getFieldsValue: (nameList?: NamePath[]) => Record<string, any>;
  getFieldsFormattedValue: (nameList?: NamePath[]) => Promise<Record<string, any>>;

  setFields: (
    fields: Array<
      Pick<Field, "name">
      & { touched?: boolean; }
      & { value?: any }
    >
  ) => void;
  getFields: (nameList?: NamePath[]) => Array<
    Pick<Field, "name" | "touched" | "errors">
    & { value: any }
  >;

  resetFields: (nameList?: NamePath[]) => void;

  setFieldError: (name: NamePath, errors: string[]) => void;
  getFieldError: (name: NamePath) => string[];

  validateFields: (nameList?: NamePath[]) => Promise<void | Pick<Field, "name" | "errors">[]>;

  isFieldsTouched: (nameList?: NamePath[], options?: { allTouched?: boolean }) => boolean;
};

const FormContext = createContext<FormContextProps | undefined>(void 0);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

export type FormProviderConfiguration = Pick<FormContextProps, "colon" | "labelProps" | "layout" | "validateFirst" | "showErrors" | "passthroughErrors" | "transformBehavior" | "updateTickLimit" | "getRequiredMessage">;

export type FormProviderProps =
  & FormProviderConfiguration
  & Pick<FormContextProps, "initialValues">
  & {
    onFieldsChange?: (changedFields: Array<{ name: NamePath; value: any }>, allFields: Array<{ name: NamePath; value: any }>) => void;
    onValuesChange?: (changedValues: Record<string, any>, allValues: Record<string, any>) => void;
    children: React.ReactNode;
  };

export const FormContextProvider: React.FC<FormProviderProps> = ({
  initialValues,
  onFieldsChange,
  onValuesChange,
  children,
  ...props
}) => {
  const [fields, { set: setField, get: getField, remove: removeField }] = useMap<string, Field>();
  const [data, setData] = useState<Record<string, any>>({});

  const registerField = useCallback<FormContextProps["registerField"]>((name, ref, initialValue) => {
    const nameString = namePathToString(name);
    const value = initialValue ?? get(initialValues, name);
    setData(data => {
      const nextData = cloneDeep(data);
      set(nextData, name, value);
      return nextData;
    });

    const field = getField(nameString);
    if (field) {
      console.warn(`Field "${nameString}" is already registered, register multiple times may cause unexpected behavior.`);
    }
    const fieldToSet = field
      ? {
        ...field,
        refs: [...field.refs, ref],
        initialValue,
        count: field.count + 1,
      }
      : {
        refs: [ref],
        name,
        touched: false,
        errors: [],
        initialValue,
        count: 1,
      };
    setField(nameString, fieldToSet);

    onFieldsChange?.(
      [{ name, value }],
      Array.from(fields.values()).map(field => ({ name: field.name, value: get(data, field.name) })).concat([{ name, value }]),
    );
  }, [data, fields, getField, initialValues, onFieldsChange, setField]);

  const unregisterField = useCallback<FormContextProps["unregisterField"]>((name, ref) => {
    const nameString = namePathToString(name);
    const field = getField(nameString);
    if (field) {
      if (field.count === 1) {
        removeField(nameString);
        setData(data => {
          const nextData = cloneDeep(data);
          unset(nextData, name);
          return nextData;
        });
        onFieldsChange?.(
          [{ name, value: get(data, name) }],
          Array.from(fields.values()).map(field => ({ name: field.name, value: get(data, field.name) })).filter(f => f.name !== name),
        );
      } else {
        setField(nameString, {
          ...field,
          count: field.count - 1,
          refs: field.refs.filter(r => r !== ref),
        });
      }
    } else {
      console.warn(`Attempted to unregister field "${nameString}" that was never registered.`);
    }
  }, [data, fields, getField, onFieldsChange, removeField, setField]);

  const setFieldValue = useCallback<FormContextProps["setFieldValue"]>((name, value) => {
    const nameString = namePathToString(name);
    const field = getField(nameString);
    if (!field) {
      console.warn(`Attempted to set value for field "${nameString}" that was never registered.`);
      return;
    }

    setData(data => {
      const nextData = cloneDeep(data);
      set(nextData, name, value);
      return nextData;
    });

    setField(nameString, { ...field, touched: true });

    if (onValuesChange) {
      const changes = {};
      set(changes, name, value);
      const all = cloneDeep(data);
      set(all, name, value);
      onValuesChange(changes, all);
    }
  }, [data, getField, onValuesChange, setField]);

  const getFieldValue = useCallback<FormContextProps["getFieldValue"]>(name => {
    return get(data, name);
  }, [data]);

  const getFieldsValue = useCallback<FormContextProps["getFieldsValue"]>(nameList => {
    if (!nameList) return data;

    const result = {} as Record<string, any>;
    for (const name of nameList) {
      const value = get(data, name);
      set(result, name, value);
    }
    return result;
  }, [data]);

  const getFieldsFormattedValue = useCallback<FormContextProps["getFieldsFormattedValue"]>(async nameList => {
    const realNameList = nameList ?? Array.from(fields.values()).map(field => field.name);

    const result = {} as Record<string, any>;

    for (const name of realNameList) {
      const field = getField(namePathToString(name));
      if (!field) {
        console.warn(`Attempted to get formatted value for field "${namePathToString(name)}" that was never registered.`);
        continue;
      }

      if (
        field.refs.some(ref => !ref.current)
      ) {
        console.warn(`Attempted to get formatted value for field "${namePathToString(name)}" that has no or missing ref.`);
        continue;
      }

      // only consider the last ref's transform result
      const transformFunc = field.refs[field.refs.length - 1].current!.transform;
      if (!transformFunc) {
        set(result, name, get(data, name));
      } else {
        const transformedValue = await transformFunc();
        if (transformedValue.__form_internals_should_merge) {
          merge(result, transformedValue.value);
        } else {
          set(result, name, transformedValue);
        }
      }
    }

    return result;
  }, [data, fields, getField]);

  const setFields = useCallback<FormContextProps["setFields"]>(fields => {
    setData(data => {
      const changes = {};
      const nextData = cloneDeep(data);
      for (const fieldData of fields) {
        const nameString = namePathToString(fieldData.name);
        const field = getField(namePathToString(fieldData.name));
        if (!field) {
          console.warn(`Attempted to set field "${nameString}" that was never registered.`);
          continue;
        }

        if (fieldData.touched !== undefined) {
          setField(nameString, { ...field, touched: fieldData.touched });
        }

        set(nextData, fieldData.name, fieldData.value);
        set(changes, fieldData.name, fieldData.value);

      }
      setTimeout(() => {
        onValuesChange?.(changes, merge(cloneDeep(data), nextData));
      }, 0);
      return nextData;
    });
  }, [getField, onValuesChange, setField]);

  const getFields = useCallback<FormContextProps["getFields"]>(nameList => {
    if (!nameList) {
      return Array
        .from(fields.values())
        .map(field => ({ ...field, value: get(data, field.name) }));
    }

    const result = [] as ReturnType<FormContextProps["getFields"]>;
    for (const name of nameList) {
      const field = getField(namePathToString(name));
      if (!field) {
        console.warn(`Attempted to get field "${namePathToString(name)}" that was never registered.`);
        continue;
      }

      const value = get(data, name);
      result.push({ ...field, value });
    }
    return result;
  }, [data, fields, getField]);

  const resetFields = useCallback<FormContextProps["resetFields"]>(nameList => {
    const fieldsToReset =
      nameList
        ?.map(name => {
          const nameString = namePathToString(name);
          const field = getField(nameString);
          if (!field) {
            console.warn(`Attempted to reset field "${nameString}" that was never registered.`);
            return undefined;
          }
          return field;
        })
        .filter(v => v !== undefined)
      ?? Array.from(fields.values());

    for (const field of fieldsToReset) {
      setData(data => {
        const nextData = cloneDeep(data);
        set(nextData, field.name, field.initialValue ?? get(initialValues, field.name));
        return nextData;
      });

      setField(namePathToString(field.name), { ...field, touched: false });
    }
  }, [fields, getField, initialValues, setField]);

  const setFieldError = useCallback<FormContextProps["setFieldError"]>((name, errors) => {
    const nameString = namePathToString(name);
    const field = getField(nameString);
    if (!field) {
      console.warn(`Attempted to set errors for field "${nameString}" that was never registered.`);
      return;
    }

    setField(nameString, { ...field, errors });
  }, [getField, setField]);

  const getFieldError = useCallback<FormContextProps["getFieldError"]>(name => {
    const field = getField(namePathToString(name));
    if (!field) {
      console.warn(`Attempted to get errors for field "${namePathToString(name)}" that was never registered.`);
      return [];
    }
    return field.errors;
  }, [getField]);

  const validateFields = useCallback<FormContextProps["validateFields"]>(async nameList => {
    const fieldsToValidate =
      nameList
        ?.map(name => {
          const nameString = namePathToString(name);
          const field = getField(nameString);
          if (!field) {
            console.warn(`Attempted to validate field "${nameString}" that was never registered.`);
            return undefined;
          }
          return field;
        })
        .filter(v => v !== undefined)
      ?? Array.from(fields.values());

    const errors = [] as Pick<Field, "name" | "errors">[];

    for (const field of fieldsToValidate) {
      if (
        field.refs.some(ref => !ref.current)
      ) {
        console.warn(`Attempted to validate field "${namePathToString(field.name)}" that has no or missing ref.`);
        continue;
      }

      const result = await Promise.all(field.refs.map(ref => ref.current!.validate()));
      const resultErrors = Array.from(new Set(result.flat().filter(Boolean))) as string[];
      if (resultErrors.length > 0) {
        errors.push({
          name: field.name,
          errors: resultErrors,
        });
      }
    }

    return errors.length > 0 ? errors : void 0;
  }, [fields, getField]);

  const isFieldsTouched = useCallback<FormContextProps["isFieldsTouched"]>((nameList, options) => {
    const { allTouched = false } = options ?? {};

    const fieldsToCheck =
      nameList
        ?.map(name => {
          const nameString = namePathToString(name);
          const field = getField(nameString);
          if (!field) {
            console.warn(`Attempted to check if field "${nameString}" is touched but it was never registered.`);
            return undefined;
          }
          return field;
        })
        .filter(v => v !== undefined)
      ?? Array.from(fields.values());

    return allTouched
      ? fieldsToCheck.every(field => field.touched)
      : fieldsToCheck.some(field => field.touched);
  }, [fields, getField]);

  return (
    <FormContext.Provider
      value={{
        initialValues,

        ...props,

        data,
        setData,

        fields,
        registerField,
        unregisterField,

        setFieldValue,
        getFieldValue,
        getFieldsValue,
        getFieldsFormattedValue,

        setFields,
        getFields,

        resetFields,

        setFieldError,
        getFieldError,

        validateFields,

        isFieldsTouched,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};