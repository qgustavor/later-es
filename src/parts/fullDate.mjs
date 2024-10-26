import { NEVER } from '../constants.mjs'

export const fullDate = {
  name: 'full date',
  range: 1,
  val (d, timezone) {
    return d.fullDate || (d.fullDate = d.getTime())
  },
  isValid (d, timezone, value) {
    return fullDate.val(d, timezone) === value
  },
  extent () {
    return [0, 3250368e7]
  },
  start (d, timezone) {
    return d
  },
  end (d, timezone) {
    return d
  },
  next (d, timezone, value) {
    return fullDate.val(d, timezone) < value ? new Date(value) : NEVER
  },
  prev (d, timezone, value) {
    return fullDate.val(d, timezone) > value ? new Date(value) : NEVER
  }
}
