import { isEmpty } from "@/utils/tools";

import type { Rule } from "../types";

export const validateRules = async (value: any, rules: Rule[], validateFirst: boolean | "parallel" = false) => {
  const errors = [] as string[];

  const validateRule = async (rule: Rule) => {
    switch (true) {
      case "required" in rule:
        if (isEmpty(value)) {
          return rule.message;
        }
        break;
      case "pattern" in rule:
        if (!isEmpty(value) && !rule.pattern.test(value)) {
          return rule.message;
        }
        break;
      case "max" in rule:
        if (!isEmpty(value) && value.length > (rule.max ?? Infinity)) {
          return rule.message;
        }
        break;
      case "min" in rule:
        if (!isEmpty(value) && value.length < (rule.min ?? -Infinity)) {
          return rule.message;
        }
        break;
      case "validator" in rule:
        if (!isEmpty(value)) {
          return await rule.validator(value);
        }
    }
  };

  if (validateFirst === "parallel") {
    const results = await Promise.all(rules.map(rule => validateRule(rule)));
    for (const error of results) {
      if (error) {
        errors.push(error);
      }
    }
  } else {
    for (const rule of rules) {
      const error = await validateRule(rule);
      if (error) {
        errors.push(error);
        if (validateFirst) return errors;
      }
    }
  }

  return errors.length ? errors : undefined;
};