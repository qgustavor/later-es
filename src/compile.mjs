import * as modifiers from './modifiers.mjs'
import * as array from './array.mjs'
import { NEVER, SEC } from './constants.mjs'

export function compile (schedDef) {
  const constraints = [];
  let constraintsLength = 0;
  let tickConstraint;
  for (const key in schedDef) {
    const nameParts = key.split('_');
    const name = nameParts[0];
    const mod = nameParts[1];
    const vals = schedDef[key];
    const constraint = mod
      ? modifiers[mod](later[name], vals)
      : later[name];
    constraints.push({
      constraint,
      vals
    });
    constraintsLength++;
  }

  constraints.sort(function (a, b) {
    const ra = a.constraint.range;
    const rb = b.constraint.range;
    return rb < ra ? -1 : rb > ra ? 1 : 0;
  });
  tickConstraint = constraints[constraintsLength - 1].constraint;
  function compareFn(dir) {
    return dir === 'next'
      ? function (a, b) {
          if (!a || !b) return true;
          return a.getTime() > b.getTime();
        }
      : function (a, b) {
          if (!a || !b) return true;
          return b.getTime() > a.getTime();
        };
  }

  return {
    start(dir, startDate) {
      let next = startDate;
      const nextValue = array[dir];
      let maxAttempts = 1e3;
      let done;
      while (maxAttempts-- && !done && next) {
        done = true;
        for (let i = 0; i < constraintsLength; i++) {
          const { constraint } = constraints[i];
          const curValue = constraint.val(next);
          const extent = constraint.extent(next);
          const newValue = nextValue(curValue, constraints[i].vals, extent);
          if (!constraint.isValid(next, newValue)) {
            next = constraint[dir](next, newValue);
            done = false;
            break;
          }
        }
      }

      if (next !== NEVER) {
        next =
          dir === 'next'
            ? tickConstraint.start(next)
            : tickConstraint.end(next);
      }

      return next;
    },
    end(dir, startDate) {
      let result;
      const nextValue = array[dir + 'Invalid'];
      const compare = compareFn(dir);
      for (let i = constraintsLength - 1; i >= 0; i--) {
        const { constraint } = constraints[i];
        const curValue = constraint.val(startDate);
        const extent = constraint.extent(startDate);
        const newValue = nextValue(curValue, constraints[i].vals, extent);
        var next;
        if (newValue !== undefined) {
          next = constraint[dir](startDate, newValue);
          if (next && (!result || compare(result, next))) {
            result = next;
          }
        }
      }

      return result;
    },
    tick(dir, date) {
      return new Date(
        dir === 'next'
          ? tickConstraint.end(date).getTime() + SEC
          : tickConstraint.start(date).getTime() - SEC
      );
    },
    tickStart(date) {
      return tickConstraint.start(date);
    }
  };
};
