import { RANGES } from './constants'

/**
 * Check that the value is integer and int32
 * @param {number} value
 * @returns {boolean}
 */
function int32(value) {
  return Number.isInteger(value)
    && value >= RANGES.int32.min
    && value <= RANGES.int32.max
}

/**
 * Check that the value is integer and int64
 * @param {number} value
 * @returns {boolean}
 */
function int64(value) {
  return Number.isInteger(value)
    && value >= RANGES.int64.min
    && value <= RANGES.int64.max
}

/**
 * Check that the value is float
 * @param {number} value
 * @returns {boolean}
 */
function float(value) {
  return (
    value >= RANGES.float.min && value <= RANGES.float.max
  )
}

/**
 * Check that the value is double
 * @param {number} value
 * @returns {boolean}
 */
function double(value) {
  return (
    value >= RANGES.double.min && value <= RANGES.double.max
  )
}

export default {
  int32,
  int64,
  float,
  double,
}
