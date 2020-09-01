
/**
 * A constant holding the largest positive finite value of type float.
 * (32-bit precision IEEE 754 floating point)
 * https://docs.oracle.com/javase/7/docs/api/java/lang/Float.html#MAX_VALUE
 * @type {number}
 */
const FLOAT_MAX = (2 - (2 ** -23)) * (2 ** 127)
/**
 * A constant holding the largest positive finite value of type double.
 * (64-bit precision IEEE 754 floating point)
 * https://docs.oracle.com/javase/7/docs/api/java/lang/Double.html#MAX_VALUE
 * @type {number}
 */
const DOUBLE_MAX = (2 - (2 ** -52)) * (2 ** 1023)

export const RANGES = {
  int32: {
    min: -2147483648,
    max: 2147483647,
  },
  int64: {
    min: -9223372036854775808,
    max: 9223372036854775807,
  },
  float: {
    min: -FLOAT_MAX,
    max: FLOAT_MAX,
  },
  double: {
    min: -DOUBLE_MAX,
    max: DOUBLE_MAX,
  },
}
