# dazzling-graph-progressive [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Graph manipulation with filtering for progressive rendering of 2D layers

## Installation

```sh
$ npm install --save dazzling-graph-progressive
```

## Introduction

dazzling-graph-progressive is a framework for building json file formats that rely on a basic graph state machine.

The state is managed through transitions which are simple text tags.

Each edge of the graph manipulates these transitions to reflect the desired state for the destination node. Loops are possible, but inbound flows are treated separately (not merged).

The validation of the graph check the validity of the fields used, but also verify the coherence of the user data.

This framework is intended to be used for the development of a rendering library by the author, and even if it can easily be customized, it may appear very opinionated for most users.

## Usage

```js
var dazzlingGraphProgressive = require('dazzling-graph-progressive');

// This configuration is needed to validate your DSL
const config = {
  validators: {
    natives: {
      metadata: {
        native: graphDao => graphDao.valid().object().min(1).required(),
        renderer: graphDao => graphDao.valid().string().max(4).required(),
        nodeSelect: graphDao => graphDao.valid().string().max(5).required()
      },
      path: {
        native: graphDao => graphDao.valid().object().min(2).required(),
        renderer: graphDao => graphDao.valid().number().required(),
        nodeSelect: graphDao => graphDao.valid().boolean().required()
      }
    },
    uniqueData: graphDao => graphDao.valid().object().min(1).required(),
    transitionData: graphDao => graphDao.valid().number().required(),
    edgeData: graphDao => graphDao.valid().number().required()
  },
  regexes: {
    renderers: graphDao => '[A-Za-z0-9]{2,10}',
    transitions: graphDao => '[A-Za-z0-9]{2,10}',
    transitionsItem: graphDao => '[A-Za-z0-9]{2,10}',
    iterators: graphDao => '[A-Za-z0-9]{2,10}',
    aliases: graphDao => '[A-Za-z0-9]{2,10}',
    aliasesItem: graphDao => '[A-Za-z0-9]{2,10}',
    uniques: graphDao => '[A-Za-z0-9]{2,10}',
    nodes: graphDao => '[A-Za-z0-9]{2,10}'
  }
};

// An example of options passed for iterating the graph starting at p1
const chunkOptions = {
  reducer: options => options.total + options.edge.data,
  stopper: options => options.total >= limit,
  start: 'p1',
  maxArraySize: 200,
  initial: 0
};

const validGraph = {}; //see test/fixtures/simple-graph.json

const graphProg = dazzlingGraphProgressive(config);

// Validate that the given json data is correct
const validation = graphProg.validate(validGraph, chunkOptions);

// Iterate the graph and calculate all the transitions
const actual = graphProg.chunk(validGraph, chunkOptions);


```

# Development Workflow

* Add code to `src/index.js` and tests to `test/index.js`.
* Lint, build and test a project with `npm run build`.
* Build and watch changes in `src/` with `npm run watch`
* Run only tests with `npm run test`.
* Check coverage with `npm run coverage`.
* Generate a TOC for the `CHANGELOG` with `npm run toc`
* Deploy to a remote origin with `npm run deploy`.
* Bump version and publish a package with `npm run major` or `minor/patch`

## License

 © [Olivier Huin](https://github.com/olih)


[npm-image]: https://badge.fury.io/js/dazzling-graph-progressive.svg
[npm-url]: https://npmjs.org/package/dazzling-graph-progressive
[travis-image]: https://travis-ci.org/flarebyte/dazzling-graph-progressive.svg?branch=master
[travis-url]: https://travis-ci.org/flarebyte/dazzling-graph-progressive
[daviddm-image]: https://david-dm.org/flarebyte/dazzling-graph-progressive.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/flarebyte/dazzling-graph-progressive
[coveralls-image]: https://coveralls.io/repos/flarebyte/dazzling-graph-progressive/badge.svg
[coveralls-url]: https://coveralls.io/r/flarebyte/dazzling-graph-progressive
