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
    if (!timezone) throw Error('Missing timezone object')
    return d.minute || (d.minute = timezone.getMin(d))
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return minute.val(d, timezone) === value
  },
  extent () {
    return [0, 59]
  },
  start (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
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
    if (!timezone) throw Error('Missing timezone object')
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
    if (!timezone) throw Error('Missing timezone object')
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
    if (!timezone) throw Error('Missing timezone object')
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
