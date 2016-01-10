import chunkGraph from '../src/chunk-graph.js';
import test from 'tape';
import _ from 'lodash';

test('Chunk Graph should chunk graph until reaching stopper limit', t => {
  const limit = 30;
  const chunkOptions = {
    reducer: options => options.total + options.edge.v,
    stopper: options => options.total >= limit,
    start: 'a',
    maxArraySize: 200,
    initial: 0
  };

  const edges = {
    a: {s: 'a', d: 'b', t: 'A', v: 1},
    b: {s: 'b', d: 'c', t: 'B', v: 3},
    c: {s: 'c', d: 'a', t: 'C', v: 5}
  };

  const calculate = (total, transitionRules) => {
    switch (transitionRules) {
      case 'A': total.push('AA'); break;
      case 'B': total.push('BB'); break;
      case 'C': total = []; break;
      default: break;
    }
    return total;
  };

  const graphDao = {
    nodeKeys: ['a', 'b', 'c'],
    iterators: [],
    searchEdgesBySource: src => [edges[src]]
  };

  const chunks = chunkGraph({calculate}, graphDao, chunkOptions);
  t.plan(4);
  t.equal(chunks.length, 10, 'length');
  const onlyTotals = chunks.map(n => n.total);
  t.deepEqual(onlyTotals, [0, 3, 8, 9, 12, 17, 18, 21, 26, 27], 'only totals');
  // assert.isBelow(_.last(onlyTotals), limit);
  const onlyTransitions = chunks.map(n => n.transitions);
  const EMPTY = [];
  const AA = ['AA'];
  const AABB = ['AA', 'BB'];
  t.deepEqual(onlyTransitions, [AA, AABB, EMPTY, AA, AABB, EMPTY, AA, AABB, EMPTY, AA], 'only transitions');
  const onlyEdges = chunks.map(n => n.edge);
  const E = edges;
  t.deepEqual(onlyEdges, [E.a, E.b, E.c, E.a, E.b, E.c, E.a, E.b, E.c, E.a], 'only edges');
});

test('should chunk graph until reaching maxArraySize', t => {
  const limit = 10;
  const chunkOptions = {
    reducer: options => options.total + options.edge.v,
    stopper: options => options.total >= 1000,
    start: 'a',
    maxArraySize: limit,
    initial: 0
  };

  const edges = {
    a: {s: 'a', d: 'b', t: 'A', v: 1},
    b: {s: 'b', d: 'c', t: 'B', v: 3},
    c: {s: 'c', d: 'a', t: 'C', v: 5}
  };

  const calculate = (total, transitionRules) => {
    switch (transitionRules) {
      case 'A': total.push('AA'); break;
      case 'B': total.push('BB'); break;
      case 'C': total.push('CC'); break;
      default: break;
    }
    return total;
  };

  const graphDao = {
    nodeKeys: ['a', 'b', 'c'],
    iterators: [],
    searchEdgesBySource: src => [edges[src]]
  };

  const chunks = chunkGraph({calculate}, graphDao, chunkOptions);
  t.plan(2);
  t.equal(chunks.length, limit, 'length');
  const onlyTotals = chunks.map(n => n.total);
  t.deepEqual(onlyTotals, [0, 3, 8, 9, 12, 17, 18, 21, 26, 27], 'only totals');
});

test('should chunk graph until exit naturally', t => {
  const chunkOptions = {
    reducer: options => options.total + options.edge.v,
    stopper: options => options.total >= 1000,
    start: 'a',
    maxArraySize: 1000,
    initial: 0
  };

  const edges = {
    a: {s: 'a', d: 'b', t: 'A', v: 1},
    b: {s: 'b', d: 'c', t: 'B', v: 3},
    c: {s: 'c', d: 'd', t: 'C', v: 5},
    d: {s: 'd', d: 'e', t: 'A', v: 9}
  };

  const calculate = (total, transitionRules) => {
    switch (transitionRules) {
      case 'A': total.push('AA'); break;
      case 'B': total.push('BB'); break;
      case 'C': total = []; break;
      default: break;
    }
    return total;
  };

  const graphDao = {
    nodeKeys: ['a', 'b', 'c', 'd', 'e'],
    iterators: [],
    searchEdgesBySource: src => edges[src] ? [edges[src]] : []
  };

  const chunks = chunkGraph({calculate}, graphDao, chunkOptions);
  t.plan(2);
  t.equal(chunks.length, 4, 'length');
  const onlyTotals = chunks.map(n => n.total);
  t.deepEqual(onlyTotals, [0, 3, 8, 17], 'only totals');
});

test('should chunk graph with multiple children until exit naturally', t => {
  const chunkOptions = {
    reducer: options => options.total + options.edge.v,
    stopper: options => options.total >= 1000,
    start: 'a',
    maxArraySize: 1000,
    initial: 0
  };

  const edges = {
    a: {d: 'b', t: 'A', v: 1},
    b: {d: 'c', t: 'B', v: 3},
    b2: {d: 'e', t: 'B', v: 3},
    c: {d: 'd', t: 'C', v: 5},
    d: {d: 'h', t: 'A', v: 1},
    e: {d: 'f', t: 'A', v: 1},
    f: {d: 'g', t: 'A', v: 1}
  };

  const calculate = (total, transitionRules) => {
    switch (transitionRules) {
      case 'A': total.push('AA'); break;
      case 'B': total.push('BB'); break;
      case 'C': total = []; break;
      default: break;
    }
    return total;
  };

  const searchEdgesBySource = src => {
    switch (src) {
      case 'a': return [edges.a];
      case 'b': return [edges.b, edges.b2];
      case 'c': return [edges.c];
      case 'd': return [edges.d];
      case 'e': return [edges.e];
      case 'f': return [edges.f];
      default: return [];
    }
  };

  const graphDao = {
    nodeKeys: ['a', 'b', 'c', 'd', 'e'],
    iterators: [],
    searchEdgesBySource
  };

  const chunks = chunkGraph({calculate}, graphDao, chunkOptions);
  const onlyEdges = chunks.map(n => n.edge);
  const E = edges;
  t.plan(8);
  t.ok(_.includes(onlyEdges, E.a), 'a');
  t.ok(_.includes(onlyEdges, E.b), 'b');
  t.ok(_.includes(onlyEdges, E.b2), 'b2');
  t.ok(_.includes(onlyEdges, E.c), 'c');
  t.ok(_.includes(onlyEdges, E.d), 'd');
  t.ok(_.includes(onlyEdges, E.e), 'e');
  t.ok(_.includes(onlyEdges, E.f), 'f');
  t.ok(_.size(chunks, 7), 'length');
});
