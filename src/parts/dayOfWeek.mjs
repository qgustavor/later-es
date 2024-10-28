import { year } from './year.mjs'
import { month } from './month.mjs'
import { day } from './day.mjs'

export const dayOfWeek = {
  name: 'day of week',
  range: 86400,
  val (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return d.dayOfWeek || (d.dayOfWeek = timezone.getDay(d) + 1)
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return dayOfWeek.val(d, timezone) === (value || 7)
  },
  extent () {
    return [1, 7]
  },
  start (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return day.start(d, timezone)
  },
  end (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return day.end(d, timezone)
  },
  next (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
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
    if (!timezone) throw Error('Missing timezone object')
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
