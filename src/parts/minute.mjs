import { MIN, SEC } from '../constants.mjs'
import { year } from './year.mjs'
import { second } from './second.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'
import { hour } from './hour.mjs'

export const minute = {
  name: 'minute',
  range: 60,
  val (d, timezone) {
    return d.minute || (d.minute = timezone.getMin(d))
  },
  isValid (d, timezone, value) {
    return minute.val(d, timezone) === value
  },
  extent (d, timezone) {
    return [0, 59]
  },
  start (d, timezone) {
    return (
      d.mStart ||
      (d.mStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone),
        minute.val(d, timezone)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.mEnd ||
      (d.mEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone),
        minute.val(d, timezone)
      ))
    )
  },
  next (d, timezone, value) {
    const m = minute.val(d, timezone)
    const s = second.val(d, timezone)
    const inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m
    let next = new Date(d.getTime() + inc * MIN - s * SEC)
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * MIN - s * SEC)
    }

    return next
  },
  prev (d, timezone, value) {
    value = value > 59 ? 59 : value
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone),
      hour.val(d, timezone) + (value >= minute.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
