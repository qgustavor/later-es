import { NEVER } from '../constants.mjs'

export const year = {
  name: 'year',
  range: 31556900,
  val (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return d.year || (d.year = timezone.getYear(d))
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return year.val(d, timezone) === value
  },
  extent () {
    return [1970, 2099]
  },
  start (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return d.YStart || (d.YStart = timezone.next(year.val(d, timezone)))
  },
  end (d, timezone) {
    if (!timezone) throw Error('Missing timezone object')
    return d.YEnd || (d.YEnd = timezone.prev(year.val(d, timezone)))
  },
  next (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return value > year.val(d, timezone) && value <= year.extent()[1]
      ? timezone.next(value)
      : NEVER
  },
  prev (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return value < year.val(d, timezone) && value >= year.extent()[0]
      ? timezone.prev(value)
      : NEVER
  }
}
