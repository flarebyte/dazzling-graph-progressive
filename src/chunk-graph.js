import _ from 'lodash';
import Joi from 'joi';

const chunkOptionsSchema = graphDao => {
  return Joi.object().keys({
    start: Joi.string().valid(graphDao.nodeKeys).required(),
    maxArraySize: Joi.number().min(10).description('maximum array size before exiting').required(),
    initial: Joi.any().description('initial data for transition').required(),
    reducer: Joi.func().description('function used to reduce the edge values').required(),
    stopper: Joi.func().description('function used to stop iterating the edges').required()
  });
};

export default function (trCalculator, graphDao, options) {
  Joi.assert(options, chunkOptionsSchema(graphDao));
  const accumulator = [];
  const hasReachedMaxSize = () => _.size(accumulator) >= options.maxArraySize;

  const explore = (total, state, edge) => {
    const shouldStop = options.stopper({total});
    if (hasReachedMaxSize() || shouldStop) {
      return;
    }
    const transitions = trCalculator.calculate(state, edge.t);

    accumulator.push({edge, total, transitions});

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
