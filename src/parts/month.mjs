import { year } from './year.mjs'

export const month = {
  name: 'month',
  range: 2629740,
  val (d, timezone) {
    return d.month || (d.month = timezone.getMonth(d) + 1)
  },
  isValid (d, timezone, value) {
    return month.val(d, timezone) === (value || 12)
  },
  extent () {
    return [1, 12]
  },
  start (d, timezone) {
    return (
      d.MStart || (d.MStart = timezone.next(year.val(d, timezone), month.val(d, timezone)))
    )
  },
  end (d, timezone) {
    return d.MEnd || (d.MEnd = timezone.prev(year.val(d, timezone), month.val(d, timezone)))
  },
  next (d, timezone, value) {
    value = value > 12 ? 1 : value || 12
    return timezone.next(
      year.val(d, timezone) + (value > month.val(d, timezone) ? 0 : 1),
      value
    )
  },
  prev (d, timezone, value) {
    value = value > 12 ? 12 : value || 12
    return timezone.prev(
      year.val(d, timezone) - (value >= month.val(d, timezone) ? 1 : 0),
      value
    )
  }
}
