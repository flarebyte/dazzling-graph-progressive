import Joi from 'joi';
import _ from 'lodash';
import graphDao from './graph-dao.js';

const titleSchema = Joi.string().min(1).max(60).description('title').optional();
const descriptionSchema = Joi.string().min(1).max(500).description('description').optional();
const commentSchema = Joi.string().min(1).max(500).description('comment').optional();
const tagSchema = Joi.string().uri().min(1).max(255).description('tag').required();
const tagsSchema = Joi.array().items(tagSchema).max(20).optional();

const nativeSchema = graph => {
  const nats = _.mapValues(graph.config.validators.natives, nr => nr.native(graph.dao));
  return Joi.object().keys(nats);
};

const transitionSchema = graph => {
  const iterators = graph.iterators;
  return Joi.object().keys({
    s: Joi.string().valid(graph.dao.sourceKeys).description('source'),
    d: Joi.string().valid(graph.dao.sourceKeys).description('destination'),
    x: Joi.string().valid(graph.dao.filterKeys).description('delete'),
    a: Joi.string().valid(graph.dao.iteratorKeys).description('action'),
    i: Joi.string().valid(iterators).description('iterator'),
    l: Joi.array().items(Joi.string().valid(graph.dao.sourceKeys)).min(2).description('list')
  }).with('s', 'd')
  .with('i', ['l'])
  .without('i', ['s', 'd', 'x', 'a'])
  .without('x', ['s', 'd', 'i', 'a'])
  .without('a', ['s', 'd', 'i', 'x']);
};

const uniqueSchema = graph => {
  return Joi.object().keys({
    title: titleSchema,
    description: descriptionSchema,
    comment: commentSchema,
    tags: tagsSchema,
    list: Joi.array().items(Joi.string().min(1)).required(),
    data: graph.config.validators.uniqueData(graph.dao)
  });
};

const aliasesSchema = graph => {
  const transitionKeys = graph.dao.transitionKeys;
  return Joi.object().pattern(new RegExp(graph.config.regexes.aliasesItem(graph.dao)), Joi.string().valid(transitionKeys));
};

const transitionsSchema = graph => {
  return Joi.object().pattern(new RegExp(graph.config.regexes.transitionsItem(graph.dao)), graph.config.validators.transitionData(graph.dao));
};

const buildRendererAlternatives = graph => {
  var alt = Joi.alternatives();
  _.forOwn(graph.config.validators.natives, (v, k) => alt = alt.when('native', {is: k, then: v.renderer(graph.dao)}));
  return alt;
};

const buildNodeSelectAlternatives = graph => {
  const renderer2NativeValidator = _.mapValues(graph.renderers, r => graph.config.validators.natives[r.native].nodeSelect(graph.dao));
  var alt = Joi.alternatives();
  _.forOwn(renderer2NativeValidator, (v, k) => alt = alt.when('r', {is: k, then: v}));
  return alt;
};

const rendererSchema = graph => {
  return Joi.object().keys({
    title: titleSchema,
    description: descriptionSchema,
    comment: commentSchema,
    tags: tagsSchema,
    native: Joi.string().valid(_.keys(graph.config.validators.natives)).required(),
    data: buildRendererAlternatives(graph)
  });
};

const filterSchema = graph => {
  const filterKeys = graph.dao.filterKeys;
  return Joi.object().keys({
    allOf: Joi.array().items(Joi.string().valid(filterKeys)).description('Must satisfy all the tags'),
    noneOf: Joi.array().items(Joi.string().valid(filterKeys)).description('Should not be present'),
    oneOf: Joi.array().items(Joi.string().valid(filterKeys)).description('Should satisfy at least one tag')
  }).or('allOf', 'noneOf', 'oneOf');
};

const nodeItemSchema = graph => {
  const rendererKeys = graph.dao.rendererKeys;
  return Joi.object().keys({
    f: filterSchema(graph).description('filter').required(),
    r: Joi.string().valid(rendererKeys).description('renderer').required(),
    data: buildNodeSelectAlternatives(graph)
  });
};
const nodeSchema = graph => {
  return Joi.object().keys({
    title: titleSchema,
    description: descriptionSchema,
    comment: commentSchema,
    tags: tagsSchema,
    select: Joi.array().min(1).items(nodeItemSchema(graph)).description('items').required()
  });
};

const edgeSchema = graph => {
  return Joi.object().keys({
    title: titleSchema,
    description: descriptionSchema,
    comment: commentSchema,
    tags: tagsSchema,
    s: Joi.string().valid(graph.dao.nodeKeys).description('source').required(),
    d: Joi.string().valid(graph.dao.nodeKeys).description('destination').required(),
    t: Joi.array().items(transitionSchema(graph)).description('transitions').required(),
    u: Joi.array().items(Joi.string().valid(graph.dao.uniqueKeys)).description('unique ids').required(),
    data: graph.config.validators.edgeData(graph.dao)
  });
};


const minGraphSchema = Joi.object().keys({
  natives: Joi.object().min(1).required(),
  uniques: Joi.object().min(1).required(),
  renderers: Joi.object().min(1).required(),
  transitions: Joi.object().min(1).required(),
  iterators: Joi.array(Joi.string()).required(),
  aliases: Joi.object().required(),
  nodes: Joi.object().min(1).required(),
  edges: Joi.array().min(1).required()
});

const pattern = (graph, fregex) => new RegExp(fregex(graph.dao));

const graphSchema = graph => {
  return Joi.object().keys({
    config: Joi.object(),
    dao: Joi.object(),
    natives: nativeSchema(graph),
    iterators: Joi.array().items(Joi.string().regex(pattern(graph, graph.config.regexes.iterators))),
    uniques: Joi.object().min(1).pattern(pattern(graph, graph.config.regexes.uniques), uniqueSchema(graph)).required(),
    renderers: Joi.object().min(1).pattern(pattern(graph, graph.config.regexes.renderers), rendererSchema(graph)).required(),
    transitions: Joi.object().min(1).pattern(pattern(graph, graph.config.regexes.transitions), transitionsSchema(graph)).required(),
    aliases: Joi.object().pattern(pattern(graph, graph.config.regexes.aliases), aliasesSchema(graph)).required(),
    nodes: Joi.object().pattern(pattern(graph, graph.config.regexes.nodes), nodeSchema(graph)),
    edges: Joi.array().items(edgeSchema(graph)).required()
  });
};

const validate = (conf, graph) => {
  Joi.assert(graph, minGraphSchema);
  graph.config = conf;
  graph.dao = graphDao(graph);

  const schema = graphSchema(graph);
  const result = Joi.validate(graph, schema);
  return _.isNull(result.error) ? result.value : result.error;
};

export default {validate, edgeSchema, nodeSchema, rendererSchema};
