import test from 'tape';
import fs from 'fs';
import dazzlingGraphProgressive from '../src';
import config from './config.js';
require('./chunk-graph.js');
require('./graph-dao.js');
require('./node-selector.js');
require('./transitions-calculator.js');
require('./validate-configuration.js');
require('./validate-graph.js');

const validGraph = require('./fixtures/simple-graph.json');

const limit = 90;
const chunkOptions = {
  reducer: options => options.total + options.edge.data,
  stopper: options => options.total >= limit,
  start: 'p1',
  maxArraySize: 200,
  initial: 0
};

test('dazzlingGraphProgressive should chunk a file', t => {
  t.plan(3);
  const graphProg = dazzlingGraphProgressive(config.valid);
  t.ok(graphProg !== null, 'dazzlingGraphProgressive is configured');
  const actual = graphProg.chunk(validGraph, chunkOptions);
  const expected = JSON.parse(fs.readFileSync('test/expected/chunk-progressive.json', {encoding: 'utf8'}));
  // fs.writeFileSync('test/expected/chunk-progressive.json', JSON.stringify(actual, null, '  '));
  t.ok(actual !== null, 'actual should not be null');
  t.deepEqual(actual, expected, 'check progressive output');
});
