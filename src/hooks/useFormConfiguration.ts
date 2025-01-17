import type { FormProviderConfiguration } from "../context/FormContext";

import { useFormContext } from "../context/FormContext";

const fallback = (value: any, fallbackValue: any) => (value === undefined ? fallbackValue : value);

export default function useFormConfiguration ({
  colon,
  labelProps,
  layout,
  validateFirst,
  passthroughErrors,
  showErrors,
  getRequiredMessage,
}: Partial<FormProviderConfiguration> = {}) {
  const {
    colon: contextColon = true,
    labelProps: contextLabelProps = {},
    layout: contextLayout = "vertical",
    validateFirst: contextValidateFirst = false,
    passthroughErrors: contextPassthroughErrors = false,
    showErrors: contextShowErrors = true,
    transformBehavior: contextTransformBehavior = "replace",
    updateTickLimit: contextUpdateTickLimit = 50,
    getRequiredMessage: contextGetRequiredMessage = label => `${label}不能为空`,
  } = useFormContext();

  return {
    colon: fallback(colon, contextColon),
    labelProps: fallback(labelProps, contextLabelProps),
    layout: fallback(layout, contextLayout),
    validateFirst: fallback(validateFirst, contextValidateFirst),
    passthroughErrors: fallback(passthroughErrors, contextPassthroughErrors),
    showErrors: fallback(showErrors, contextShowErrors),
    transformBehavior: contextTransformBehavior,
    updateTickLimit: contextUpdateTickLimit,
    getRequiredMessage: fallback(getRequiredMessage, contextGetRequiredMessage),
  };
}