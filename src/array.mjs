export function sort (array, zeroIsLast) {
  array.sort(function (a, b) {
    return Number(a) - Number(b);
  });
  if (zeroIsLast && array[0] === 0) {
    array.push(array.shift());
  }
};

export function next (value, values, extent) {
  let cur;
  const zeroIsLargest = extent[0] !== 0;
  let nextIdx = 0;
  for (let i = values.length - 1; i > -1; --i) {
    cur = values[i];
    if (cur === value) {
      return cur;
    }

    if (cur > value || (cur === 0 && zeroIsLargest && extent[1] > value)) {
      nextIdx = i;
      continue;
    }

    break;
  }

  return values[nextIdx];
};

export function nextInvalid (value, values, extent) {
  const min = extent[0];
  const max = extent[1];
  const { length } = values;
  const zeroValue = values[length - 1] === 0 && min !== 0 ? max : 0;
  let next = value;
  let i = values.indexOf(value);
  const start = next;
  while (next === (values[i] || zeroValue)) {
    next++;
    if (next > max) {
      next = min;
    }

    i++;
    if (i === length) {
      i = 0;
    }

    if (next === start) {
      return undefined;
    }
  }

  return next;
};

export function prev (value, values, extent) {
  let cur;
  const { length } = values;
  const zeroIsLargest = extent[0] !== 0;
  let previousIdx = length - 1;
  for (let i = 0; i < length; i++) {
    cur = values[i];
    if (cur === value) {
      return cur;
    }

    if (cur < value || (cur === 0 && zeroIsLargest && extent[1] < value)) {
      previousIdx = i;
      continue;
    }

    break;
  }

  return values[previousIdx];
};

export function prevInvalid (value, values, extent) {
  const min = extent[0];
  const max = extent[1];
  const { length } = values;
  const zeroValue = values[length - 1] === 0 && min !== 0 ? max : 0;
  let next = value;
  let i = values.indexOf(value);
  const start = next;
  while (next === (values[i] || zeroValue)) {
    next--;
    if (next < min) {
      next = max;
    }

    i--;
    if (i === -1) {
      i = length - 1;
    }

    if (next === start) {
      return undefined;
    }
  }

  return next;
};
