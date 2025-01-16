import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { View } from "@tarojs/components";
import classNames from "classnames";

import useFormConfiguration from "../hooks/useFormConfiguration";
import useFormItem from "../hooks/useFormItem";

import { validateRules } from "../utils/rules";

import type { FieldRefActions, FormProviderConfiguration } from "../context/FormContext";
import type { NamePath, Rule } from "../types";

import FormLabel from "./Label";
import { isNull } from "lodash-es";

export type FormItemProps =
  & FormProviderConfiguration
  & {
    name: NamePath;
    dependencies?: NamePath[];
    noStyle?: boolean;
    required?: boolean;
    trigger?: string;
    valuePropName?: string;
    getValueFromEvent?: (...args: any[]) => any;
    label?: React.ReactNode;
    initialValue?: any;
    rules?: Rule[];
    validateTrigger?: string[];
    className?: classNames.Argument;
    innerClassName?: classNames.Argument;
    transform?: (value: any) => any;
  }
  & (
    | {
      hidden?: false;
      children: JSX.Element;
    }
    | {
      hidden: true;
      children?: any;
    }
  );

const FormItem: React.FC<FormItemProps> = ({
  hidden,
  name,
  required,
  trigger = "onChange",
  valuePropName = "value",
  getValueFromEvent = (...args: any[]) => args[0],
  dependencies,
  label = null,
  noStyle,
  initialValue,
  rules,
  validateTrigger: pValidateTrigger,
  className,
  innerClassName,
  transform,
  children,
  // configuration props within FormProvider
  ...props
}) => {
  const ref = useRef<FieldRefActions>({
    validate: () => Promise.resolve(),
  });

  const { value, errors, isTouched, dependencyValues, onChange, onErrorsChange } = useFormItem({
    ref,
    name,
    initialValue,
    dependencies,
  });

  const {
    colon,
    labelProps,
    layout,
    validateFirst,
    showErrors,
    passthroughErrors,
    transformBehavior,
    getRequiredMessage,
  } = useFormConfiguration(props);

  const allRules = useMemo(() => {
    if (required && !rules?.some(rule => "required" in rule)) {
      return [
        { required: true, message: getRequiredMessage(String(label)) },
        ...rules ?? [],
      ];
    }
    return rules;
  }, [getRequiredMessage, label, required, rules]);

  const handleValidate = useCallback(async (params: { value?: any } = {}) => {
    const errors = await validateRules(
      "value" in params ? params.value : value,
      allRules ?? [],
      validateFirst,
    );
    onErrorsChange(errors ?? []);

    return errors;
  }, [value, allRules, validateFirst, onErrorsChange]);

  useEffect(() => {
    const nextRef: FieldRefActions = {
      validate: handleValidate,
    };

    if (transform) {
      nextRef.transform = async () => {
        const transformed = await transform(value);
        return {
          __form_internals_should_merge: transformBehavior === "merge",
          value: transformed,
        };
      };
    }

    ref.current = nextRef;
  }, [handleValidate, transform, transformBehavior, value]);

  useEffect(() => {
    isTouched && handleValidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyValues);

  const validateTrigger = useMemo(() => pValidateTrigger ?? [trigger], [pValidateTrigger, trigger]);

  const handleChange = useCallback((...args: any[]) => {
    const newValue = getValueFromEvent(...args);
    onChange(newValue);
    validateTrigger.includes(trigger) && handleValidate({ value: newValue });
    children?.props?.[trigger]?.(...args);
  }, [children?.props, getValueFromEvent, handleValidate, onChange, trigger, validateTrigger]);

  const withValidate = (fn?: (...args: any[]) => void) => {
    return (...args: any[]) => {
      handleValidate();
      fn?.(...args);
    };
  };

  if (hidden) {
    return null;
  }

  const hasError = errors.length > 0;

  const InputComponent = React.cloneElement(children, {
    [trigger]: handleChange,
    [valuePropName]: value,
    ...validateTrigger.filter(cur => cur !== trigger).reduce((acc, cur) => {
      return {
        ...acc,
        [cur]: withValidate((children.props as any)[cur]),
      };
    }, {}),
    className: classNames(
      children.props.className,
    ),
    ...(passthroughErrors && {
      hasError,
      errors,
    }),
  });

  return noStyle
    ? InputComponent
    : (
      <View
        className={classNames(
          "tfr-form-item-container",
          layout === "horizontal" && "tfr-form-item-container-horizontal",
          className,
        )}
      >
        <View
          className={classNames(
            "tfr-form-item-inner",
            layout === "horizontal" && "tfr-form-item-inner-horizontal",
            layout === "vertical" && "tfr-form-item-inner-vertical",
            innerClassName,
          )}
        >
          {!isNull(label) && (
            <FormLabel
              label={label}
              required={required}
              colon={colon}
              {...labelProps}
            />
          )}
          {InputComponent}
        </View>
        {hasError && showErrors && errors.map((error, index) => (
          <View
            key={index}
            className="tfr-form-item-error-text"
          >
            {error}
          </View>
        ))}
      </View>
    );
};

export default FormItem;