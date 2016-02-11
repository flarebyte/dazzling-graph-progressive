import _ from 'lodash';
import Joi from 'joi';

const chunkOptionsSchema = graphDao => Joi.object().keys({
  start: Joi.string().valid(graphDao.nodeKeys).required(),
  skipTo: Joi.string().valid(graphDao.nodeKeys).description("skip to a specific node while state is based on start").optional(),
  maxArraySize: Joi.number().min(10).description('maximum array size before exiting').required(),
  initial: Joi.any().description('initial data for transition').required(),
  reducer: Joi.func().description('function used to reduce the edge values').required(),
  stopper: Joi.func().description('function used to stop iterating the edges').required()
});

const simplifyEdge = edge => _.omit(edge, ['t', 's', 'd', 'u'])
const simplifyRenderers = rdrs => _.map(rdrs, rdr => _.omit(rdr, 'f'))
const simplifyNode = (node, id) => _.set(_.omit(node, 'select'), 'id', id);

export default function (graphDao, options) {
  Joi.assert(options, chunkOptionsSchema(graphDao));
  const accumulator = [];
  const iterators = graphDao.iterators();
  const hasReachedMaxSize = () => _.size(accumulator) >= options.maxArraySize;

  const explore = (total, state, edge) => {
    const shouldStop = options.stopper({total});
    if (hasReachedMaxSize() || shouldStop) {
      return;
    }
    const transitions = graphDao.calculateTransitions(iterators, state, edge.t);
    const renderers = graphDao.selectRenderers(transitions, edge.d);
    const source = simplifyNode(graphDao.findNodeByName(edge.s), edge.s);
    const destination = simplifyNode(graphDao.findNodeByName(edge.d), edge.d);

    accumulator.push({
      uniqueIds: edge.u,
      total,
      transitions,
      edge: simplifyEdge(edge),
      renderers: simplifyRenderers(renderers),
      source,
      destination
    });

    const children = graphDao.searchEdgesBySource(edge.d);
    if (_.isEmpty(children)) {
      return;
    }
    const exploreChild = child => {
      explore(options.reducer({total, edge: child}), _.clone(transitions), child);
    };
    _.forEach(children, exploreChild);
  };

  explore(options.initial, [], _.first(graphDao.searchEdgesBySource(options.start)));
  return accumulator;
}
