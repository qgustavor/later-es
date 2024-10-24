
export function setTimeout (fn, sched, timezone) {
  const s = later.schedule(sched);
  let t;
  if (fn) {
    scheduleTimeout();
  }

  function scheduleTimeout() {
    const date = new Date();
    const now = date.getTime();

    const next = (() => {
      if (!timezone || ['local', 'system'].includes(timezone)) {
        return s.next(2, now);
      }

      const localOffsetMillis = date.getTimezoneOffset() * 6e4;
      const offsetMillis = getOffset(date, timezone);

      // Specified timezone has the same offset as local timezone.
      // ie. America/New_York = America/Nassau = GMT-4
      if (offsetMillis === localOffsetMillis) {
        return s.next(2, now);
      }

      // Offsets differ, adjust current time to match what
      // it should've been for the specified timezone.
      const adjustedNow = new Date(now + localOffsetMillis - offsetMillis);

      return (s.next(2, adjustedNow) || /* istanbul ignore next */ []).map(
        (sched) => {
          // adjust scheduled times to match their intended timezone
          // ie. scheduled = 2021-08-22T11:30:00.000-04:00 => America/New_York
          //     intended  = 2021-08-22T11:30:00.000-05:00 => America/Mexico_City
          return new Date(sched.getTime() + offsetMillis - localOffsetMillis);
        }
      );
    })();

    if (!next[0]) {
      t = undefined;
      return;
    }

    let diff = next[0].getTime() - now;
    if (diff < 1e3) {
      diff = next[1] ? next[1].getTime() - now : 1e3;
    }

    t =
      diff < 2147483647
        ? setTimeout(fn, diff)
        : setTimeout(scheduleTimeout, 2147483647);
  }

  return {
    isDone() {
      return !t;
    },
    clear() {
      clearTimeout(t);
    }
  };
}; 

export function setInterval (fn, sched, timezone) {
  if (!fn) {
    return;
  }

  let t = later.setTimeout(scheduleTimeout, sched, timezone);
  let done = t.isDone();
  function scheduleTimeout() {
    if (!done) {
      fn();
      t = later.setTimeout(scheduleTimeout, sched, timezone);
    }
  }

  return {
    isDone() {
      return t.isDone();
    },
    clear() {
      done = true;
      t.clear();
    }
  };
};

function getOffset(date, zone) {
  const d = date
    .toLocaleString('en-US', {
      hour12: false,
      timeZone: zone,
      timeZoneName: 'short'
    }) //=> ie. "8/22/2021, 24:30:00 EDT"
    .match(/(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/)
    .map((n) => (n.length === 1 ? '0' + n : n));

  const zdate = new Date(
    `${d[3]}-${d[1]}-${d[2]}T${d[4].replace('24', '00')}:${d[5]}:${d[6]}Z`
  );

  return date.getTime() - zdate.getTime();
}
