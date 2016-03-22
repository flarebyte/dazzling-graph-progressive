import nodeSelector from '../src/node-selector.js';
import test from 'tape';
import _ from 'lodash';

const selectRenderer = ( state, node ) => {
  const list = nodeSelector.select( state, node );
  return _.map( list, n => n.r );
};

const selectTags = ( state, node ) => {
  const list = nodeSelector.select( state, node );
  return _.map( list, n => n.picked );
};

test( 'Node Selector should findWildChar', t => {
  t.plan( 3 );
  t.deepEqual( nodeSelector.findWildChar( 'A:*', [ 'A:1', 'B' ] ), [ 'A:1' ], 'A:*' );
  t.deepEqual( nodeSelector.findWildChar( 'A:*', [ 'A:1', 'B', 'A:2' ] ), [ 'A:1', 'A:2' ], 'A:* more complex' );
  t.deepEqual( nodeSelector.findWildChar( '*', [ 'A:1', 'B', 'A:2' ] ), [ 'A:1', 'A:2', 'B' ], '*' );
} );

test( 'should calculate oneOf', t => {
  t.plan( 3 );
  t.deepEqual( nodeSelector.oneOf( [ 'A' ], [ 'A', 'B' ] ), [ 'A' ], 'A' );
  t.deepEqual( nodeSelector.oneOf( [ 'A', 'B' ], [ 'A' ] ), [ 'A' ], 'AB' );
  t.deepEqual( nodeSelector.oneOf( [ 'A', 'B', 'C' ], [ 'A', 'G' ] ), [ 'A' ], 'ABC' );
} );

test( 'should calculate allOf', t => {
  t.plan( 3 );
  t.deepEqual( nodeSelector.allOf( [ 'A' ], [ 'A', 'B' ] ), [], 'A' );
  t.deepEqual( nodeSelector.allOf( [ 'A', 'B' ], [ 'A' ] ), [ 'A' ], 'AB' );
  t.deepEqual( nodeSelector.allOf( [ 'B', 'C', 'A' ], [ 'A', 'B' ] ), [ 'A', 'B' ], 'BCA' );
} );

test( 'should calculate oneOf widlchar', t => {
  t.plan( 2 );
  t.deepEqual( nodeSelector.oneOf( [ 'A:1' ], [ 'A:*', 'B' ] ), [ 'A:1' ], 'A:1' );
  t.deepEqual( nodeSelector.oneOf( [ 'A:1', 'B', 'A:2', 'D' ], [ 'A:*', 'B' ] ), [ 'A:1', 'A:2', 'B' ], 'A to D' );
} );

test( 'should select allOf', t => {
  const node = {
    select: [
      { f: { allOf: [ 'clr:black' ] }, r: 'black' },
      { f: { allOf: [ 'clr:white' ] }, r: 'white' },
      { f: { allOf: [ 'clr:red' ] }, r: 'red' }
    ]
  };
  t.plan( 4 );
  t.deepEqual( selectRenderer( [ 'clr:black', 'not:me' ], node ), [ 'black' ], 'black' );
  t.deepEqual( selectTags( [ 'clr:black', 'not:me' ], node ), [ [ 'clr:black' ] ], 'clr:black' );
  t.deepEqual( selectRenderer( [ 'clr:red', 'not:me' ], node ), [ 'red' ], 'red' );
  t.deepEqual( selectRenderer( [ 'here:not' ], node ), [], 'empty' );
} );

test( 'should select allOf wildchar', t => {
  const node = {
    select: [
      { f: { allOf: [ 'clr:black' ] }, r: 'black' },
      { f: { allOf: [ 'clr:*' ] }, r: 'white' },
      { f: { allOf: [ 'clr:red' ] }, r: 'red' }
    ]
  };
  t.plan( 4 );
  t.deepEqual( selectRenderer( [ 'clr:black', 'not:me' ], node ), [ 'black', 'white' ], 'black white' );
  t.deepEqual( selectTags( [ 'clr:black', 'clr:yellow' ], node ), [ [ 'clr:black' ], [ 'clr:black', 'clr:yellow' ] ], 'tags' );
  t.deepEqual( selectRenderer( [ 'clr:red' ], node ), [ 'white', 'red' ], 'white red' );
  t.deepEqual( selectRenderer( [ 'here:not' ], node ), [], 'empty' );
} );

test( 'should select oneOf', t => {
  const node = {
    select: [
      { f: { oneOf: [ 'clr:black' ] }, r: 'black' },
      { f: { oneOf: [ 'clr:white', 'clr:black' ] }, r: 'white' },
      { f: { oneOf: [ 'clr:red' ] }, r: 'red' }
    ]
  };
  t.plan( 2 );
  t.deepEqual( selectRenderer( [ 'clr:black', 'not:me' ], node ), [ 'black', 'white' ], 'black white' );
  t.deepEqual( selectTags( [ 'clr:black', 'clr:yellow', 'not:me' ], node ), [ [ 'clr:black' ], [ 'clr:black' ] ], 'black' );
} );

test( 'should select oneOf wildchar', t => {
  const node = {
    select: [
      { f: { oneOf: [ 'clr:black' ] }, r: 'black' },
      { f: { oneOf: [ 'clr:*' ] }, r: 'white' },
      { f: { oneOf: [ 'clr:red' ] }, r: 'red' },
      { f: { oneOf: [ '*' ] }, r: 'green' }
    ]
  };
  t.plan( 4 );
  t.deepEqual( selectRenderer( [ 'clr:black', 'not:me' ], node ), [ 'black', 'white', 'green' ], 'black white green' );
  t.deepEqual( selectTags( [ 'clr:black', 'clr:yellow', 'even:me' ], node ), [ [ 'clr:black' ], [ 'clr:black', 'clr:yellow' ], [ 'clr:black', 'clr:yellow', 'even:me' ] ], 'tags' );
  t.deepEqual( selectRenderer( [ 'clr:green', 'even:me' ], node ), [ 'white', 'green' ], 'white green' );
  t.deepEqual( selectTags( [ 'clr:green', 'even:me' ], node ), [ [ 'clr:green' ], [ 'clr:green', 'even:me' ] ], 'complex tags' );
} );

test( 'should select oneOf and noneOf', t => {
  const node = {
    select: [
      { f: { oneOf: [ 'clr:black' ] }, r: 'black' },
      { f: { oneOf: [ 'clr:white', 'clr:black' ], noneOf: [ 'clr:red' ] }, r: 'white' },
      { f: { oneOf: [ 'clr:red' ] }, r: 'red' }
    ]
  };
  t.plan( 3 );
  t.deepEqual( selectRenderer( [ 'clr:black', 'not:me' ], node ), [ 'black', 'white' ], 'black white' );
  t.deepEqual( selectRenderer( [ 'clr:red', 'clr:black', 'not:me' ], node ), [ 'black', 'red' ], 'black red' );
  t.deepEqual( selectTags( [ 'clr:red', 'clr:black', 'not:me' ], node ), [ [ 'clr:black' ], [ 'clr:red' ] ], 'clr black red' );
} );

test( 'should select allOf and noneOf', t => {
  const node = {
    select: [
      { f: { allOf: [ 'clr:black' ], noneOf: [ 'clr:red' ] }, r: 'black' },
      { f: { allOf: [ 'clr:white' ] }, r: 'white' },
      { f: { allOf: [ 'clr:red' ] }, r: 'red' }
    ]
  };
  t.plan( 2 );
  t.deepEqual( selectRenderer( [ 'clr:black', 'not:me' ], node ), [ 'black' ], 'black' );
  t.deepEqual( selectRenderer( [ 'clr:black', 'clr:red', 'not:me' ], node ), [ 'red' ], 'red' );
} );
