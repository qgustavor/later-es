export const day = {
  name: 'day',
  range: 86400,
  val(d) {
    return d.D || (d.D = later.date.getDate.call(d));
  },
  isValid(d, value) {
    return later.D.val(d) === (value || later.D.extent(d)[1]);
  },
  extent(d) {
    if (d.DExtent) return d.DExtent;
    const month = later.M.val(d);
    let max = later.DAYS_IN_MONTH[month - 1];
    if (month === 2 && later.dy.extent(d)[1] === 366) {
      max += 1;
    }

    return (d.DExtent = [1, max]);
  },
  start(d) {
    return (
      d.DStart ||
      (d.DStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.DEnd ||
      (d.DEnd = later.date.prev(later.Y.val(d), later.M.val(d), later.D.val(d)))
    );
  },
  next(d, value) {
    value = value > later.D.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.D, later.M);
    const DMax = later.D.extent(month)[1];
    value = value > DMax ? 1 : value || DMax;
    return later.date.next(later.Y.val(month), later.M.val(month), value);
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.D, later.M);
    const DMax = later.D.extent(month)[1];
    return later.date.prev(
      later.Y.val(month),
      later.M.val(month),
      value > DMax ? DMax : value || DMax
    );
  }
};
export const dayOfWeekCount = {
  name: 'day of week count',
  range: 604800,
  val(d) {
    return d.dc || (d.dc = Math.floor((later.D.val(d) - 1) / 7) + 1);
  },
  isValid(d, value) {
    return (
      later.dc.val(d) === value ||
      (value === 0 && later.D.val(d) > later.D.extent(d)[1] - 7)
    );
  },
  extent(d) {
    return (
      d.dcExtent || (d.dcExtent = [1, Math.ceil(later.D.extent(d)[1] / 7)])
    );
  },
  start(d) {
    return (
      d.dcStart ||
      (d.dcStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        Math.max(1, (later.dc.val(d) - 1) * 7 + 1 || 1)
      ))
    );
  },
  end(d) {
    return (
      d.dcEnd ||
      (d.dcEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        Math.min(later.dc.val(d) * 7, later.D.extent(d)[1])
      ))
    );
  },
  next(d, value) {
    value = value > later.dc.extent(d)[1] ? 1 : value;
    let month = later.date.nextRollover(d, value, later.dc, later.M);
    const dcMax = later.dc.extent(month)[1];
    value = value > dcMax ? 1 : value;
    const next = later.date.next(
      later.Y.val(month),
      later.M.val(month),
      value === 0 ? later.D.extent(month)[1] - 6 : 1 + 7 * (value - 1)
    );
    if (next.getTime() <= d.getTime()) {
      month = later.M.next(d, later.M.val(d) + 1);
      return later.date.next(
        later.Y.val(month),
        later.M.val(month),
        value === 0 ? later.D.extent(month)[1] - 6 : 1 + 7 * (value - 1)
      );
    }

    return next;
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.dc, later.M);
    const dcMax = later.dc.extent(month)[1];
    value = value > dcMax ? dcMax : value || dcMax;
    return later.dc.end(
      later.date.prev(
        later.Y.val(month),
        later.M.val(month),
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
    return later.dw.val(d) === (value || 7);
  },
  extent() {
    return [1, 7];
  },
  start(d) {
    return later.D.start(d);
  },
  end(d) {
    return later.D.end(d);
  },
  next(d, value) {
    value = value > 7 ? 1 : value || 7;
    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) +
        (value - later.dw.val(d)) +
        (value <= later.dw.val(d) ? 7 : 0)
    );
  },
  prev(d, value) {
    value = value > 7 ? 7 : value || 7;
    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) +
        (value - later.dw.val(d)) +
        (value >= later.dw.val(d) ? -7 : 0)
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
          (later.D.start(d).getTime() - later.Y.start(d).getTime()) / later.DAY
      ))
    );
  },
  isValid(d, value) {
    return later.dy.val(d) === (value || later.dy.extent(d)[1]);
  },
  extent(d) {
    const year = later.Y.val(d);
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
  },
  start(d) {
    return later.D.start(d);
  },
  end(d) {
    return later.D.end(d);
  },
  next(d, value) {
    value = value > later.dy.extent(d)[1] ? 1 : value;
    const year = later.date.nextRollover(d, value, later.dy, later.Y);
    const dyMax = later.dy.extent(year)[1];
    value = value > dyMax ? 1 : value || dyMax;
    return later.date.next(later.Y.val(year), later.M.val(year), value);
  },
  prev(d, value) {
    const year = later.date.prevRollover(d, value, later.dy, later.Y);
    const dyMax = later.dy.extent(year)[1];
    value = value > dyMax ? dyMax : value || dyMax;
    return later.date.prev(later.Y.val(year), later.M.val(year), value);
  }
};
export const hour = {
  name: 'hour',
  range: 3600,
  val(d) {
    return d.h || (d.h = later.date.getHour.call(d));
  },
  isValid(d, value) {
    return later.h.val(d) === value;
  },
  extent() {
    return [0, 23];
  },
  start(d) {
    return (
      d.hStart ||
      (d.hStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.hEnd ||
      (d.hEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d)
      ))
    );
  },
  next(d, value) {
    value = value > 23 ? 0 : value;
    let next = later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value <= later.h.val(d) ? 1 : 0),
      value
    );
    if (!later.date.isUTC && next.getTime() <= d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        value + 1
      );
    }

    return next;
  },
  prev(d, value) {
    value = value > 23 ? 23 : value;
    return later.date.prev(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value >= later.h.val(d) ? -1 : 0),
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
    return later.m.val(d) === value;
  },
  extent(d) {
    return [0, 59];
  },
  start(d) {
    return (
      d.mStart ||
      (d.mStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d),
        later.m.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.mEnd ||
      (d.mEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d),
        later.h.val(d),
        later.m.val(d)
      ))
    );
  },
  next(d, value) {
    const m = later.m.val(d);
    const s = later.s.val(d);
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
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d) + (value >= later.m.val(d) ? -1 : 0),
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
    return later.M.val(d) === (value || 12);
  },
  extent() {
    return [1, 12];
  },
  start(d) {
    return (
      d.MStart || (d.MStart = later.date.next(later.Y.val(d), later.M.val(d)))
    );
  },
  end(d) {
    return d.MEnd || (d.MEnd = later.date.prev(later.Y.val(d), later.M.val(d)));
  },
  next(d, value) {
    value = value > 12 ? 1 : value || 12;
    return later.date.next(
      later.Y.val(d) + (value > later.M.val(d) ? 0 : 1),
      value
    );
  },
  prev(d, value) {
    value = value > 12 ? 12 : value || 12;
    return later.date.prev(
      later.Y.val(d) - (value >= later.M.val(d) ? 1 : 0),
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
    return later.s.val(d) === value;
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
    const s = later.s.val(d);
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
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d),
      later.h.val(d),
      later.m.val(d) + (value >= later.s.val(d) ? -1 : 0),
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
      (d.t = later.h.val(d) * 3600 + later.m.val(d) * 60 + later.s.val(d))
    );
  },
  isValid(d, value) {
    return later.t.val(d) === value;
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
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value <= later.t.val(d) ? 1 : 0),
      0,
      0,
      value
    );
    if (!later.date.isUTC && next.getTime() < d.getTime()) {
      next = later.date.next(
        later.Y.val(next),
        later.M.val(next),
        later.D.val(next),
        later.h.val(next),
        later.m.val(next),
        value + 7200
      );
    }

    return next;
  },
  prev(d, value) {
    value = value > 86399 ? 86399 : value;
    return later.date.next(
      later.Y.val(d),
      later.M.val(d),
      later.D.val(d) + (value >= later.t.val(d) ? -1 : 0),
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
        (later.D.val(d) +
          (later.dw.val(later.M.start(d)) - 1) +
          (7 - later.dw.val(d))) /
        7)
    );
  },
  isValid(d, value) {
    return later.wm.val(d) === (value || later.wm.extent(d)[1]);
  },
  extent(d) {
    return (
      d.wmExtent ||
      (d.wmExtent = [
        1,
        (later.D.extent(d)[1] +
          (later.dw.val(later.M.start(d)) - 1) +
          (7 - later.dw.val(later.M.end(d)))) /
          7
      ])
    );
  },
  start(d) {
    return (
      d.wmStart ||
      (d.wmStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        Math.max(later.D.val(d) - later.dw.val(d) + 1, 1)
      ))
    );
  },
  end(d) {
    return (
      d.wmEnd ||
      (d.wmEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        Math.min(later.D.val(d) + (7 - later.dw.val(d)), later.D.extent(d)[1])
      ))
    );
  },
  next(d, value) {
    value = value > later.wm.extent(d)[1] ? 1 : value;
    const month = later.date.nextRollover(d, value, later.wm, later.M);
    const wmMax = later.wm.extent(month)[1];
    value = value > wmMax ? 1 : value || wmMax;
    return later.date.next(
      later.Y.val(month),
      later.M.val(month),
      Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))
    );
  },
  prev(d, value) {
    const month = later.date.prevRollover(d, value, later.wm, later.M);
    const wmMax = later.wm.extent(month)[1];
    value = value > wmMax ? wmMax : value || wmMax;
    return later.wm.end(
      later.date.next(
        later.Y.val(month),
        later.M.val(month),
        Math.max(1, (value - 1) * 7 - (later.dw.val(month) - 2))
      )
    );
  }
};
export const weekOfYear = {
  name: 'week of year (ISO)',
  range: 604800,
  val(d) {
    if (d.wy) return d.wy;
    const wThur = later.dw.next(later.wy.start(d), 5);
    const YThur = later.dw.next(later.Y.prev(wThur, later.Y.val(wThur) - 1), 5);
    return (d.wy =
      1 + Math.ceil((wThur.getTime() - YThur.getTime()) / later.WEEK));
  },
  isValid(d, value) {
    return later.wy.val(d) === (value || later.wy.extent(d)[1]);
  },
  extent(d) {
    if (d.wyExtent) return d.wyExtent;
    const year = later.dw.next(later.wy.start(d), 5);
    const dwFirst = later.dw.val(later.Y.start(year));
    const dwLast = later.dw.val(later.Y.end(year));
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },
  start(d) {
    return (
      d.wyStart ||
      (d.wyStart = later.date.next(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d) - (later.dw.val(d) > 1 ? later.dw.val(d) - 2 : 6)
      ))
    );
  },
  end(d) {
    return (
      d.wyEnd ||
      (d.wyEnd = later.date.prev(
        later.Y.val(d),
        later.M.val(d),
        later.D.val(d) + (later.dw.val(d) > 1 ? 8 - later.dw.val(d) : 0)
      ))
    );
  },
  next(d, value) {
    value = value > later.wy.extent(d)[1] ? 1 : value;
    const wyThur = later.dw.next(later.wy.start(d), 5);
    let year = later.date.nextRollover(wyThur, value, later.wy, later.Y);
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }

    const wyMax = later.wy.extent(year)[1];
    const wyStart = later.wy.start(year);
    value = value > wyMax ? 1 : value || wyMax;
    return later.date.next(
      later.Y.val(wyStart),
      later.M.val(wyStart),
      later.D.val(wyStart) + 7 * (value - 1)
    );
  },
  prev(d, value) {
    const wyThur = later.dw.next(later.wy.start(d), 5);
    let year = later.date.prevRollover(wyThur, value, later.wy, later.Y);
    if (later.wy.val(year) !== 1) {
      year = later.dw.next(year, 2);
    }

    const wyMax = later.wy.extent(year)[1];
    const wyEnd = later.wy.end(year);
    value = value > wyMax ? wyMax : value || wyMax;
    return later.wy.end(
      later.date.next(
        later.Y.val(wyEnd),
        later.M.val(wyEnd),
        later.D.val(wyEnd) + 7 * (value - 1)
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
    return later.Y.val(d) === value;
  },
  extent() {
    return [1970, 2099];
  },
  start(d) {
    return d.YStart || (d.YStart = later.date.next(later.Y.val(d)));
  },
  end(d) {
    return d.YEnd || (d.YEnd = later.date.prev(later.Y.val(d)));
  },
  next(d, value) {
    return value > later.Y.val(d) && value <= later.Y.extent()[1]
      ? later.date.next(value)
      : later.NEVER;
  },
  prev(d, value) {
    return value < later.Y.val(d) && value >= later.Y.extent()[0]
      ? later.date.prev(value)
      : later.NEVER;
  }
};
export const fullDate = {
  name: 'full date',
  range: 1,
  val(d) {
    return d.fd || (d.fd = d.getTime());
  },
  isValid(d, value) {
    return later.fd.val(d) === value;
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
    return later.fd.val(d) < value ? new Date(value) : later.NEVER;
  },
  prev(d, value) {
    return later.fd.val(d) > value ? new Date(value) : later.NEVER;
  }
};
