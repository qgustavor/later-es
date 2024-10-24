import { NEVER, DAYS_IN_MONTH, WEEK, DAY, MIN, SEC } from './constants.mjs'

export const day = {
  name: 'day',
  range: 86400,
  val (d, timezone) {
    return d.date || (d.date = timezone.getDate.call(d, timezone))
  },
  isValid (d, timezone, value) {
    return day.val(d, timezone) === (value || day.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    if (d.DExtent) return d.DExtent
    const extentMonth = month.val(d, timezone)
    let max = DAYS_IN_MONTH[extentMonth - 1]
    if (extentMonth === 2 && dayOfYear.extent(d, timezone)[1] === 366) {
      max += 1
    }

    return (d.DExtent = [1, max])
  },
  start (d, timezone) {
    return (
      d.DStart ||
      (d.DStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.DEnd ||
      (d.DEnd = timezone.prev(year.val(d, timezone), month.val(d, timezone), day.val(d, timezone)))
    )
  },
  next (d, timezone, value) {
    value = value > day.extent(d, timezone)[1] ? 1 : value
    const nextMonth = timezone.nextRollover(d, timezone, value, day, month)
    const DMax = day.extent(nextMonth)[1]
    value = value > DMax ? 1 : value || DMax
    return timezone.next(year.val(nextMonth), month.val(nextMonth), value)
  },
  prev (d, timezone, value) {
    const prevMonth = timezone.prevRollover(d, timezone, value, day, month)
    const DMax = day.extent(prevMonth)[1]
    return timezone.prev(
      year.val(prevMonth),
      month.val(prevMonth),
      value > DMax ? DMax : value || DMax
    )
  }
}
export const dayOfWeekCount = {
  name: 'day of week count',
  range: 604800,
  val (d, timezone) {
    return d.dayOfWeekCount || (d.dayOfWeekCount = Math.floor((day.val(d, timezone) - 1) / 7) + 1)
  },
  isValid (d, timezone, value) {
    return (
      dayOfWeekCount.val(d, timezone) === value ||
      (value === 0 && day.val(d, timezone) > day.extent(d, timezone)[1] - 7)
    )
  },
  extent (d, timezone) {
    return (
      d.dcExtent || (d.dcExtent = [1, Math.ceil(day.extent(d, timezone)[1] / 7)])
    )
  },
  start (d, timezone) {
    return (
      d.dcStart ||
      (d.dcStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.max(1, (dayOfWeekCount.val(d, timezone) - 1) * 7 + 1 || 1)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.dcEnd ||
      (d.dcEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.min(dayOfWeekCount.val(d, timezone) * 7, day.extent(d, timezone)[1])
      ))
    )
  },
  next (d, timezone, value) {
    value = value > dayOfWeekCount.extent(d, timezone)[1] ? 1 : value
    let nextMonth = timezone.nextRollover(d, timezone, value, dayOfWeekCount, month)
    const dcMax = dayOfWeekCount.extent(nextMonth)[1]
    value = value > dcMax ? 1 : value
    const next = timezone.next(
      year.val(nextMonth),
      month.val(nextMonth),
      value === 0 ? day.extent(nextMonth)[1] - 6 : 1 + 7 * (value - 1)
    )
    if (next.getTime() <= d.getTime()) {
      nextMonth = month.next(d, timezone, month.val(d, timezone) + 1)
      return timezone.next(
        year.val(nextMonth),
        month.val(nextMonth),
        value === 0 ? day.extent(nextMonth)[1] - 6 : 1 + 7 * (value - 1)
      )
    }

    return next
  },
  prev (d, timezone, value) {
    const prevMonth = timezone.prevRollover(d, timezone, value, dayOfWeekCount, month)
    const dcMax = dayOfWeekCount.extent(prevMonth)[1]
    value = value > dcMax ? dcMax : value || dcMax
    return dayOfWeekCount.end(
      timezone.prev(
        year.val(prevMonth),
        month.val(prevMonth),
        1 + 7 * (value - 1)
      )
    )
  }
}
export const dayOfWeek = {
  name: 'day of week',
  range: 86400,
  val (d, timezone) {
    return d.dayOfWeek || (d.dayOfWeek = timezone.getDay.call(d, timezone) + 1)
  },
  isValid (d, timezone, value) {
    return dayOfWeek.val(d, timezone) === (value || 7)
  },
  extent () {
    return [1, 7]
  },
  start (d, timezone) {
    return day.start(d, timezone)
  },
  end (d, timezone) {
    return day.end(d, timezone)
  },
  next (d, timezone, value) {
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
export const dayOfYear = {
  name: 'day of year',
  range: 86400,
  val (d, timezone) {
    return (
      d.dayOfYear ||
      (d.dayOfYear = Math.ceil(
        1 +
          (day.start(d, timezone).getTime() - year.start(d, timezone).getTime()) / DAY
      ))
    )
  },
  isValid (d, timezone, value) {
    return dayOfYear.val(d, timezone) === (value || dayOfYear.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    const extentYear = year.val(d, timezone)
    return d.dyExtent || (d.dyExtent = [1, extentYear % 4 ? 365 : 366])
  },
  start (d, timezone) {
    return day.start(d, timezone)
  },
  end (d, timezone) {
    return day.end(d, timezone)
  },
  next (d, timezone, value) {
    value = value > dayOfYear.extent(d, timezone)[1] ? 1 : value
    const nextYear = timezone.nextRollover(d, timezone, value, dayOfYear, year)
    const dyMax = dayOfYear.extent(nextYear)[1]
    value = value > dyMax ? 1 : value || dyMax
    return timezone.next(year.val(nextYear), month.val(nextYear), value)
  },
  prev (d, timezone, value) {
    const prevYear = timezone.prevRollover(d, timezone, value, dayOfYear, year)
    const dyMax = dayOfYear.extent(prevYear)[1]
    value = value > dyMax ? dyMax : value || dyMax
    return timezone.prev(year.val(prevYear), month.val(prevYear), value)
  }
}
export const hour = {
  name: 'hour',
  range: 3600,
  val (d, timezone) {
    return d.hour || (d.hour = timezone.getHour.call(d, timezone))
  },
  isValid (d, timezone, value) {
    return hour.val(d, timezone) === value
  },
  extent () {
    return [0, 23]
  },
  start (d, timezone) {
    return (
      d.hStart ||
      (d.hStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.hEnd ||
      (d.hEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone)
      ))
    )
  },
  next (d, timezone, value) {
    value = value > 23 ? 0 : value
    let next = timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value <= hour.val(d, timezone) ? 1 : 0),
      value
    )
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = timezone.next(
        year.val(next),
        month.val(next),
        day.val(next),
        value + 1
      )
    }

    return next
  },
  prev (d, timezone, value) {
    value = value > 23 ? 23 : value
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value >= hour.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
export const minute = {
  name: 'minute',
  range: 60,
  val (d, timezone) {
    return d.minute || (d.minute = timezone.getMin.call(d, timezone))
  },
  isValid (d, timezone, value) {
    return minute.val(d, timezone) === value
  },
  extent (d, timezone) {
    return [0, 59]
  },
  start (d, timezone) {
    return (
      d.mStart ||
      (d.mStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone),
        minute.val(d, timezone)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.mEnd ||
      (d.mEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone),
        hour.val(d, timezone),
        minute.val(d, timezone)
      ))
    )
  },
  next (d, timezone, value) {
    const m = minute.val(d, timezone)
    const s = second.val(d, timezone)
    const inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m
    let next = new Date(d.getTime() + inc * MIN - s * SEC)
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * MIN - s * SEC)
    }

    return next
  },
  prev (d, timezone, value) {
    value = value > 59 ? 59 : value
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone),
      hour.val(d, timezone) + (value >= minute.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
export const month = {
  name: 'month',
  range: 2629740,
  val (d, timezone) {
    return d.month || (d.month = timezone.getMonth.call(d, timezone) + 1)
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
export const second = {
  name: 'second',
  range: 1,
  val (d, timezone) {
    return d.second || (d.second = timezone.getSec.call(d, timezone))
  },
  isValid (d, timezone, value) {
    return second.val(d, timezone) === value
  },
  extent () {
    return [0, 59]
  },
  start (d, timezone) {
    return d
  },
  end (d, timezone) {
    return d
  },
  next (d, timezone, value) {
    const s = second.val(d, timezone)
    const inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s
    let next = new Date(d.getTime() + inc * SEC)
    if (!timezone.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * SEC)
    }

    return next
  },
  prev (d, timezone, value, cache) {
    value = value > 59 ? 59 : value
    return timezone.prev(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone),
      hour.val(d, timezone),
      minute.val(d, timezone) + (value >= second.val(d, timezone) ? -1 : 0),
      value
    )
  }
}
export const time = {
  name: 'time',
  range: 1,
  val (d, timezone) {
    return (
      d.time ||
      (d.time = hour.val(d, timezone) * 3600 + minute.val(d, timezone) * 60 + second.val(d, timezone))
    )
  },
  isValid (d, timezone, value) {
    return time.val(d, timezone) === value
  },
  extent () {
    return [0, 86399]
  },
  start (d, timezone) {
    return d
  },
  end (d, timezone) {
    return d
  },
  next (d, timezone, value) {
    value = value > 86399 ? 0 : value
    let next = timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value <= time.val(d, timezone) ? 1 : 0),
      0,
      0,
      value
    )
    if (!timezone.isUTC && next.getTime() < d.getTime()) {
      next = timezone.next(
        year.val(next),
        month.val(next),
        day.val(next),
        hour.val(next),
        minute.val(next),
        value + 7200
      )
    }

    return next
  },
  prev (d, timezone, value) {
    value = value > 86399 ? 86399 : value
    return timezone.next(
      year.val(d, timezone),
      month.val(d, timezone),
      day.val(d, timezone) + (value >= time.val(d, timezone) ? -1 : 0),
      0,
      0,
      value
    )
  }
}
export const weekOfMonth = {
  name: 'week of month',
  range: 604800,
  val (d, timezone) {
    return (
      d.weekOfMonth ||
      (d.weekOfMonth =
        (day.val(d, timezone) +
          (dayOfWeek.val(month.start(d, timezone)) - 1) +
          (7 - dayOfWeek.val(d, timezone))) /
        7)
    )
  },
  isValid (d, timezone, value) {
    return weekOfMonth.val(d, timezone) === (value || weekOfMonth.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    return (
      d.wmExtent ||
      (d.wmExtent = [
        1,
        (day.extent(d, timezone)[1] +
          (dayOfWeek.val(month.start(d, timezone)) - 1) +
          (7 - dayOfWeek.val(month.end(d, timezone)))) /
          7
      ])
    )
  },
  start (d, timezone) {
    return (
      d.wmStart ||
      (d.wmStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.max(day.val(d, timezone) - dayOfWeek.val(d, timezone) + 1, 1)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.wmEnd ||
      (d.wmEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        Math.min(day.val(d, timezone) + (7 - dayOfWeek.val(d, timezone)), day.extent(d, timezone)[1])
      ))
    )
  },
  next (d, timezone, value) {
    value = value > weekOfMonth.extent(d, timezone)[1] ? 1 : value
    const nextMonth = timezone.nextRollover(d, timezone, value, weekOfMonth, month)
    const wmMax = weekOfMonth.extent(nextMonth)[1]
    value = value > wmMax ? 1 : value || wmMax
    return timezone.next(
      year.val(nextMonth),
      month.val(nextMonth),
      Math.max(1, (value - 1) * 7 - (dayOfWeek.val(nextMonth) - 2))
    )
  },
  prev (d, timezone, value) {
    const prevMonth = timezone.prevRollover(d, timezone, value, weekOfMonth, month)
    const wmMax = weekOfMonth.extent(prevMonth)[1]
    value = value > wmMax ? wmMax : value || wmMax
    return weekOfMonth.end(
      timezone.next(
        year.val(prevMonth),
        month.val(prevMonth),
        Math.max(1, (value - 1) * 7 - (dayOfWeek.val(prevMonth) - 2))
      )
    )
  }
}
export const weekOfYear = {
  name: 'week of year (ISO)',
  range: 604800,
  val (d, timezone) {
    if (d.weekOfMonth) return d.weekOfMonth
    const wThur = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    const YThur = dayOfWeek.next(year.prev(wThur, year.val(wThur) - 1), 5)
    return (d.weekOfMonth =
      1 + Math.ceil((wThur.getTime() - YThur.getTime()) / WEEK))
  },
  isValid (d, timezone, value) {
    return weekOfYear.val(d, timezone) === (value || weekOfYear.extent(d, timezone)[1])
  },
  extent (d, timezone) {
    if (d.wyExtent) return d.wyExtent
    const extentYear = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    const dwFirst = dayOfWeek.val(year.start(extentYear))
    const dwLast = dayOfWeek.val(year.end(extentYear))
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52])
  },
  start (d, timezone) {
    return (
      d.wyStart ||
      (d.wyStart = timezone.next(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone) - (dayOfWeek.val(d, timezone) > 1 ? dayOfWeek.val(d, timezone) - 2 : 6)
      ))
    )
  },
  end (d, timezone) {
    return (
      d.wyEnd ||
      (d.wyEnd = timezone.prev(
        year.val(d, timezone),
        month.val(d, timezone),
        day.val(d, timezone) + (dayOfWeek.val(d, timezone) > 1 ? 8 - dayOfWeek.val(d, timezone) : 0)
      ))
    )
  },
  next (d, timezone, value) {
    value = value > weekOfYear.extent(d, timezone)[1] ? 1 : value
    const wyThur = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    let nextYear = timezone.nextRollover(wyThur, value, weekOfYear, year)
    if (weekOfYear.val(nextYear) !== 1) {
      nextYear = dayOfWeek.next(nextYear, 2)
    }

    const wyMax = weekOfYear.extent(nextYear)[1]
    const wyStart = weekOfYear.start(nextYear)
    value = value > wyMax ? 1 : value || wyMax
    return timezone.next(
      year.val(wyStart),
      month.val(wyStart),
      day.val(wyStart) + 7 * (value - 1)
    )
  },
  prev (d, timezone, value) {
    const wyThur = dayOfWeek.next(weekOfYear.start(d, timezone), 5)
    let prevYear = timezone.prevRollover(wyThur, value, weekOfYear, year)
    if (weekOfYear.val(prevYear) !== 1) {
      prevYear = dayOfWeek.next(prevYear, 2)
    }

    const wyMax = weekOfYear.extent(prevYear)[1]
    const wyEnd = weekOfYear.end(prevYear)
    value = value > wyMax ? wyMax : value || wyMax
    return weekOfYear.end(
      timezone.next(
        year.val(wyEnd, timezone),
        month.val(wyEnd, timezone),
        day.val(wyEnd, timezone) + 7 * (value - 1)
      )
    )
  }
}
export const year = {
  name: 'year',
  range: 31556900,
  val (d, timezone) {
    return d.year || (d.year = timezone.getYear.call(d, timezone))
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
