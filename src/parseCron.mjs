export function parseCron (expr, hasSeconds) {
  const NAMES = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
    SUN: 1,
    MON: 2,
    TUE: 3,
    WED: 4,
    THU: 5,
    FRI: 6,
    SAT: 7
  }
  const REPLACEMENTS = {
    '* * * * * *': '0/1 * * * * *',
    '@YEARLY': '0 0 1 1 *',
    '@ANNUALLY': '0 0 1 1 *',
    '@MONTHLY': '0 0 1 * *',
    '@WEEKLY': '0 0 * * 0',
    '@DAILY': '0 0 * * *',
    '@HOURLY': '0 * * * *'
  }
  const FIELDS = {
    s: [0, 0, 59],
    m: [1, 0, 59],
    h: [2, 0, 23],
    D: [3, 1, 31],
    M: [4, 1, 12],
    Y: [6, 1970, 2099],
    d: [5, 1, 7, 1]
  }
  function getValue (value, offset, max) {
    return isNaN(value)
      ? NAMES[value] || null
      : Math.min(Number(value) + (offset || 0), max || 9999)
  }

  function cloneSchedule (sched) {
    const clone = {}
    let field
    for (field in sched) {
      if (field !== 'dc' && field !== 'd') {
        clone[field] = sched[field].slice(0)
      }
    }

    return clone
  }

  function add (sched, name, min, max, inc) {
    let i = min
    if (!sched[name]) {
      sched[name] = []
    }

    while (i <= max) {
      if (!sched[name].includes(i)) {
        sched[name].push(i)
      }

      i += inc || 1
    }

    sched[name].sort(function (a, b) {
      return a - b
    })
  }

  function addHash (schedules, curSched, value, hash) {
    if ((curSched.d && !curSched.dc) ||
      (curSched.dc && !curSched.dc.includes(hash))) {
      schedules.push(cloneSchedule(curSched))
      curSched = schedules[schedules.length - 1]
    }

    add(curSched, 'd', value, value)
    add(curSched, 'dc', hash, hash)
  }

  function addWeekday (s, curSched, value) {
    const except1 = {}
    const except2 = {}
    if (value === 1) {
      add(curSched, 'D', 1, 3)
      add(curSched, 'd', NAMES.MON, NAMES.FRI)
      add(except1, 'D', 2, 2)
      add(except1, 'd', NAMES.TUE, NAMES.FRI)
      add(except2, 'D', 3, 3)
      add(except2, 'd', NAMES.TUE, NAMES.FRI)
    } else {
      add(curSched, 'D', value - 1, value + 1)
      add(curSched, 'd', NAMES.MON, NAMES.FRI)
      add(except1, 'D', value - 1, value - 1)
      add(except1, 'd', NAMES.MON, NAMES.THU)
      add(except2, 'D', value + 1, value + 1)
      add(except2, 'd', NAMES.TUE, NAMES.FRI)
    }

    s.exceptions.push(except1)
    s.exceptions.push(except2)
  }

  function addRange (item, curSched, name, min, max, offset) {
    const incSplit = item.split('/')
    const inc = Number(incSplit[1])
    const range = incSplit[0]
    if (range !== '*' && range !== '0') {
      const rangeSplit = range.split('-')
      min = getValue(rangeSplit[0], offset, max)
      max = getValue(rangeSplit[1], offset, max) || max
    }

    add(curSched, name, min, max, inc)
  }

  function parse (item, s, name, min, max, offset) {
    let value
    let split
    const { schedules } = s
    const curSched = schedules[schedules.length - 1]
    if (item === 'L') {
      item = min - 1
    }

    if ((value = getValue(item, offset, max)) !== null) {
      add(curSched, name, value, value)
    } else if ((value = getValue(item.replace('W', ''), offset, max)) !== null) {
      addWeekday(s, curSched, value)
    } else if ((value = getValue(item.replace('L', ''), offset, max)) !== null) {
      addHash(schedules, curSched, value, min - 1)
    } else if ((split = item.split('#')).length === 2) {
      value = getValue(split[0], offset, max)
      addHash(schedules, curSched, value, getValue(split[1]))
    } else {
      addRange(item, curSched, name, min, max, offset)
    }
  }

  function isHash (item) {
    return item.includes('#') || item.indexOf('L') > 0
  }

  function itemSorter (a, b) {
    return isHash(a) && !isHash(b) ? 1 : a - b
  }

  function parseExpr (expr) {
    const schedule = {
      schedules: [{}],
      exceptions: []
    }
    const components = expr.replace(/(\s)+/g, ' ').split(' ')
    let field
    let f
    let component
    let items
    for (field in FIELDS) {
      f = FIELDS[field]
      component = components[f[0]]
      if (component && component !== '*' && component !== '?') {
        items = component.split(',').sort(itemSorter)
        const { length } = items
        for (let i = 0; i < length; i++) {
          parse(items[i], schedule, field, f[1], f[2], f[3])
        }
      }
    }

    return schedule
  }

  function prepareExpr (expr) {
    const prepared = expr.toUpperCase()
    return REPLACEMENTS[prepared] || prepared
  }

  const e = prepareExpr(expr)
  return parseExpr(hasSeconds ? e : '0 ' + e)
}
