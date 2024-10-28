import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const hour = {
  name: 'hour',
  range: 3600,
  val (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return d.hour || (d.hour = timezone.getHour(d))
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return hour.val(d, timezone) === value
  },
  extent () {
    return [0, 23]
  },
  start (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
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
    if (!timezone) throw Error('Missing timezone object')
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
    if (!timezone) throw Error('Missing timezone object')
    value = value > 23 ? 0 : value
    let next = timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value <= hour.val(d, timezone) ? 1 : 0),
      value
    )
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = timezone.next(
        year.val(next, timezone),
        month.val(next, timezone),
        day.val(next, timezone),
        value + 1
      )
    }

    return next
  },
  prev (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    value = value > 23 ? 23 : value
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value >= hour.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
