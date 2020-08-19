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
export default {
  int32,
  int64,
}
