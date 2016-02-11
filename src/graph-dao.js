import _ from 'lodash';
import Joi from 'joi';
import transitionsCalc from './transitions-calculator.js';
import nodeSelector from './node-selector.js';

const iteratorSuffixes = ['start', 'end', 'next', 'previous'];

export default function (graph) {
  const iterators = () => {
    const it = {};
    graph.iterators.forEach(i => {
      it[i] = transitionsCalc.iterator();
    });
    return it;
  };

  const calculateTransitions = (it, total, tnew) => transitionsCalc.calculate(it, total, tnew);
  const selectRenderers = (state, name) => nodeSelector.select(state, graph.nodes[name]);

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

  const starify = owners => _.map(nonEmptyKeys(owners), prefix => `${prefix}:*`).sort();

  const starAliasKeys = () => starify(graph.aliases);

  const starTransitionKeys = () => starify(graph.transitions);

  const aliasKeys = () => {
    const groupedKeys = _.map(_.keys(graph.aliases), prefix => _.map(_.keys(graph.aliases[prefix]), t => `${prefix}:${t}`));
    return _.flatten(groupedKeys).sort();
  };

  const aliasKeysToTransitionKeys = () => {
    const a2t = {};
    _.forEach(_.keys(graph.aliases), prefix => {
      _.forEach(_.keys(graph.aliases[prefix]), t => `${prefix}:${t}`);
       //  mapping todo
    });
    return a2t;
  };

  const transitionKeys = () => {
    const groupedKeys = _.map(_.keys(graph.transitions), prefix => _.map(_.keys(graph.transitions[prefix]), t => `${prefix}:${t}`));
    return _.flatten(groupedKeys).sort();
  };

  const iteratorKeys = () => {
    const groupedKeys = _.map(graph.iterators, prefix => _.map(iteratorSuffixes, a => `${prefix}->${a}`));
    return _.flatten(groupedKeys).sort();
  };

  const uniqueKeys = () => {
    const uk = _.map(_.keys(graph.uniques), prefix => _.map(graph.uniques[prefix].list, u => `${prefix}:${u}`));
    return _.flattenDeep(uk).sort();
  };

  const searchEdgesBySource = name => _.filter(graph.edges, {s: name});
  const findNodeByName = name => graph.nodes[name];

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

  const valid = ()=> Joi

  return {iterators,
     calculateTransitions,
     selectRenderers,
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
     searchEdgesBySource,
     findNodeByName,
     valid
   };
}
