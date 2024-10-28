import { SEC } from '../constants.mjs'
import { minute } from './minute.mjs'
import { month } from './month.mjs'
import { year } from './year.mjs'
import { day } from './day.mjs'
import { hour } from './hour.mjs'

export const second = {
  name: 'second',
  range: 1,
  val (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return d.second || (d.second = timezone.getSec(d))
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return second.val(d, timezone) === value
  },
  extent () {
    return [0, 59]
  },
  start (d) {
    return d
  },
  end (d) {
    return d
  },
  next (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    const s = second.val(d, timezone)
    const inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s
    let next = new Date(d.getTime() + inc * SEC)
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * SEC)
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
      hour.val(d, timezone),
      minute.val(d, timezone) + (value >= second.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
