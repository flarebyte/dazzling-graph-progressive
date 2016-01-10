import test from 'tape';
import dazzlingGraphProgressive from '../src';
require('./chunk-graph.js');
require('./graph-dao.js');
require('./node-selector.js');
require('./transitions-calculator.js');
require('./validate-configuration.js');
require('./validate-graph.js');

const validGraph = require('./fixture-graph.json');

  // it('should chunk a graph in small tasks which can be run in parallel!', function () {
  //   const graph = dazzlingGraphProgressive(validConfig);
  //   const chunkOptions = {reducer, stopper, start: 'p1', maxArraySize: 200, initial: 0};
  //   const chunks = graph.chunk(validGraph, chunkOptions);
  //   const simpler = chunks.map(ch => [ch.edge.s, ch.edge.d, ch.total, ch.transitions]);
  //   assert.deepEqual(simpler[0], ['p1', 'p2', 0, ['clr:black']]);
  //   assert.deepEqual(simpler[1], ['p2', 'p3', 10, []]);
  //   assert.deepEqual(simpler[2], ['p3', 'p4', 20, []]);
  //   assert.deepEqual(simpler[3], ['p4', 'p5', 30, ['appearance:rough']]);
  //   assert.deepEqual(simpler[10], ['p3', 'p4b', 60, ['clr:black']]);
  //   assert.deepEqual(simpler[15], ['p4b', 'p5', 30, ['clr2:greyish']]);
  // });
  //
  // it('should manage transitions!', function () {
  //   const graph = dazzlingGraphProgressive(validConfig);
  //   const chunkOptions = {reducer, stopper, start: 'p1', maxArraySize: 200, initial: 0};
  //   const chunks = graph.chunk(validGraph, chunkOptions);
  //   const simpler = chunks.map(ch => ch.transitions);
  //   //process.stdout.write(JSON.stringify(simpler) + '\n');
  //   const expected = [['clr:black'], [], ['clr:white'], ['clr:white', 'appearance:rough'], ['clr:black'],
  //    [], ['clr:white'], ['clr:white', 'appearance:grain'], ['clr:black'],
  //    [], ['clr:black'], ['clr2:greyish'], ['clr:black'],
  //    [], ['clr:black'], ['clr2:greyish'], ['clr:black'], [],
  //    ['clr:white'], ['clr:white', 'appearance:smooth'], ['clr:black'],
  //    [], ['clr:black'], ['clr2:greyish'], ['clr:black'],
  //    []];
  //   assert.deepEqual(simpler, expected);
  // });

test('basic test for index', t => {
  t.plan(2);
  const graph = dazzlingGraphProgressive({});
  t.ok(graph !== null, 'graph');
  t.ok(validGraph !== null, 'graph 2');
});
