import * as modifiers from './modifiers.mjs'

export function recur () {
  const schedules = []
  const exceptions = []
  let cur
  let curArray = schedules
  let curName
  let values
  let every
  let modifier
  let applyMin
  let applyMax
  let i
  let last
  function add (name, min, max) {
    name = modifier ? name + '_' + modifier : name
    if (!cur) {
      curArray.push({})
      cur = curArray[0]
    }

    if (!cur[name]) {
      cur[name] = []
    }

    curName = cur[name]
    if (every) {
      values = []
      for (i = min; i <= max; i += every) {
        values.push(i)
      }

      last = {
        n: name,
        x: every,
        c: curName.length,
        m: max
      }
    }

    values = applyMin ? [min] : applyMax ? [max] : values
    const { length } = values
    for (i = 0; i < length; i += 1) {
      const value = values[i]
      if (!curName.includes(value)) {
        curName.push(value)
      }
    }

    values = every = modifier = applyMin = applyMax = 0
  }

  return {
    schedules,
    exceptions,
    on () {
      values = Array.isArray(arguments[0]) ? arguments[0] : arguments
      return this
    },
    every (x) {
      every = x || 1
      return this
    },
    after (x) {
      modifier = 'after'
      values = [x]
      return this
    },
    before (x) {
      modifier = 'before'
      values = [x]
      return this
    },
    first () {
      applyMin = 1
      return this
    },
    last () {
      applyMax = 1
      return this
    },
    time () {
      for (let i = 0, { length } = values; i < length; i++) {
        const split = values[i].split(':')
        if (split.length < 3) split.push(0)
        values[i] =
          Number(split[0]) * 3600 + Number(split[1]) * 60 + Number(split[2])
      }

      add('time')
      return this
    },
    second () {
      add('second', 0, 59)
      return this
    },
    minute () {
      add('minute', 0, 59)
      return this
    },
    hour () {
      add('hour', 0, 23)
      return this
    },
    dayOfMonth () {
      add('dayOfMonth', 1, applyMax ? 0 : 31)
      return this
    },
    dayOfWeek () {
      add('dayOfWeek', 1, 7)
      return this
    },
    onWeekend () {
      values = [1, 7]
      return this.dayOfWeek()
    },
    onWeekday () {
      values = [2, 3, 4, 5, 6]
      return this.dayOfWeek()
    },
    dayOfWeekCount () {
      add('dayOfWeekCount', 1, applyMax ? 0 : 5)
      return this
    },
    dayOfYear () {
      add('dayOfYear', 1, applyMax ? 0 : 366)
      return this
    },
    weekOfMonth () {
      add('weekOfMonth', 1, applyMax ? 0 : 5)
      return this
    },
    weekOfYear () {
      add('weekOfYear', 1, applyMax ? 0 : 53)
      return this
    },
    month () {
      add('month', 1, 12)
      return this
    },
    year () {
      add('year', 1970, 2450)
      return this
    },
    fullDate () {
      for (let i = 0, { length } = values; i < length; i++) {
        values[i] = values[i].getTime()
      }

      add('fullDate')
      return this
    },
    customModifier (id, vals) {
      const custom = modifiers[id]
      if (!custom) { throw new Error('Custom modifier ' + id + ' not recognized!') }
      modifier = id
      values = Array.isArray(arguments[1]) ? arguments[1] : [arguments[1]]
      return this
    },
    startingOn (start) {
      return this.between(start, last.m)
    },
    between (start, end) {
      cur[last.n] = cur[last.n].splice(0, last.c)
      every = last.x
      add(last.n, start, end)
      return this
    },
    and () {
      cur = curArray[curArray.push({}) - 1]
      return this
    },
    except () {
      curArray = exceptions
      cur = null
      return this
    }
  }
}
