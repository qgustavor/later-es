import { DAY } from '../constants.mjs'
import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const dayOfYear = {
  name: 'day of year',
  range: 86400,
  val (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return (
      d.dayOfYear ||
      (d.dayOfYear = Math.ceil(
        1 +
        (day.start(d, timezone).getTime() - year.start(d, timezone).getTime()) / DAY
      ))
    )
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return dayOfYear.val(d, timezone) === (value || dayOfYear.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    const extentYear = year.val(d, timezone)
    return d.dyExtent || (d.dyExtent = [1, extentYear % 4 ? 365 : 366])
  },
  start (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return day.start(d, timezone)
  },
  end (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return day.end(d, timezone)
  },
  next (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    value = value > dayOfYear.extent(d, timezone)[1] ? 1 : value
    const nextYear = timezone.nextRollover(d, timezone, value, dayOfYear, year)
    const dyMax = dayOfYear.extent(nextYear)[1]
    value = value > dyMax ? 1 : value || dyMax
    return timezone.next(year.val(nextYear, timezone), month.val(nextYear, timezone), value)
  },
  prev (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    const prevYear = timezone.prevRollover(d, timezone, value, dayOfYear, year)
    const dyMax = dayOfYear.extent(prevYear)[1]
    value = value > dyMax ? dyMax : value || dyMax
    return timezone.prev(year.val(prevYear, timezone), month.val(prevYear, timezone), value)
  }
}
