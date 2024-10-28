import { minute } from './minute.mjs'
import { month } from './month.mjs'
import { year } from './year.mjs'
import { day } from './day.mjs'
import { hour } from './hour.mjs'
import { second } from './second.mjs'

export const time = {
  name: 'time',
  range: 1,
  val (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return (
      d.time || (d.time = hour.val(d, timezone) * 3600 + minute.val(d, timezone) * 60 + second.val(d, timezone))
    )
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return time.val(d, timezone) === value
  },
  extent () {
    return [0, 86399]
  },
  start (d) {
    return d
  },
  end (d) {
    return d
  },
  next (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    value = value > 86399 ? 0 : value
    let next = timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value <= time.val(d, timezone) ? 1 : 0),
      0,
      0,
      value
    )
    if (!timezone.isUTC && next.getTime() < d.getTime()) {
      next = timezone.next(
        year.val(next, timezone),
        month.val(next, timezone),
        day.val(next, timezone),
        hour.val(next, timezone),
        minute.val(next, timezone),
        value + 7200
      )
    }

    return next
  },
  prev (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    value = value > 86399 ? 86399 : value
    return timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value >= time.val(d, timezone) ? -1 : 0),
      0,
      0,
      value
    )
  }
}
