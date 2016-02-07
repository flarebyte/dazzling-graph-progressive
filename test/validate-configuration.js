import validateConf from '../src/validate-configuration.js';
import Joi from 'joi';
import test from 'tape';

const valid = Joi;
const validConfig = {
  validators: {
    natives: {
      metadata: {
        n: valid.object().min(1).required(),
        r: valid.string().max(4).required(),
        ns: valid.string().max(5).required()
      },
      path: {
        n: valid.object().min(2).required(),
        r: valid.number().required(),
        ns: valid.boolean().required()
      }
    },
    uniqueData: valid.object().min(1).required(),
    transitionData: valid.number().required(),
    edgeValues: valid.number().required()
  },
  regexes: {
    renderers: '[A-Za-z0-9]{2,10}',
    transitions: '[A-Za-z0-9]{2,10}',
    transitionsItem: '[A-Za-z0-9]{2,10}',
    iterators: '[A-Za-z0-9]{2,10}',
    aliases: '[A-Za-z0-9]{2,10}',
    aliasesItem: '[A-Za-z0-9]{2,10}',
    uniques: '[A-Za-z0-9]{2,10}',
    nodes: '[A-Za-z0-9]{2,10}'
  }
};

test('Validate Configuration should assert configuration', t => {
  t.plan(1);
  validateConf.assertValid(validConfig);
  t.pass('valid');
});
