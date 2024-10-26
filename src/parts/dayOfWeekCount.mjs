import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const dayOfWeekCount = {
  name: 'day of week count',
  range: 604800,
  val (d, timezone) {
    return d.dayOfWeekCount || (d.dayOfWeekCount = Math.floor((day.val(d, timezone) - 1) / 7) + 1)
  },
  isValid (d, timezone, value) {
    return (
      dayOfWeekCount.val(d, timezone) === value ||
      (value === 0 && day.val(d, timezone) > day.extent(d, timezone)[1] - 7)
    )
  },
  extent (d, timezone) {
    return (
      d.dcExtent || (d.dcExtent = [1, Math.ceil(day.extent(d, timezone)[1] / 7)])
    )
  },
  start (d, timezone) {
    return (
      d.dcStart ||
      (d.dcStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.max(1, (dayOfWeekCount.val(d, timezone) - 1) * 7 + 1 || 1)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.dcEnd ||
      (d.dcEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.min(dayOfWeekCount.val(d, timezone) * 7, day.extent(d, timezone)[1])
      ))
    )
  },
  next (d, timezone, value) {
    value = value > dayOfWeekCount.extent(d, timezone)[1] ? 1 : value
    let nextMonth = timezone.nextRollover(d, timezone, value, dayOfWeekCount, month)
    const dcMax = dayOfWeekCount.extent(nextMonth)[1]
    value = value > dcMax ? 1 : value
    const next = timezone.next(
      year.val(nextMonth),
      month.val(nextMonth),
      value === 0 ? day.extent(nextMonth)[1] - 6 : 1 + 7 * (value - 1)
    )
    if (next.getTime() <= d.getTime()) {
      nextMonth = month.next(d, timezone, month.val(d, timezone) + 1)
      return timezone.next(
        year.val(nextMonth),
        month.val(nextMonth),
        value === 0 ? day.extent(nextMonth)[1] - 6 : 1 + 7 * (value - 1)
      )
    }

    return next
  },
  prev (d, timezone, value) {
    const prevMonth = timezone.prevRollover(d, timezone, value, dayOfWeekCount, month)
    const dcMax = dayOfWeekCount.extent(prevMonth)[1]
    value = value > dcMax ? dcMax : value || dcMax
    return dayOfWeekCount.end(
      timezone.prev(
        year.val(prevMonth),
        month.val(prevMonth),
        1 + 7 * (value - 1)
      )
    )
  }
}
