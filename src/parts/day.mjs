import { DAYS_IN_MONTH } from '../constants.mjs'
import { year } from './year.mjs'
import { month } from './month.mjs'
import { dayOfYear } from './dayOfYear.mjs'

export const day = {
  name: 'day',
  range: 86400,
  val (d, timezone) {
    return d.date || (d.date = timezone.getDate(d))
  },
  isValid (d, timezone, value) {
    return day.val(d, timezone) === (value || day.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    if (d.DExtent) return d.DExtent
    const extentMonth = month.val(d, timezone)
    let max = DAYS_IN_MONTH[extentMonth - 1]
    if (extentMonth === 2 && dayOfYear.extent(d, timezone)[1] === 366) {
      max += 1
    }

    return (d.DExtent = [1, max])
  },
  start (d, timezone) {
    return (
      d.DStart ||
      (d.DStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.DEnd ||
      (d.DEnd = timezone.prev(year.val(d, timezone), month.val(d, timezone), day.val(d, timezone)))
    )
  },
  next (d, timezone, value) {
    value = value > day.extent(d, timezone)[1] ? 1 : value
    const nextMonth = timezone.nextRollover(d, timezone, value, day, month)
    const DMax = day.extent(nextMonth)[1]
    value = value > DMax ? 1 : value || DMax
    return timezone.next(year.val(nextMonth), month.val(nextMonth), value)
  },
  prev (d, timezone, value) {
    const prevMonth = timezone.prevRollover(d, timezone, value, day, month)
    const DMax = day.extent(prevMonth)[1]
    return timezone.prev(
      year.val(prevMonth),
      month.val(prevMonth),
      value > DMax ? DMax : value || DMax
    )
  }
}
