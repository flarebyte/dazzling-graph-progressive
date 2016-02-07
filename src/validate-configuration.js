import Joi from 'joi';

const anyKeyStr = '.+';

const validatorSchema = Joi.object().required();

const nativesCustomValidatorSchema = Joi.object().keys({
  n: validatorSchema.description('validator for native data').required(),
  r: validatorSchema.description('validator for renderer data').required(),
  ns: validatorSchema.description('validator for node select data').required()
});

const validatorsSchema = Joi.object().keys({
  natives: Joi.object().min(1).pattern(/.+/, nativesCustomValidatorSchema),
  transitionData: validatorSchema,
  uniqueData: validatorSchema,
  edgeValues: validatorSchema
});

const regexesSchema = Joi.object().keys({
  iterators: Joi.string().default(anyKeyStr).optional(),
  uniques: Joi.string().default(anyKeyStr).optional(),
  renderers: Joi.string().default(anyKeyStr).optional(),
  transitions: Joi.string().default(anyKeyStr).optional(),
  transitionsItem: Joi.string().default(anyKeyStr).optional(),
  aliases: Joi.string().default(anyKeyStr).optional(),
  aliasesItem: Joi.string().default(anyKeyStr).optional(),
  nodes: Joi.string().default(anyKeyStr).optional()
});

const confSchema = Joi.object().keys({
  validators: validatorsSchema,
  regexes: regexesSchema
});

const assertValid = conf => Joi.assert(conf, confSchema);

export default {assertValid};
