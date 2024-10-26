import { month } from './month.mjs'
import { year } from './year.mjs'
import { day } from './day.mjs'
import { dayOfWeek } from './dayOfWeek.mjs'

export const weekOfMonth = {
  name: 'week of month',
  range: 604800,
  val (d, timezone) {
    return (
      d.weekOfMonth ||
      (d.weekOfMonth =
        (day.val(d, timezone) +
          (dayOfWeek.val(month.start(d, timezone)) - 1) +
          (7 - dayOfWeek.val(d, timezone))) /
        7)
    )
  },
  isValid (d, timezone, value) {
    return weekOfMonth.val(d, timezone) === (value || weekOfMonth.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    return (
      d.wmExtent ||
      (d.wmExtent = [
        1,
        (day.extent(d, timezone)[1] +
          (dayOfWeek.val(month.start(d, timezone)) - 1) +
          (7 - dayOfWeek.val(month.end(d, timezone)))) /
        7
      ])
    )
  },
  start (d, timezone) {
    return (
      d.wmStart ||
      (d.wmStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.max(day.val(d, timezone) - dayOfWeek.val(d, timezone) + 1, 1)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.wmEnd ||
      (d.wmEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.min(day.val(d, timezone) + (7 - dayOfWeek.val(d, timezone)), day.extent(d, timezone)[1])
      ))
    )
  },
  next (d, timezone, value) {
    value = value > weekOfMonth.extent(d, timezone)[1] ? 1 : value
    const nextMonth = timezone.nextRollover(d, timezone, value, weekOfMonth, month)
    const wmMax = weekOfMonth.extent(nextMonth)[1]
    value = value > wmMax ? 1 : value || wmMax
    return timezone.next(
      year.val(nextMonth),
      month.val(nextMonth),
      Math.max(1, (value - 1) * 7 - (dayOfWeek.val(nextMonth) - 2))
    )
  },
  prev (d, timezone, value) {
    const prevMonth = timezone.prevRollover(d, timezone, value, weekOfMonth, month)
    const wmMax = weekOfMonth.extent(prevMonth)[1]
    value = value > wmMax ? wmMax : value || wmMax
    return weekOfMonth.end(
      timezone.next(
        year.val(prevMonth),
        month.val(prevMonth),
        Math.max(1, (value - 1) * 7 - (dayOfWeek.val(prevMonth) - 2))
      )
    )
  }
}
