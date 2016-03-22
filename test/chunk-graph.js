import chunkGraph from '../src/chunk-graph.js';
import test from 'tape';
import _ from 'lodash';

const defaultSelectRenderers = ( state, name ) => {
  return { r: 'renderer' };
};

const defaultFindNodeByName = ( name ) => {
  return { title: 'node' };
};

test( 'Chunk Graph should chunk graph until reaching stopper limit', t => {
  const limit = 30;
  const chunkOptions = {
    reducer: options => options.total + options.edge.data,
    stopper: options => options.total >= limit,
    start: 'a',
    maxArraySize: 200,
    initial: 0
  };

  const edges = {
    a: { s: 'a', d: 'b', t: 'A', data: 1, title: 'a' },
    b: { s: 'b', d: 'c', t: 'B', data: 3, title: 'b' },
    c: { s: 'c', d: 'a', t: 'C', data: 5, title: 'c' }
  };

  const simplifiedEdges = {
    a: { title: 'a', data: 1 },
    b: { title: 'b', data: 3 },
    c: { title: 'c', data: 5 }
  };

  const calculate = ( it, total, transitionRules ) => {
    switch ( transitionRules ) {
      case 'A': total.push( 'AA' ); break;
      case 'B': total.push( 'BB' ); break;
      case 'C': total = []; break;
      default: break;
    }
    return total;
  };

  const graphDao = {
    nodeKeys: [ 'a', 'b', 'c' ],
    iterators: () => [],
    searchEdgesBySource: src => [ edges[src] ],
    calculateTransitions: calculate,
    selectRenderers: defaultSelectRenderers,
    findNodeByName: defaultFindNodeByName
  };

  const chunks = chunkGraph( graphDao, chunkOptions );
  t.plan( 5 );
  t.equal( chunks.length, 10, 'length' );
  const onlyTotals = chunks.map( n => n.total );
  t.deepEqual( onlyTotals, [ 0, 3, 8, 9, 12, 17, 18, 21, 26, 27 ], 'only totals' );
  t.ok( _.last( onlyTotals ) < limit, 'below limit' );
  const onlyTransitions = chunks.map( n => n.transitions );
  const EMPTY = [];
  const AA = [ 'AA' ];
  const AABB = [ 'AA', 'BB' ];
  t.deepEqual( onlyTransitions, [ AA, AABB, EMPTY, AA, AABB, EMPTY, AA, AABB, EMPTY, AA ], 'only transitions' );
  const onlyEdges = chunks.map( n => n.edge );
  const E = simplifiedEdges;
  t.deepEqual( onlyEdges, [ E.a, E.b, E.c, E.a, E.b, E.c, E.a, E.b, E.c, E.a ], 'only edges' );
} );

test( 'should chunk graph until reaching maxArraySize', t => {
  const limit = 10;
  const chunkOptions = {
    reducer: options => options.total + options.edge.data,
    stopper: options => options.total >= 1000,
    start: 'a',
    maxArraySize: limit,
    initial: 0
  };

  const edges = {
    a: { s: 'a', d: 'b', t: 'A', data: 1 },
    b: { s: 'b', d: 'c', t: 'B', data: 3 },
    c: { s: 'c', d: 'a', t: 'C', data: 5 }
  };

  const calculate = ( total, transitionRules ) => {
    switch ( transitionRules ) {
      case 'A': total.push( 'AA' ); break;
      case 'B': total.push( 'BB' ); break;
      case 'C': total.push( 'CC' ); break;
      default: break;
    }
    return total;
  };

  const graphDao = {
    nodeKeys: [ 'a', 'b', 'c' ],
    iterators: () => [],
    searchEdgesBySource: src => [ edges[src] ],
    calculateTransitions: calculate,
    selectRenderers: defaultSelectRenderers,
    findNodeByName: defaultFindNodeByName
  };

  const chunks = chunkGraph( graphDao, chunkOptions );
  t.plan( 2 );
  t.equal( chunks.length, limit, 'length' );
  const onlyTotals = chunks.map( n => n.total );
  t.deepEqual( onlyTotals, [ 0, 3, 8, 9, 12, 17, 18, 21, 26, 27 ], 'only totals' );
} );

test( 'should chunk graph until exit naturally', t => {
  const chunkOptions = {
    reducer: options => options.total + options.edge.data,
    stopper: options => options.total >= 1000,
    start: 'a',
    maxArraySize: 1000,
    initial: 0
  };

  const edges = {
    a: { s: 'a', d: 'b', t: 'A', data: 1 },
    b: { s: 'b', d: 'c', t: 'B', data: 3 },
    c: { s: 'c', d: 'd', t: 'C', data: 5 },
    d: { s: 'd', d: 'e', t: 'A', data: 9 }
  };

  const calculate = ( total, transitionRules ) => {
    switch ( transitionRules ) {
      case 'A': total.push( 'AA' ); break;
      case 'B': total.push( 'BB' ); break;
      case 'C': total = []; break;
      default: break;
    }
    return total;
  };

  const graphDao = {
    nodeKeys: [ 'a', 'b', 'c', 'd', 'e' ],
    iterators: () => [],
    searchEdgesBySource: src => edges[src] ? [ edges[src] ] : [],
    calculateTransitions: calculate,
    selectRenderers: defaultSelectRenderers,
    findNodeByName: defaultFindNodeByName
  };

  const chunks = chunkGraph( graphDao, chunkOptions );
  t.plan( 2 );
  t.equal( chunks.length, 4, 'length' );
  const onlyTotals = chunks.map( n => n.total );
  t.deepEqual( onlyTotals, [ 0, 3, 8, 17 ], 'only totals' );
} );

test( 'should chunk graph with multiple children until exit naturally', t => {
  const chunkOptions = {
    reducer: options => options.total + options.edge.data,
    stopper: options => options.total >= 1000,
    start: 'a',
    maxArraySize: 1000,
    initial: 0
  };

  const edges = {
    a: { d: 'b', t: 'A', data: 1, title: 'b' },
    b: { d: 'c', t: 'B', data: 3, title: 'c' },
    b2: { d: 'e', t: 'B', data: 3, title: 'e' },
    c: { d: 'd', t: 'C', data: 5, title: 'd' },
    d: { d: 'h', t: 'A', data: 1, title: 'h' },
    e: { d: 'f', t: 'A', data: 1, title: 'f' },
    f: { d: 'g', t: 'A', data: 1, title: 'g' }
  };

  const calculate = ( total, transitionRules ) => {
    switch ( transitionRules ) {
      case 'A': total.push( 'AA' ); break;
      case 'B': total.push( 'BB' ); break;
      case 'C': total = []; break;
      default: break;
    }
    return total;
  };

  const searchEdgesBySource = src => {
    switch ( src ) {
      case 'a': return [ edges.a ];
      case 'b': return [ edges.b, edges.b2 ];
      case 'c': return [ edges.c ];
      case 'd': return [ edges.d ];
      case 'e': return [ edges.e ];
      case 'f': return [ edges.f ];
      default: return [];
    }
  };

  const graphDao = {
    nodeKeys: [ 'a', 'b', 'c', 'd', 'e' ],
    iterators: () => [],
    searchEdgesBySource,
    calculateTransitions: calculate,
    selectRenderers: defaultSelectRenderers,
    findNodeByName: defaultFindNodeByName
  };

  const chunks = chunkGraph( graphDao, chunkOptions );
  const onlyEdgesDest = chunks.map( n => n.edge.title );
  t.plan( 2 );
  const expected = [ 'b', 'c', 'd', 'e', 'f', 'g', 'h' ].sort();
  t.deepEqual( onlyEdgesDest.sort(), expected, 'only edges destination' );
  t.ok( _.size( chunks, 7 ), 'length' );
} );
