import Decimal from 'decimal.js'

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
    min: new Decimal(2).pow(128).negated(),
    max: new Decimal(2).pow(128),
  },
}
