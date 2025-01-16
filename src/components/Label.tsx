import React from "react";

import { Text, View } from "@tarojs/components";
import classNames from "classnames/dedupe";

export type FormLabelProps = {
  required?: boolean;
  size?: "normal" | "small";
  label?: React.ReactNode;
  labelClassName?: classNames.Argument;
  addonAfter?: React.ReactNode;
  className?: classNames.Argument;
  containerClassName?: classNames.Argument;
  colon?: boolean;
  colonClassName?: classNames.Argument;
  asteriskTookSpace?: boolean;
  children?: React.ReactNode;
};

const Label = ({
  size,
  required,
  labelClassName,
  label,
}: Pick<FormLabelProps, "size" | "label" | "labelClassName" | "required">) => {
  const asteriskHideClassName =
    size === "small"
      ? "tfr-small tfr-hide-asterisk"
      : "tfr-normal tfr-hide-asterisk";
  const asteriskShowClassName =
    size === "small"
      ? "tfr-small show-asterisk"
      : "tfr-normal show-asterisk";

  return (
    <Text
      className={classNames(
        "tfr-form-label",
        required ? asteriskShowClassName : asteriskHideClassName,
        labelClassName,
      )}
    >
      {label}
    </Text>
  );
};

const Colon: React.FC<Pick<FormLabelProps, "colon" | "colonClassName">> = ({
  colon = true,
  colonClassName,
}) => {
  return (
    colon && (
      <Text
        className={classNames("tfr-form-label-colon", colonClassName)}
      >
        :
      </Text>
    )
  );
};

const FormLabel: React.FC<FormLabelProps> = ({
  label,
  required,
  size = "normal",
  colon = true,
  colonClassName,
  labelClassName,
  className,
  addonAfter,
  asteriskTookSpace = true,
}) => {
  return (
    <View
      className={classNames(
        "tfr-form-label",
        !asteriskTookSpace && size === "normal" && "tfr-form-label-no-asterisk-space",
        className,
      )}
    >
      {label && (
        <Label
          size={size}
          label={label}
          required={required}
          labelClassName={labelClassName}
        />
      )}
      <Colon colon={colon} colonClassName={colonClassName} />
      {addonAfter}
    </View>
  );
};

export default FormLabel;