import { RANGES } from './constants'

/**
 * Check that the value is integer and int32
 * @param {number} value
 * @returns {boolean}
 */
function int32(value) {
  return Number.isInteger(value) && value >= RANGES.int32.min && value <= RANGES.int32.max
}

/**
 * Check that the value is integer and int64
 * @param {number} value
 * @returns {boolean}
 */
function int64(value) {
  return Number.isInteger(value) && value >= RANGES.int64.min && value <= RANGES.int64.max
}

/**
 * Check that the data is float
 * @param {number} data
 * @returns {boolean}
 */
function float(data) {
  return (
    !Number.isNaN(Number.parseFloat(data))
      && RANGES.float.max.greaterThanOrEqualTo(data)
      && RANGES.float.min.lessThanOrEqualTo(data)
  )
}

export default {
  int32,
  int64,
  float,
}
