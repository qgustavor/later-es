import { NEVER } from '../constants.mjs'

export const year = {
  name: 'year',
  range: 31556900,
  val (d, timezone) {
    return d.year || (d.year = timezone.getYear(d))
  },
  isValid (d, timezone, value) {
    return year.val(d, timezone) === value
  },
  extent () {
    return [1970, 2099]
  },
  start (d, timezone) {
    return d.YStart || (d.YStart = timezone.next(year.val(d, timezone)))
  },
  end (d, timezone) {
    return d.YEnd || (d.YEnd = timezone.prev(year.val(d, timezone)))
  },
  next (d, timezone, value) {
    return value > year.val(d, timezone) && value <= year.extent()[1]
      ? timezone.next(value)
      : NEVER
  },
  prev (d, timezone, value) {
    return value < year.val(d, timezone) && value >= year.extent()[0]
      ? timezone.prev(value)
      : NEVER
  }
}
