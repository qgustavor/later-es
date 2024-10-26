import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const dayOfWeek = {
  name: 'day of week',
  range: 86400,
  val (d, timezone) {
    return d.dayOfWeek || (d.dayOfWeek = timezone.getDay(d) + 1)
  },
  isValid (d, timezone, value) {
    return dayOfWeek.val(d, timezone) === (value || 7)
  },
  extent () {
    return [1, 7]
  },
  start (d, timezone) {
    return day.start(d, timezone)
  },
  end (d, timezone) {
    return day.end(d, timezone)
  },
  next (d, timezone, value) {
    value = value > 7 ? 1 : value || 7
    return timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) +
      (value - dayOfWeek.val(d, timezone)) +
      (value <= dayOfWeek.val(d, timezone) ? 7 : 0)
    )
  },
  prev (d, timezone, value) {
    value = value > 7 ? 7 : value || 7
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) +
      (value - dayOfWeek.val(d, timezone)) +
      (value >= dayOfWeek.val(d, timezone) ? -7 : 0)
    )
  }
}
