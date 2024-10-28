import { NEVER } from '../constants.mjs'

export const fullDate = {
  name: 'full date',
  range: 1,
  val (d) {
    return d.fullDate || (d.fullDate = d.getTime())
  },
  isValid (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return fullDate.val(d, timezone) === value
  },
  extent () {
    return [0, 3250368e7]
  },
  start (d) {
    return d
  },
  end (d) {
    return d
  },
  next (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return fullDate.val(d, timezone) < value ? new Date(value) : NEVER
  },
  prev (d, timezone, value) {
    if (!timezone) throw Error('Missing timezone object')
    return fullDate.val(d, timezone) > value ? new Date(value) : NEVER
  }
}
