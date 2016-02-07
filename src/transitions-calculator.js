import _ from 'lodash';

const iterator = () => {
  let count = 0;
  let atStart = true;
  const next = () => {
    if (count > 1000000) {
      throw new Error('next out of range');
    }
    count++;
  };

  const previous = () => {
    if (count < -1000000) {
      throw new Error('previous out of range');
    }
    count--;
  };
  const start = () => {
    count = 0;
    atStart = true;
  };
  const end = () => {
    count = 0;
    atStart = false;
  };
  const state = () => _.clone({atStart, count});

  return {next, previous, start, end, state};
};

const calculate = (iterators, total, tnew) => {
  const calculateDeleteTransition = t => {
    if (t.x === '*') {
      total = [];
    } else if (_.endsWith(t.x, ':*')) {
      const prefix = `${t.x.split(':')[0]}:`;
      total = _.reject(total, v => _.startsWith(v, prefix));
    } else {
      _.remove(total, i => i === t.x);
    }
  };

  const replaceIfFound = (s, d, list) => {
    const equalSource = i => i === s;
    const found = _.some(list, equalSource);
    if (found) {
      _.remove(list, equalSource);
      list.push(d);
    }
  };

  const calculateReplaceTransition = t => {
    if (t.s) {
      /* Replaces s with d */
      replaceIfFound(t.s, t.d, total);
    } else {
      /* Inserts d */
      total.push(t.d);
    }
  };

  const calculateActionTransition = t => {
    /* Moves iterator */
    const it = t.a.split('->')[0];
    if (_.endsWith(t.a, '->start')) {
      iterators[it].start();
    } else if (_.endsWith(t.a, '->end')) {
      iterators[it].end();
    } else if (_.endsWith(t.a, '->next')) {
      iterators[it].next();
    } else if (_.endsWith(t.a, '->previous')) {
      iterators[it].previous();
    }
  };

  const calculateIteratorTransition = t => {
    /* Apply iterator*/
    total = _.difference(total, t.l);
    const itState = iterators[t.i].state();
    const length = t.l.length;
    const offset = itState.atStart ? 0 : length - 1;
    const realCount = itState.count + offset;
    if (realCount < 0) {
      const progress = -1 * realCount % length;
      const ii = progress === 0 ? 0 : length - progress;
      const tag = t.l[ii];
      total.push(tag);
    } else {
      const progress = realCount % length;
      const tag = t.l[progress];
      total.push(tag);
    }
  };

  const calculateOneTransition = t => {
    /* Deletes */
    if (t.x) {
      calculateDeleteTransition(t);
    } else if (t.d) {
      calculateReplaceTransition(t);
    } else if (t.a) {
      calculateActionTransition(t);
    } else if (t.i) {
      calculateIteratorTransition(t);
    }
  };

  if (!_.isEmpty(tnew)) {
    tnew.forEach(calculateOneTransition);
    total = _.uniq(total);
  }
  return total;
};

export default {iterator, calculate};
