import transitionsCalc from '../src/transitions-calculator.js';
import test from 'tape';

test( 'Transitions Calculators should have a working iterator', t => {
  t.plan( 12 );
  const it = transitionsCalc.iterator();
  it.next();
  t.equal( it.state().count, 1, 'A' );
  it.next();
  t.equal( it.state().count, 2, 'B' );
  it.next();
  t.equal( it.state().count, 3, 'C' );
  it.previous();
  t.equal( it.state().count, 2, 'D' );
  it.previous();
  t.equal( it.state().count, 1, 'E' );
  it.previous();
  t.equal( it.state().count, 0, 'F' );
  it.previous();
  t.equal( it.state().count, -1, 'G' );
  it.previous();
  t.equal( it.state().count, -2, 'H' );
  it.start();
  t.equal( it.state().count, 0, 'I' );
  t.ok( it.state().atStart, 'I-state' );
  it.next();
  it.end();
  t.equal( it.state().count, 0, 'J' );
  t.notOk( it.state().atStart, 'I-state' );
} );

test( 'should make simple additions', t => {
  const transitions = transitionsCalc.calculate( null, [ 'INIT' ], [ { d: 'A' }, { d: 'B' } ] );
  const expected = [ 'INIT', 'A', 'B' ];
  t.plan( 1 );
  t.deepEqual( transitions, expected );
} );

test( 'should make replacements', t => {
  const transitions = transitionsCalc.calculate( null, [ 'INIT', 'A', 'B' ], [ { s: 'B', d: 'C' }, { d: 'D' } ] );
  const expected = [ 'INIT', 'A', 'C', 'D' ];
  t.plan( 1 );
  t.deepEqual( transitions, expected );
} );

test( 'should only make replacements when source exists', t => {
  const transitions = transitionsCalc.calculate( null, [ 'INIT', 'A', 'B' ], [ { s: 'B', d: 'C' }, { d: 'D' } ] );
  const expected = [ 'INIT', 'A', 'C', 'D' ];
  t.plan( 1 );
  t.deepEqual( transitions, expected );
} );

test( 'should delete all', t => {
  const transitions = transitionsCalc.calculate( null, [ 'INIT', 'A', 'B' ], [ { s: 'B', d: 'C' }, { d: 'D' }, { x: '*' } ] );
  const expected = [];
  t.plan( 1 );
  t.deepEqual( transitions, expected );
} );

test( 'should delete selectively', t => {
  const transitions = transitionsCalc.calculate( null, [ 'INIT', 'X:A', 'X:B', 'Y:A' ], [ { s: 'B', d: 'C' }, { d: 'D' }, { x: 'X:*' } ] );
  const expected = [ 'INIT', 'Y:A', 'D' ];
  t.plan( 1 );
  t.deepEqual( transitions, expected );
} );

test( 'should iterate forward', t => {
  const iterators = {
    ii: transitionsCalc.iterator()
  };
  const rules = [ { a: 'ii->next' }, { i: 'ii', l: [ 'A', 'B', 'C' ] } ];
  const calc = state => transitionsCalc.calculate( iterators, state, rules );
  t.plan( 4 );
  t.deepEqual( calc( [ 'INIT' ] ), [ 'INIT', 'B' ], 'to B' );
  t.deepEqual( calc( [ 'INIT', 'B' ] ), [ 'INIT', 'C' ], 'B to C' );
  t.deepEqual( calc( [ 'INIT', 'C' ] ), [ 'INIT', 'A' ], 'C to A' );
  t.deepEqual( calc( [ 'INIT', 'A' ] ), [ 'INIT', 'B' ], 'A to B' );
} );

test( 'should iterate backward', t => {
  const iterators = {
    ii: transitionsCalc.iterator()
  };
  iterators.ii.next();
  iterators.ii.next();
  const rules = [ { a: 'ii->previous' }, { i: 'ii', l: [ 'A', 'B', 'C' ] } ];
  const calc = state => transitionsCalc.calculate( iterators, state, rules );

  t.plan( 6 );
  t.deepEqual( calc( [ 'INIT' ] ), [ 'INIT', 'B' ], 'to B' );
  t.deepEqual( calc( [ 'INIT', 'B' ] ), [ 'INIT', 'A' ], 'B to A' );
  t.deepEqual( calc( [ 'INIT', 'A' ] ), [ 'INIT', 'C' ], 'A to C' );
  t.deepEqual( calc( [ 'INIT', 'C' ] ), [ 'INIT', 'B' ], 'C to B neg' );
  t.deepEqual( calc( [ 'INIT', 'B' ] ), [ 'INIT', 'A' ], 'B to A neg' );
  t.deepEqual( calc( [ 'INIT', 'A' ] ), [ 'INIT', 'C' ], 'A to C neg' );
} );

test( 'should iterate forward from end', t => {
  const iterators = {
    ii: transitionsCalc.iterator()
  };

  iterators.ii.end();

  const rules = [ { i: 'ii', l: [ 'A', 'B', 'C' ] } ];
  const calc = state => transitionsCalc.calculate( iterators, state, rules );
  t.plan( 2 );
  t.deepEqual( calc( [ 'INIT' ] ), [ 'INIT', 'C' ], 'to C' );
  iterators.ii.next();
  t.deepEqual( calc( [ 'INIT', 'C' ] ), [ 'INIT', 'A' ], 'C to A' );
} );

test( 'should iterate backward from end', t => {
  const iterators = {
    ii: transitionsCalc.iterator()
  };

  iterators.ii.end();

  const rules = [ { i: 'ii', l: [ 'A', 'B', 'C' ] } ];
  const calc = state => transitionsCalc.calculate( iterators, state, rules );
  t.plan( 7 );
  t.deepEqual( calc( [ 'INIT' ] ), [ 'INIT', 'C' ], 'to C' );
  iterators.ii.previous();
  t.deepEqual( calc( [ 'INIT', 'C' ] ), [ 'INIT', 'B' ], 'C to B' );
  iterators.ii.previous();
  t.deepEqual( calc( [ 'INIT', 'B' ] ), [ 'INIT', 'A' ], 'B to A' );
  iterators.ii.previous();
  t.deepEqual( calc( [ 'INIT', 'A' ] ), [ 'INIT', 'C' ], 'A to C' );
  iterators.ii.previous();
  t.deepEqual( calc( [ 'INIT', 'C' ] ), [ 'INIT', 'B' ], 'C to B neg' );
  iterators.ii.previous();
  t.deepEqual( calc( [ 'INIT', 'B' ] ), [ 'INIT', 'A' ], 'B to A neg' );
  iterators.ii.previous();
  t.deepEqual( calc( [ 'INIT', 'A' ] ), [ 'INIT', 'C' ], 'A to C neg' );
} );
