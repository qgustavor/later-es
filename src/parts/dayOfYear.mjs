import { DAY } from '../constants.mjs'
import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const dayOfYear = {
  name: 'day of year',
  range: 86400,
  val (d, timezone) {
    return (
      d.dayOfYear ||
      (d.dayOfYear = Math.ceil(
        1 +
        (day.start(d, timezone).getTime() - year.start(d, timezone).getTime()) / DAY
      ))
    )
  },
  isValid (d, timezone, value) {
    return dayOfYear.val(d, timezone) === (value || dayOfYear.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    const extentYear = year.val(d, timezone)
    return d.dyExtent || (d.dyExtent = [1, extentYear % 4 ? 365 : 366])
  },
  start (d, timezone) {
    return day.start(d, timezone)
  },
  end (d, timezone) {
    return day.end(d, timezone)
  },
  next (d, timezone, value) {
    value = value > dayOfYear.extent(d, timezone)[1] ? 1 : value
    const nextYear = timezone.nextRollover(d, timezone, value, dayOfYear, year)
    const dyMax = dayOfYear.extent(nextYear)[1]
    value = value > dyMax ? 1 : value || dyMax
    return timezone.next(year.val(nextYear), month.val(nextYear), value)
  },
  prev (d, timezone, value) {
    const prevYear = timezone.prevRollover(d, timezone, value, dayOfYear, year)
    const dyMax = dayOfYear.extent(prevYear)[1]
    value = value > dyMax ? dyMax : value || dyMax
    return timezone.prev(year.val(prevYear), month.val(prevYear), value)
  }
}
