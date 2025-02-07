import React, { forwardRef, useCallback, useImperativeHandle } from "react";

import FormItem from "./components/Item";
import FormKeep from "./components/Keep";
import FormLabel from "./components/Label";
import FormProvider from "./components/Provider";
import FormSync from "./components/Sync";

import { filterUndefined } from "@/utils/tools";

import type { Field, FormContextProps, FormProviderConfiguration } from "./context/FormContext";

import { FormContextProvider, useFormContext } from "./context/FormContext";

export type FormActions =
  Pick<FormContextProps, "setFieldValue" | "getFieldValue" | "getFieldsValue" | "getFieldsFormattedValue" | "setFields" | "getFields" | "resetFields" | "setFieldError" | "getFieldError" | "validateFields" | "isFieldsTouched">
  & {
    submit: () => Promise<Record<string, any> | undefined>;
    reset: () => void;
  };

export type FormProps =
  & FormProviderConfiguration
  & {
    // goes to FormProvider
    initialValues?: Record<string, any>;
    onFieldsChange?: (changedFields: Array<{ name: string[]; value: any }>, allFields: Array<{ name: string[]; value: any }>) => void;
    onValuesChange?: (changedValues: Record<string, any>, allValues: Record<string, any>) => void;

    // goes to InnerForm
    omitNil?: boolean;
    onFinish?: (values: Record<string, any>) => void;
    onFinishFailed?: (errors: Pick<Field, "name" | "errors">[]) => void;
    children: React.ReactNode;
  };

const InnerForm = forwardRef<FormActions, FormProps>(({
  omitNil = true,
  onFinish,
  onFinishFailed,
  children,
}, ref) => {
  const context = useFormContext();

  const handleSubmit = useCallback(async () => {
    const errors = await context.validateFields();
    if (errors) {
      onFinishFailed?.(errors);
      return;
    }
    const values = omitNil ? filterUndefined(context.getFieldsValue(), true) : context.getFieldsValue();

    try {
      onFinish?.(values);
    } catch (e) {
      console.log("[taro-form-react] onFinish method errored: ", e);
    }

    return values;
  }, [context, omitNil, onFinish, onFinishFailed]);

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: context.resetFields,
    setFieldValue: context.setFieldValue,
    getFieldValue: context.getFieldValue,
    getFieldsValue: context.getFieldsValue,
    getFieldsFormattedValue: context.getFieldsFormattedValue,
    setFields: context.setFields,
    getFields: context.getFields,
    resetFields: context.resetFields,
    setFieldError: context.setFieldError,
    getFieldError: context.getFieldError,
    validateFields: context.validateFields,
    isFieldsTouched: context.isFieldsTouched,
  }), [context.getFieldError, context.getFieldValue, context.getFields, context.getFieldsFormattedValue, context.getFieldsValue, context.isFieldsTouched, context.resetFields, context.setFieldError, context.setFieldValue, context.setFields, context.validateFields, handleSubmit]);

  return children;
});

interface FormComponent extends React.ForwardRefExoticComponent<FormProps & React.RefAttributes<FormActions>> {
  Item: typeof FormItem;
  Provider: typeof FormProvider;
  Label: typeof FormLabel;
  Keep: typeof FormKeep;
  Sync: typeof FormSync;
}

const Form = forwardRef<FormActions, FormProps>((props, ref) => {
  return (
    <FormContextProvider {...props}>
      <InnerForm ref={ref} {...props} />
    </FormContextProvider>
  );
}) as FormComponent;

Form.Item = FormItem;
Form.Provider = FormProvider;
Form.Label = FormLabel;
Form.Keep = FormKeep;
Form.Sync = FormSync;

export default Form;