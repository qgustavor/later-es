import { SEC } from './constants.mjs'
import { day } from './parts/day.mjs'

export class Timezone {
  constructor (isLocalTime) {
    this.isUTC = !isLocalTime
  }

  build (Y, M, D, h, m, s) {
    return this.isUTC
      ? new Date(Date.UTC(Y, M, D, h, m, s))
      : new Date(Y, M, D, h, m, s)
  }

  getYear (date) {
    return this.isUTC ? date.getUTCFullYear() : date.getFullYear()
  }

  getMonth (date) {
    return this.isUTC ? date.getUTCMonth() : date.getMonth()
  }

  getDate (date) {
    return this.isUTC ? date.getUTCDate() : date.getDate()
  }

  getDay (date) {
    return this.isUTC ? date.getUTCDay() : date.getDay()
  }

  getHour (date) {
    return this.isUTC ? date.getUTCHours() : date.getHours()
  }

  getMin (date) {
    return this.isUTC ? date.getUTCMinutes() : date.getMinutes()
  }

  getSec (date) {
    return this.isUTC ? date.getUTCSeconds() : date.getSeconds()
  }

  next (Y, M, D, h, m, s) {
    return this.build(
      Y,
      M !== undefined ? M - 1 : 0,
      D !== undefined ? D : 1,
      h || 0,
      m || 0,
      s || 0
    )
  }

  nextRollover (d, value, constraint, period) {
    const cur = constraint.val(d)
    const max = constraint.extent(d, this)[1]
    return (value || max) <= cur || value > max
      ? new Date(period.end(d).getTime() + SEC)
      : period.start(d)
  }

  prev (Y, M, D, h, m, s) {
    const { length } = arguments
    M = length < 2 ? 11 : M - 1
    D = length < 3 ? day.extent(this.next(Y, M + 1), this)[1] : D
    h = length < 4 ? 23 : h
    m = length < 5 ? 59 : m
    s = length < 6 ? 59 : s
    return this.build(Y, M, D, h, m, s)
  }

  prevRollover (d, value, constraint, period) {
    const cur = constraint.val(d, this)
    return value >= cur || !value
      ? period.start(period.prev(d, period.val(d) - 1))
      : period.start(d)
  }
}
