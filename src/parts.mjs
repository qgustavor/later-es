import { NEVER } from './constants.mjs'

export const day = {
  name: 'day',
  range: 86400,
  val(d) {
    return d.D || (d.D = later.date.getDate.call(d));
  },
  isValid(d, value) {
    return later.day.val(d) === (value || later.day.extent(d)[1]);
  },
  extent(d) {
    if (d.DExtent) return d.DExtent;
    const month = later.month.val(d);
    let max = later.DAYS_IN_MONTH[month - 1];
    if (month === 2 && later.dayOfYear.extent(d)[1] === 366) {
      max += 1;
    }

    return (d.DExtent = [1, max]);
  },
  start(d) {
    return (
      d.DStart ||
      (d.DStart = later.date.next(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.DEnd ||
      (d.DEnd = later.date.prev(later.year.val(d), later.month.val(d), later.day.val(d)))
    );
  },
  next(d, value) {
    value = value > later.day.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.day, later.month);
    const DMax = later.day.extent(month)[1];
    value = value > DMax ? 1 : value || DMax;
    return later.date.next(later.year.val(month), later.month.val(month), value);
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.day, later.month);
    const DMax = later.day.extent(month)[1];
    return later.date.prev(
      later.year.val(month),
      later.month.val(month),
      value > DMax ? DMax : value || DMax
    );
  }
};
export const dayOfWeekCount = {
  name: 'day of week count',
  range: 604800,
  val(d) {
    return d.dc || (d.dc = Math.floor((later.day.val(d) - 1) / 7) + 1);
  },
  isValid(d, value) {
    return (
      later.dayOfWeekCount.val(d) === value ||
      (value === 0 && later.day.val(d) > later.day.extent(d)[1] - 7)
    );
  },
  extent(d) {
    return (
      d.dcExtent || (d.dcExtent = [1, Math.ceil(later.day.extent(d)[1] / 7)])
    );
  },
  start(d) {
    return (
      d.dcStart ||
      (d.dcStart = later.date.next(
        later.year.val(d),
        later.month.val(d),
        Math.max(1, (later.dayOfWeekCount.val(d) - 1) * 7 + 1 || 1)
      ))
    );
  },
  end(d) {
    return (
      d.dcEnd ||
      (d.dcEnd = later.date.prev(
        later.year.val(d),
        later.month.val(d),
        Math.min(later.dayOfWeekCount.val(d) * 7, later.day.extent(d)[1])
      ))
    );
  },
  next(d, value) {
    value = value > later.dayOfWeekCount.extent(d)[1] ? 1 : value;
    let month = later.date.nextRollover(d, value, later.dayOfWeekCount, later.month);
    const dcMax = later.dayOfWeekCount.extent(month)[1];
    value = value > dcMax ? 1 : value;
    const next = later.date.next(
      later.year.val(month),
      later.month.val(month),
      value === 0 ? later.day.extent(month)[1] - 6 : 1 + 7 * (value - 1)
    );
    if (next.getTime() <= d.getTime()) {
      month = later.month.next(d, later.month.val(d) + 1);
      return later.date.next(
        later.year.val(month),
        later.month.val(month),
        value === 0 ? later.day.extent(month)[1] - 6 : 1 + 7 * (value - 1)
      );
    }

    return next;
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.dayOfWeekCount, later.month);
    const dcMax = later.dayOfWeekCount.extent(month)[1];
    value = value > dcMax ? dcMax : value || dcMax;
    return later.dayOfWeekCount.end(
      later.date.prev(
        later.year.val(month),
        later.month.val(month),
        1 + 7 * (value - 1)
      )
    );
  }
};
export const dayOfWeek = {
  name: 'day of week',
  range: 86400,
  val(d) {
    return d.dw || (d.dw = later.date.getDay.call(d) + 1);
  },
  isValid(d, value) {
    return later.dayOfWeek.val(d) === (value || 7);
  },
  extent() {
    return [1, 7];
  },
  start(d) {
    return later.day.start(d);
  },
  end(d) {
    return later.day.end(d);
  },
  next(d, value) {
    value = value > 7 ? 1 : value || 7;
    return later.date.next(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d) +
        (value - later.dayOfWeek.val(d)) +
        (value <= later.dayOfWeek.val(d) ? 7 : 0)
    );
  },
  prev(d, value) {
    value = value > 7 ? 7 : value || 7;
    return later.date.prev(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d) +
        (value - later.dayOfWeek.val(d)) +
        (value >= later.dayOfWeek.val(d) ? -7 : 0)
    );
  }
};
export const dayOfYear  = {
  name: 'day of year',
  range: 86400,
  val(d) {
    return (
      d.dy ||
      (d.dy = Math.ceil(
        1 +
          (later.day.start(d).getTime() - later.year.start(d).getTime()) / later.DAY
      ))
    );
  },
  isValid(d, value) {
    return later.dayOfYear.val(d) === (value || later.dayOfYear.extent(d)[1]);
  },
  extent(d) {
    const year = later.year.val(d);
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
  },
  start(d) {
    return later.day.start(d);
  },
  end(d) {
    return later.day.end(d);
  },
  next(d, value) {
    value = value > later.dayOfYear.extent(d)[1] ? 1 : value;
    const year = later.date.nextRollover(d, value, later.dayOfYear, later.year);
    const dyMax = later.dayOfYear.extent(year)[1];
    value = value > dyMax ? 1 : value || dyMax;
    return later.date.next(later.year.val(year), later.month.val(year), value);
  },
  prev(d, value) {
    const year = later.date.prevRollover(d, value, later.dayOfYear, later.year);
    const dyMax = later.dayOfYear.extent(year)[1];
    value = value > dyMax ? dyMax : value || dyMax;
    return later.date.prev(later.year.val(year), later.month.val(year), value);
  }
};
export const hour = {
  name: 'hour',
  range: 3600,
  val(d) {
    return d.h || (d.h = later.date.getHour.call(d));
  },
  isValid(d, value) {
    return later.hour.val(d) === value;
  },
  extent() {
    return [0, 23];
  },
  start(d) {
    return (
      d.hStart ||
      (d.hStart = later.date.next(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d),
        later.hour.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.hEnd ||
      (d.hEnd = later.date.prev(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d),
        later.hour.val(d)
      ))
    );
  },
  next(d, value) {
    value = value > 23 ? 0 : value;
    let next = later.date.next(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d) + (value <= later.hour.val(d) ? 1 : 0),
      value
    );
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = later.date.next(
        later.year.val(next),
        later.month.val(next),
        later.day.val(next),
        value + 1
      );
    }

    return next;
  },
  prev(d, value) {
    value = value > 23 ? 23 : value;
    return later.date.prev(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d) + (value >= later.hour.val(d) ? -1 : 0),
      value
    );
  }
};
export const minute = {
  name: 'minute',
  range: 60,
  val(d) {
    return d.m || (d.m = later.date.getMin.call(d));
  },
  isValid(d, value) {
    return later.minute.val(d) === value;
  },
  extent(d) {
    return [0, 59];
  },
  start(d) {
    return (
      d.mStart ||
      (d.mStart = later.date.next(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d),
        later.hour.val(d),
        later.minute.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.mEnd ||
      (d.mEnd = later.date.prev(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d),
        later.hour.val(d),
        later.minute.val(d)
      ))
    );
  },
  next(d, value) {
    const m = later.minute.val(d);
    const s = later.second.val(d);
    const inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m;
    let next = new Date(d.getTime() + inc * later.MIN - s * later.SEC);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * later.MIN - s * later.SEC);
    }

    return next;
  },
  prev(d, value) {
    value = value > 59 ? 59 : value;
    return later.date.prev(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d),
      later.hour.val(d) + (value >= later.minute.val(d) ? -1 : 0),
      value
    );
  }
};
export const month = {
  name: 'month',
  range: 2629740,
  val(d) {
    return d.M || (d.M = later.date.getMonth.call(d) + 1);
  },
  isValid(d, value) {
    return later.month.val(d) === (value || 12);
  },
  extent() {
    return [1, 12];
  },
  start(d) {
    return (
      d.MStart || (d.MStart = later.date.next(later.year.val(d), later.month.val(d)))
    );
  },
  end(d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.year.val(d), later.month.val(d)));
  },
  next(d, value) {
    value = value > 12 ? 1 : value || 12;
    return later.date.next(
      later.year.val(d) + (value > later.month.val(d) ? 0 : 1),
      value
    );
  },
  prev(d, value) {
    value = value > 12 ? 12 : value || 12;
    return later.date.prev(
      later.year.val(d) - (value >= later.month.val(d) ? 1 : 0),
      value
    );
  }
};
export const second = {
  name: 'second',
  range: 1,
  val(d) {
    return d.s || (d.s = later.date.getSec.call(d));
  },
  isValid(d, value) {
    return later.second.val(d) === value;
  },
  extent() {
    return [0, 59];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    const s = later.second.val(d);
    const inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s;
    let next = new Date(d.getTime() + inc * later.SEC);
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * later.SEC);
    }

    return next;
  },
  prev(d, value, cache) {
    value = value > 59 ? 59 : value;
    return later.date.prev(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d),
      later.hour.val(d),
      later.minute.val(d) + (value >= later.second.val(d) ? -1 : 0),
      value
    );
  }
};
export const time = {
  name: 'time',
  range: 1,
  val(d) {
    return (
      d.t ||
      (d.t = later.hour.val(d) * 3600 + later.minute.val(d) * 60 + later.second.val(d))
    );
  },
  isValid(d, value) {
    return later.time.val(d) === value;
  },
  extent() {
    return [0, 86399];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    value = value > 86399 ? 0 : value;
    let next = later.date.next(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d) + (value <= later.time.val(d) ? 1 : 0),
      0,
      0,
      value
    );
    if (!later.date.isUTC && next.getTime() < d.getTime()) {
      next = later.date.next(
        later.year.val(next),
        later.month.val(next),
        later.day.val(next),
        later.hour.val(next),
        later.minute.val(next),
        value + 7200
      );
    }

    return next;
  },
  prev(d, value) {
    value = value > 86399 ? 86399 : value;
    return later.date.next(
      later.year.val(d),
      later.month.val(d),
      later.day.val(d) + (value >= later.time.val(d) ? -1 : 0),
      0,
      0,
      value
    );
  }
};
export const weekOfMonth = {
  name: 'week of month',
  range: 604800,
  val(d) {
    return (
      d.wm ||
      (d.wm =
        (later.day.val(d) +
          (later.dayOfWeek.val(later.month.start(d)) - 1) +
          (7 - later.dayOfWeek.val(d))) /
        7)
    );
  },
  isValid(d, value) {
    return later.weekOfMonth.val(d) === (value || later.weekOfMonth.extent(d)[1]);
  },
  extent(d) {
    return (
      d.wmExtent ||
      (d.wmExtent = [
        1,
        (later.day.extent(d)[1] +
          (later.dayOfWeek.val(later.month.start(d)) - 1) +
          (7 - later.dayOfWeek.val(later.month.end(d)))) /
          7
      ])
    );
  },
  start(d) {
    return (
      d.wmStart ||
      (d.wmStart = later.date.next(
        later.year.val(d),
        later.month.val(d),
        Math.max(later.day.val(d) - later.dayOfWeek.val(d) + 1, 1)
      ))
    );
  },
  end(d) {
    return (
      d.wmEnd ||
      (d.wmEnd = later.date.prev(
        later.year.val(d),
        later.month.val(d),
        Math.min(later.day.val(d) + (7 - later.dayOfWeek.val(d)), later.day.extent(d)[1])
      ))
    );
  },
  next(d, value) {
    value = value > later.weekOfMonth.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.weekOfMonth, later.month);
    const wmMax = later.weekOfMonth.extent(month)[1];
    value = value > wmMax ? 1 : value || wmMax;
    return later.date.next(
      later.year.val(month),
      later.month.val(month),
      Math.max(1, (value - 1) * 7 - (later.dayOfWeek.val(month) - 2))
    );
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.weekOfMonth, later.month);
    const wmMax = later.weekOfMonth.extent(month)[1];
    value = value > wmMax ? wmMax : value || wmMax;
    return later.weekOfMonth.end(
      later.date.next(
        later.year.val(month),
        later.month.val(month),
        Math.max(1, (value - 1) * 7 - (later.dayOfWeek.val(month) - 2))
      )
    );
  }
};
export const weekOfYear = {
  name: 'week of year (ISO)',
  range: 604800,
  val(d) {
    if (d.wy) return d.wy;
    const wThur = later.dayOfWeek.next(later.weekOfYear.start(d), 5);
    const YThur = later.dayOfWeek.next(later.year.prev(wThur, later.year.val(wThur) - 1), 5);
    return (d.wy =
      1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK));
  },
  isValid(d, value) {
    return later.weekOfYear.val(d) === (value || later.weekOfYear.extent(d)[1]);
  },
  extent(d) {
    if (d.wyExtent) return d.wyExtent;
    const year = later.dayOfWeek.next(later.weekOfYear.start(d), 5);
    const dwFirst = later.dayOfWeek.val(later.year.start(year));
    const dwLast = later.dayOfWeek.val(later.year.end(year));
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },
  start(d) {
    return (
      d.wyStart ||
      (d.wyStart = later.date.next(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d) - (later.dayOfWeek.val(d) > 1 ? later.dayOfWeek.val(d) - 2 : 6)
      ))
    );
  },
  end(d) {
    return (
      d.wyEnd ||
      (d.wyEnd = later.date.prev(
        later.year.val(d),
        later.month.val(d),
        later.day.val(d) + (later.dayOfWeek.val(d) > 1 ? 8 - later.dayOfWeek.val(d) : 0)
      ))
    );
  },
  next(d, value) {
    value = value > later.weekOfYear.extent(d)[1] ? 1 : value;
    const wyThur = later.dayOfWeek.next(later.weekOfYear.start(d), 5);
    let year = later.date.nextRollover(wyThur, value, later.weekOfYear, later.year);
    if (later.weekOfYear.val(year) !== 1) {
      year = later.dayOfWeek.next(year, 2);
    }

    const wyMax = later.weekOfYear.extent(year)[1];
    const wyStart = later.weekOfYear.start(year);
    value = value > wyMax ? 1 : value || wyMax;
    return later.date.next(
      later.year.val(wyStart),
      later.month.val(wyStart),
      later.day.val(wyStart) + 7 * (value - 1)
    );
  },
  prev(d, value) {
    const wyThur = later.dayOfWeek.next(later.weekOfYear.start(d), 5);
    let year = later.date.prevRollover(wyThur, value, later.weekOfYear, later.year);
    if (later.weekOfYear.val(year) !== 1) {
      year = later.dayOfWeek.next(year, 2);
    }

    const wyMax = later.weekOfYear.extent(year)[1];
    const wyEnd = later.weekOfYear.end(year);
    value = value > wyMax ? wyMax : value || wyMax;
    return later.weekOfYear.end(
      later.date.next(
        later.year.val(wyEnd),
        later.month.val(wyEnd),
        later.day.val(wyEnd) + 7 * (value - 1)
      )
    );
  }
};
export const year = {
  name: 'year',
  range: 31556900,
  val(d) {
    return d.Y || (d.Y = later.date.getYear.call(d));
  },
  isValid(d, value) {
    return later.year.val(d) === value;
  },
  extent() {
    return [1970, 2099];
  },
  start(d) {
    return d.YStart || (d.YStart = later.date.next(later.year.val(d)));
  },
  end(d) {
    return d.YEnd || (d.YEnd = later.date.prev(later.year.val(d)));
  },
  next(d, value) {
    return value > later.year.val(d) && value <= later.year.extent()[1]
      ? later.date.next(value)
      : NEVER;
  },
  prev(d, value) {
    return value < later.year.val(d) && value >= later.year.extent()[0]
      ? later.date.prev(value)
      : NEVER;
  }
};
export const fullDate = {
  name: 'full date',
  range: 1,
  val(d) {
    return d.fd || (d.fd = d.getTime());
  },
  isValid(d, value) {
    return later.fullDate.val(d) === value;
  },
  extent() {
    return [0, 3250368e7];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    return later.fullDate.val(d) < value ? new Date(value) : NEVER;
  },
  prev(d, value) {
    return later.fullDate.val(d) > value ? new Date(value) : NEVER;
  }
};
