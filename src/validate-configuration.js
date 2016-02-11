import Joi from 'joi';

const anyKeyStr = '.+';

const validatorSchema = Joi.func().required();

const nativesCustomValidatorSchema = Joi.object().keys({
  native: validatorSchema.description('validator for native data').required(),
  renderer: validatorSchema.description('validator for renderer data').required(),
  nodeSelect: validatorSchema.description('validator for node select data').required()
});

const validatorsSchema = Joi.object().keys({
  natives: Joi.object().min(1).pattern(/.+/, nativesCustomValidatorSchema),
  transitionData: validatorSchema,
  uniqueData: validatorSchema,
  edgeData: validatorSchema
});

const regexesSchema = Joi.object().keys({
  iterators: validatorSchema,
  uniques: validatorSchema,
  renderers: validatorSchema,
  transitions: validatorSchema,
  transitionsItem: validatorSchema,
  aliases: validatorSchema,
  aliasesItem: validatorSchema,
  nodes: validatorSchema
});

const confSchema = Joi.object().keys({
  validators: validatorsSchema,
  regexes: regexesSchema
});

const assertValid = conf => Joi.assert(conf, confSchema);

export default {assertValid};
