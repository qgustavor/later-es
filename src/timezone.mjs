import { SEC } from './constants.mjs'
import { day } from './parts.mjs'

export class Timezone {
  constructor (useLocalTime) {
    this.build = useLocalTime
      ? (Y, M, D, h, m, s) => new Date(Y, M, D, h, m, s)
      : (Y, M, D, h, m, s) => new Date(Date.UTC(Y, M, D, h, m, s))

    const get = useLocalTime ? 'get' : 'getUTC'
    const d = Date.prototype
    this.getYear = d[get + 'FullYear']
    this.getMonth = d[get + 'Month']
    this.getDate = d[get + 'Date']
    this.getDay = d[get + 'Day']
    this.getHour = d[get + 'Hours']
    this.getMin = d[get + 'Minutes']
    this.getSec = d[get + 'Seconds']
    this.isUTC = !useLocalTime
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
