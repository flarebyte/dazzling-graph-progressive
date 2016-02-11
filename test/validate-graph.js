import validateGraph from '../src/validate-graph.js';
import test from 'tape';
import config from './config.js';
import Joi from 'joi';

const validationIncludesMsg = (value, validator, message) => Joi.validate(value, validator).error.message.includes(message);

test('Validate Graph should validate a renderer section', t => {
  const graph4Schema = {
    config: {
      validators: {
        natives: {
          path: {
            native: graphDao => graphDao.valid().object().min(2).required(),
            renderer: graphDao => graphDao.valid().number().required(),
            nodeSelect: graphDao => graphDao.valid().boolean().required()
          }
        }
      }
    },
    dao: {
      valid: () => Joi
    }
  };
  const validator = validateGraph.rendererSchema(graph4Schema);

  const validRendererGraphPart = {
    title: '8 by 8',
    description: 'Matrix 8 by 8',
    tags: [
      'dc:title',
      'other:tag22/a/b#main'
    ],
    native: 'path',
    data: 12
  };
  t.plan(3);
  t.equal(Joi.validate(validRendererGraphPart, validator).error, null, 'valid renderer');
  t.ok(validationIncludesMsg({native: 'bad'}, validator, 'must be one of [path]'), 'invalid native property');
  t.ok(validationIncludesMsg({native: 'path', data: 'not-number'}, validator, 'must be a number'), 'invalid data property');
});

test('should validate a node section', t => {
  const graph4Schema = {
    dao: {
      filterKeys: ['clr:black', 'clr:purple', 'clr:grey', 'prefix:*'],
      rendererKeys: ['path8x8', 'path12x12'],
      valid: () => Joi
    },
    renderers: {
      path8x8: {native: 'path'},
      path12x12: {native: 'path'}
    },
    config: {
      validators: {
        natives: {
          path: {
            native: graphDao => graphDao.valid().object().min(2).required(),
            renderer: graphDao => graphDao.valid().number().required(),
            nodeSelect: graphDao => graphDao.valid().boolean().required()
          }
        }
      }
    },
  };
  const validator = validateGraph.nodeSchema(graph4Schema);

  const validNodeGraphPart = {
    title: 'root',
    description: 'The root node',
    tags: [
      'dc:title',
      'other:tag22/a/b#main'
    ],
    select: [
      {
        f: {
          allOf: [
            'clr:black'
          ]
        },
        r: 'path8x8',
        data: true
      },
      {
        f: {
          oneOf: [
            'clr:grey'
          ]
        },
        r: 'path12x12',
        data: false
      },
      {
        f: {
          noneOf: [
            'prefix:*'
          ]
        },
        r: 'path12x12',
        data: false
      }
    ]
  };
  const filterBlack = {allOf: ['clr:black']};
  t.plan(3);
  t.equal(Joi.validate(validNodeGraphPart, validator).error, null, 'valid node');
  t.ok(validationIncludesMsg({select: [{f: filterBlack, data: true, r: 'unknown-render'}]}, validator, 'must be one of [path8x8, path12x12]'), 'invalid renderer for node');
  t.ok(validationIncludesMsg({select: [{f: filterBlack, data: 12, r: 'path12x12'}]}, validator, 'must be a boolean'), 'invalid data for node');
});

test('should validate an edge section', t => {
  const graph4Schema = {
    dao: {
      sourceKeys: ['clr:black', 'clr:purple', 'clr:grey'],
      uniqueKeys: ['rect1:1/1'],
      nodeKeys: ['p1', 'p2'],
      filterKeys: ['*'],
      iteratorKeys: ['texture->start'],
      valid: () => Joi
    },
    iterators: ['texture'],
    config: {
      validators: {
        edgeData: graphDao => graphDao.valid().number().required()
      }
    }
  };
  const validator = validateGraph.edgeSchema(graph4Schema);

  const validEdgeGraphPart = {
    title: 'root',
    description: 'The root edge',
    tags: [
      'dc:title',
      'other:tag22/a/b#main'
    ],
    s: 'p1',
    d: 'p2',
    t: [
      {
        x: '*'
      },
      {
        a: 'texture->start'
      },
      {
        d: 'clr:black'
      },
      {
        s: 'clr:grey',
        d: 'clr:black'
      },
      {
        i: 'texture',
        l: [
          'clr:black',
          'clr:purple'
        ]
      }
    ],
    u: [
      'rect1:1/1'
    ],
    data: 10

  };
  t.plan(9);
  t.equal(Joi.validate(validEdgeGraphPart, validator).error, null, 'valid edge');
  t.equal(Joi.validate({s: 'p1', d: 'p2', t: [], u: ['rect1:1/1'], data: 5}, validator).error, null, 'transition may be empty');
  t.ok(validationIncludesMsg({s: 'p1', d: 'p2', u: ['rect1:1/1'], data: 5}, validator, '"t" is required'), 'transition array is expcted');
  t.ok(validationIncludesMsg({s: 'p1', d: 'p2', t: [{x: '*'}], data: 10}, validator, '"u" is required'), 'missing unique id');
  t.ok(validationIncludesMsg({s: 'p1', d: 'p2', t: [{x: '*'}], u: ['rect1:1/1']}, validator, '"data" is required'), 'missing value data');
  t.ok(validationIncludesMsg({s: 'p1', d: 'p2', t: [{x: '*'}], u: ['rect1:1/1'], data: 'no-number'}, validator, 'must be a number'), 'value v must be a number');
  t.ok(validationIncludesMsg({d: 'p2', t: [{x: '*'}], u: ['rect1:1/1'], data: 5}, validator, '"s" is required'), 'source is required');
  t.ok(validationIncludesMsg({s: 'p1', d: 'p2', u: ['rect1:1/1'], data: 5}, validator, '"t" is required'), 'transition array is expcted');
  t.ok(validationIncludesMsg({s: 'p1', d: 'no-node', t: [], u: ['rect1:1/1'], data: 5}, validator, 'must be one of [p1, p2]'), 'destination must be a node');
});

test('should validate graph', t => {
  const validation = validateGraph.validate(config.valid, require('./fixtures/simple-graph.json'));
  t.plan(1);
  t.notEqual(typeof validation, 'Error');
});
