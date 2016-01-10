import _ from 'lodash';
import transitionsCalc from './transitions-calculator.js';

const iteratorSuffixes = ['start', 'end', 'next', 'previous'];

export default function (graph) {

  const iterators = () => {
    const it = {};
    graph.iterators.forEach(i => {
      it[i] = transitionsCalc.iterator();
    });
    return it;
  };
  const nodeKeys = _.keys(graph.nodes);

  const nativeKeys = _.keys(graph.natives);

  const rendererKeys = _.keys(graph.renderers);

  const nonEmptyKeys = owners => {
    const r = [];
    _.forEach(owners, (v, k) => {
      const hasChild = !_.isEmpty(v);
      if (hasChild) {
        r.push(k);
      }
    });
    return r.sort();
  };

  const starify = owners => {
    return _.map(nonEmptyKeys(owners), prefix => `${prefix}:*`).sort();
  };

  const starAliasKeys = () => {
    return starify(graph.aliases);
  };

  const starTransitionKeys = () => {
    return starify(graph.transitions);
  };

  const aliasKeys = () => {
    const groupedKeys = _.map(_.keys(graph.aliases), prefix => {
      return _.map(_.keys(graph.aliases[prefix]), t => `${prefix}:${t}`);
    });
    return _.flatten(groupedKeys).sort();
  };

  const aliasKeysToTransitionKeys = () => {
    var a2t = {};
    _.forEach(_.keys(graph.aliases), prefix => {
      _.forEach(_.keys(graph.aliases[prefix]), t => `${prefix}:${t}`);
       //mapping todo
    });
    return a2t;
  };

  const transitionKeys = () => {
    const groupedKeys = _.map(_.keys(graph.transitions), prefix => {
      return _.map(_.keys(graph.transitions[prefix]), t => `${prefix}:${t}`);
    });
    return _.flatten(groupedKeys).sort();
  };

  const iteratorKeys = () => {
    const groupedKeys = _.map(graph.iterators, prefix => {
      return _.map(iteratorSuffixes, a => `${prefix}->${a}`);
    });
    return _.flatten(groupedKeys).sort();
  };

  const uniqueKeys = ()=> {
    const uk = _.map(_.keys(graph.uniques), prefix => {
      return _.map(graph.uniques[prefix].list, u => `${prefix}:${u}`);
    });
    return _.flattenDeep(uk).sort();
  };

  const searchEdgesBySource = name => {
    return _.filter(graph.edges, 's', name);
  };

  const allTransitionKeys = transitionKeys();
  const allAliasKeys = aliasKeys();
  const allIteratorKeys = iteratorKeys();
  const allUniqueKeys = uniqueKeys();
  const allStarAliasKeys = starAliasKeys();
  const allStarTransitionKeys = starTransitionKeys();
  const filterKeys = _.union(allTransitionKeys, allAliasKeys, allStarAliasKeys, allStarTransitionKeys, ['*']).sort();
  const sourceKeys = _.union(allTransitionKeys, allAliasKeys).sort();

  const allAliasKeys2TransitionKeys = aliasKeysToTransitionKeys();

  const resolveAliases = list => {
    const withoutAliases = _.difference(list, allAliasKeys);
    const onlyAliases = _.difference(list, allTransitionKeys);
    const aliasAsTrans = _.map(onlyAliases, a => allAliasKeys2TransitionKeys[a]);
    return withoutAliases.concat(aliasAsTrans);
  };

  return {iterators,
     nodeKeys,
     nativeKeys,
     rendererKeys,
     sourceKeys,
     aliasKeys: allAliasKeys,
     transitionKeys: allTransitionKeys,
     iteratorKeys: allIteratorKeys,
     uniqueKeys: allUniqueKeys,
     starAliasKeys: allStarAliasKeys,
     starTransitionKeys: allStarTransitionKeys,
     filterKeys,
     resolveAliases,
     searchEdgesBySource
   };

}
