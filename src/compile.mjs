import * as modifiers from './modifiers.mjs'
import * as parts from './parts.mjs'
import * as array from './array.mjs'
import { NEVER, SEC } from './constants.mjs'
import { Timezone } from './timezone.mjs'

export function compile (schedDef, timezone) {
  const constraints = []
  let constraintsLength = 0

  if (timezone) {
    if (!(timezone instanceof Timezone)) {
      timezone = new Timezone(timezone)
    }
  } else {
    timezone = new Timezone()
  }

  for (const key in schedDef) {
    const nameParts = key.split('_')
    const name = nameParts[0]
    const mod = nameParts[1]
    const vals = schedDef[key]
    const constraint = mod
      ? modifiers[mod](parts[name], vals)
      : parts[name]
    constraints.push({
      constraint,
      vals
    })
    constraintsLength++
  }

  constraints.sort((a, b) => {
    const ra = a.constraint.range
    const rb = b.constraint.range
    return rb < ra ? -1 : rb > ra ? 1 : 0
  })
  const tickConstraint = constraints[constraintsLength - 1].constraint
  function compareFn (dir) {
    return dir === 'next'
      ? function (a, b) {
        if (!a || !b) return true
        return a.getTime() > b.getTime()
      }
      : function (a, b) {
        if (!a || !b) return true
        return b.getTime() > a.getTime()
      }
  }

  return {
    start (dir, timezone, startDate) {
      let next = startDate
      const nextValue = array[dir]
      let maxAttempts = 1e3
      let done
      while (maxAttempts-- && !done && next) {
        done = true
        for (let i = 0; i < constraintsLength; i++) {
          const { constraint } = constraints[i]
          const curValue = constraint.val(next, timezone)
          const extent = constraint.extent(next, timezone)
          const newValue = nextValue(curValue, constraints[i].vals, extent)
          if (!constraint.isValid(next, timezone, newValue)) {
            next = constraint[dir](next, timezone, newValue)
            done = false
            break
          }
        }
      }

      if (next !== NEVER) {
        next =
          dir === 'next'
            ? tickConstraint.start(next, timezone)
            : tickConstraint.end(next, timezone)
      }

      return next
    },
    end (dir, startDate) {
      let result
      const nextValue = array[dir + 'Invalid']
      const compare = compareFn(dir)
      for (let i = constraintsLength - 1; i >= 0; i--) {
        const { constraint } = constraints[i]
        const curValue = constraint.val(startDate, timezone)
        const extent = constraint.extent(startDate, timezone)
        const newValue = nextValue(curValue, constraints[i].vals, extent)
        let next
        if (newValue !== undefined) {
          next = constraint[dir](startDate, timezone, newValue)
          if (next && (!result || compare(result, next))) {
            result = next
          }
        }
      }

      return result
    },
    tick (dir, date) {
      return new Date(
        dir === 'next'
          ? tickConstraint.end(date, timezone).getTime() + SEC
          : tickConstraint.start(date, timezone).getTime() - SEC
      )
    },
    tickStart (date) {
      return tickConstraint.start(date, timezone)
    }
  }
}
