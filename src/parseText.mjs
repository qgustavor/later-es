import { recur } from './recur.mjs'

export function parseText (string, languageDefinition) {
  if (!languageDefinition) throw Error('Missing language definition')
  const { TOKENTYPES, NAMES } = languageDefinition
  let pos = 0
  let input = ''
  let error
  function t (start, end, text, type) {
    return {
      startPos: start,
      endPos: end,
      text,
      type
    }
  }

  function peek (expected) {
    const scanTokens = Array.isArray(expected) ? expected : [expected]
    const whiteSpace = /\s+/
    let token
    let curInput
    let m
    let scanToken
    let start
    let length_
    scanTokens.push(whiteSpace)
    start = pos
    while (!token || token.type === whiteSpace) {
      length_ = -1
      curInput = input.slice(Math.max(0, start))
      token = t(start, start, input.split(whiteSpace)[0])
      const { length } = scanTokens
      for (let i = 0; i < length; i++) {
        scanToken = scanTokens[i]
        m = scanToken.exec(curInput)
        if (m && m.index === 0 && m[0].length > length_) {
          length_ = m[0].length
          token = t(
            start,
            start + length_,
            curInput.slice(0, Math.max(0, length_)),
            scanToken
          )
        }
      }

      if (token.type === whiteSpace) {
        start = token.endPos
      }
    }

    return token
  }

  function scan (expectedToken) {
    const token = peek(expectedToken)
    pos = token.endPos
    return token
  }

  function parseThroughExpr (tokenType) {
    const start = Number(parseTokenValue(tokenType))
    const end = checkAndParse(TOKENTYPES.through)
      ? Number(parseTokenValue(tokenType))
      : start
    const nums = []
    for (let i = start; i <= end; i++) {
      nums.push(i)
    }

    return nums
  }

  function parseRanges (tokenType) {
    let nums = parseThroughExpr(tokenType)
    while (checkAndParse(TOKENTYPES.and)) {
      nums = nums.concat(parseThroughExpr(tokenType))
    }

    return nums
  }

  function parseEvery (r) {
    let number
    let period
    let start
    let end
    if (checkAndParse(TOKENTYPES.weekend)) {
      r.on(NAMES.sun, NAMES.sat).dayOfWeek()
    } else if (checkAndParse(TOKENTYPES.weekday)) {
      r.on(NAMES.mon, NAMES.tue, NAMES.wed, NAMES.thu, NAMES.fri).dayOfWeek()
    } else {
      number = parseTokenValue(TOKENTYPES.rank)
      r.every(number)
      period = parseTimePeriod(r)
      if (checkAndParse(TOKENTYPES.start)) {
        number = parseTokenValue(TOKENTYPES.rank)
        r.startingOn(number)
        parseToken(period.type)
      } else if (checkAndParse(TOKENTYPES.between)) {
        start = parseTokenValue(TOKENTYPES.rank)
        if (checkAndParse(TOKENTYPES.and)) {
          end = parseTokenValue(TOKENTYPES.rank)
          r.between(start, end)
        }
      }
    }
  }

  function parseOnThe (r) {
    if (checkAndParse(TOKENTYPES.first)) {
      r.first()
    } else if (checkAndParse(TOKENTYPES.last)) {
      r.last()
    } else {
      r.on(parseRanges(TOKENTYPES.rank))
    }

    parseTimePeriod(r)
  }

  function parseScheduleExpr (string_) {
    pos = 0
    input = string_
    error = -1
    const r = recur()
    while (pos < input.length && error < 0) {
      const token = parseToken([
        TOKENTYPES.every,
        TOKENTYPES.after,
        TOKENTYPES.before,
        TOKENTYPES.onthe,
        TOKENTYPES.on,
        TOKENTYPES.of,
        TOKENTYPES.in,
        TOKENTYPES.at,
        TOKENTYPES.and,
        TOKENTYPES.except,
        TOKENTYPES.also
      ])
      switch (token.type) {
        case TOKENTYPES.every:
          parseEvery(r)
          break

        case TOKENTYPES.after:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.after(parseTokenValue(TOKENTYPES.time))
            r.time()
          } else {
            r.after(parseTokenValue(TOKENTYPES.rank))
            parseTimePeriod(r)
          }

          break

        case TOKENTYPES.before:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.before(parseTokenValue(TOKENTYPES.time))
            r.time()
          } else {
            r.before(parseTokenValue(TOKENTYPES.rank))
            parseTimePeriod(r)
          }

          break

        case TOKENTYPES.onthe:
          parseOnThe(r)
          break

        case TOKENTYPES.on:
          r.on(parseRanges(TOKENTYPES.dayName)).dayOfWeek()
          break

        case TOKENTYPES.of:
          r.on(parseRanges(TOKENTYPES.monthName)).month()
          break

        case TOKENTYPES.in:
          r.on(parseRanges(TOKENTYPES.yearIndex)).year()
          break

        case TOKENTYPES.at:
          r.on(parseTokenValue(TOKENTYPES.time)).time()
          while (checkAndParse(TOKENTYPES.and)) {
            r.on(parseTokenValue(TOKENTYPES.time)).time()
          }

          break

        case TOKENTYPES.and:
          break

        case TOKENTYPES.also:
          r.and()
          break

        case TOKENTYPES.except:
          r.except()
          break

        default:
          error = pos
      }
    }

    return {
      schedules: r.schedules,
      exceptions: r.exceptions,
      error
    }
  }

  function parseTimePeriod (r) {
    const timePeriod = parseToken([
      TOKENTYPES.second,
      TOKENTYPES.minute,
      TOKENTYPES.hour,
      TOKENTYPES.dayOfYear,
      TOKENTYPES.dayOfWeek,
      TOKENTYPES.dayInstance,
      TOKENTYPES.day,
      TOKENTYPES.month,
      TOKENTYPES.year,
      TOKENTYPES.weekOfMonth,
      TOKENTYPES.weekOfYear
    ])
    switch (timePeriod.type) {
      case TOKENTYPES.second:
        r.second()
        break

      case TOKENTYPES.minute:
        r.minute()
        break

      case TOKENTYPES.hour:
        r.hour()
        break

      case TOKENTYPES.dayOfYear:
        r.dayOfYear()
        break

      case TOKENTYPES.dayOfWeek:
        r.dayOfWeek()
        break

      case TOKENTYPES.dayInstance:
        r.dayOfWeekCount()
        break

      case TOKENTYPES.day:
        r.dayOfMonth()
        break

      case TOKENTYPES.weekOfMonth:
        r.weekOfMonth()
        break

      case TOKENTYPES.weekOfYear:
        r.weekOfYear()
        break

      case TOKENTYPES.month:
        r.month()
        break

      case TOKENTYPES.year:
        r.year()
        break

      default:
        error = pos
    }

    return timePeriod
  }

  function checkAndParse (tokenType) {
    const found = peek(tokenType).type === tokenType
    if (found) {
      scan(tokenType)
    }

    return found
  }

  function parseToken (tokenType) {
    const t = scan(tokenType)
    if (t.type) {
      t.text = convertString(t.text, tokenType)
    } else {
      error = pos
    }

    return t
  }

  function parseTokenValue (tokenType) {
    return parseToken(tokenType).text
  }

  function convertString (string_, tokenType) {
    let output = string_
    let parts, hour, min

    switch (tokenType) {
      case TOKENTYPES.time:
        parts = string_.split(/(:|am|pm)/)
        hour = Number.parseInt(parts[0], 10)
        min = parts[2].trim()
        if (parts[3] === 'pm' && hour < 12) {
          hour += 12
        } else if (parts[3] === 'am' && hour === 12) {
          hour -= 12
        }

        hour = String(hour)
        output = (hour.length === 1 ? '0' : '') + hour + ':' + min
        break

      case TOKENTYPES.rank:
        output = Number.parseInt(/^\d+/.exec(string_)[0], 10)
        break

      case TOKENTYPES.monthName:
      case TOKENTYPES.dayName:
        output = NAMES[string_.slice(0, 3)]
        break
    }

    return output
  }

  return parseScheduleExpr(string.toLowerCase())
}
