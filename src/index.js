import _ from 'lodash';
import Joi from 'joi';
import validateConf from './validate-configuration.js';
import validateGraph from './validate-graph.js';
import chunkGraph from './chunk-graph.js';
import graphDao from './graph-dao.js';

export default function (conf) {
  if (_.isUndefined(conf)) {
    return Joi;
  }

  validateConf.assertValid(conf);

  const validate = graph => validateGraph.validate(conf, graph);
  const chunk = (graph, options) => chunkGraph(conf, graphDao(graph), options);

  return {validate, chunk};
}
