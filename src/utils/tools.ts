/**
 * 检查给定的值是否为空。
 *
 * @param {any} value - 需要检查的值。
 * @returns {boolean} 如果值未定义、为null、为空字符串、为空数组或为空对象，则返回true，否则返回false。
 */
export const isEmpty = (value: any): boolean => {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
};

/**
 * 过滤对象中的 undefined 和 null 值。
 * @param {T} object - 要过滤的对象。
 * @param {boolean} [filterNull=false] - 是否过滤 null 值。
 * @returns {T} - 过滤后的对象。
 * @template T
 */
export function filterUndefined<T extends Record<string, any>> (object: T, filterNull: boolean = false): T {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value !== undefined && (filterNull ? value !== null : true)) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
}