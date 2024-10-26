import { WEEK } from '../constants.mjs'
import { month } from './month.mjs'
import { year } from './year.mjs'
import { day } from './day.mjs'
import { dayOfWeek } from './dayOfWeek.mjs'

export const weekOfYear = {
  name: 'week of year (ISO)',
  range: 604800,
  val (d, timezone) {
    if (d.weekOfMonth) return d.weekOfMonth
    const wThur = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    const YThur = dayOfWeek.next(year.prev(wThur, year.val(wThur) - 1), 5)
    return (d.weekOfMonth =
      1 + Math.ceil((wThur.getTime() - YThur.getTime()) / WEEK))
  },
  isValid (d, timezone, value) {
    return weekOfYear.val(d, timezone) === (value || weekOfYear.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    if (d.wyExtent) return d.wyExtent
    const extentYear = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    const dwFirst = dayOfWeek.val(year.start(extentYear))
    const dwLast = dayOfWeek.val(year.end(extentYear))
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52])
  },
  start (d, timezone) {
    return (
      d.wyStart ||
      (d.wyStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone) - (dayOfWeek.val(d, timezone) > 1 ? dayOfWeek.val(d, timezone) - 2 : 6)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.wyEnd ||
      (d.wyEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone) + (dayOfWeek.val(d, timezone) > 1 ? 8 - dayOfWeek.val(d, timezone) : 0)
      ))
    )
  },
  next (d, timezone, value) {
    value = value > weekOfYear.extent(d, timezone)[1] ? 1 : value
    const wyThur = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    let nextYear = timezone.nextRollover(wyThur, value, weekOfYear, year)
    if (weekOfYear.val(nextYear) !== 1) {
      nextYear = dayOfWeek.next(nextYear, 2)
    }

    const wyMax = weekOfYear.extent(nextYear)[1]
    const wyStart = weekOfYear.start(nextYear)
    value = value > wyMax ? 1 : value || wyMax
    return timezone.next(
      year.val(wyStart),
      month.val(wyStart),
      day.val(wyStart) + 7 * (value - 1)
    )
  },
  prev (d, timezone, value) {
    const wyThur = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    let prevYear = timezone.prevRollover(wyThur, value, weekOfYear, year)
    if (weekOfYear.val(prevYear) !== 1) {
      prevYear = dayOfWeek.next(prevYear, 2)
    }

    const wyMax = weekOfYear.extent(prevYear)[1]
    const wyEnd = weekOfYear.end(prevYear)
    value = value > wyMax ? wyMax : value || wyMax
    return weekOfYear.end(
      timezone.next(
        year.val(wyEnd, timezone),
        month.val(wyEnd, timezone),
        day.val(wyEnd, timezone) + 7 * (value - 1)
      )
    )
  }
}
