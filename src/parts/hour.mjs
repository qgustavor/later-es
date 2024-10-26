import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const hour = {
  name: 'hour',
  range: 3600,
  val (d, timezone) {
    return d.hour || (d.hour = timezone.getHour(d))
  },
  isValid (d, timezone, value) {
    return hour.val(d, timezone) === value
  },
  extent () {
    return [0, 23]
  },
  start (d, timezone) {
    return (
      d.hStart ||
      (d.hStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.hEnd ||
      (d.hEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone)
      ))
    )
  },
  next (d, timezone, value) {
    value = value > 23 ? 0 : value
    let next = timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value <= hour.val(d, timezone) ? 1 : 0),
      value
    )
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = timezone.next(
        year.val(next),
        month.val(next),
        day.val(next),
        value + 1
      )
    }

    return next
  },
  prev (d, timezone, value) {
    value = value > 23 ? 23 : value
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value >= hour.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
