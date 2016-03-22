const valid = {
  validators: {
    natives: {
      metadata: {
        native: graphDao => graphDao.valid().object().min( 1 ).required(),
        renderer: graphDao => graphDao.valid().string().max( 4 ).required(),
        nodeSelect: graphDao => graphDao.valid().string().max( 5 ).required()
      },
      path: {
        native: graphDao => graphDao.valid().object().min( 2 ).required(),
        renderer: graphDao => graphDao.valid().number().required(),
        nodeSelect: graphDao => graphDao.valid().boolean().required()
      }
    },
    uniqueData: graphDao => graphDao.valid().object().min( 1 ).required(),
    transitionData: graphDao => graphDao.valid().number().required(),
    edgeData: graphDao => graphDao.valid().number().required()
  },
  regexes: {
    renderers: graphDao => '[A-Za-z0-9]{2,10}',
    transitions: graphDao => '[A-Za-z0-9]{2,10}',
    transitionsItem: graphDao => '[A-Za-z0-9]{2,10}',
    iterators: graphDao => '[A-Za-z0-9]{2,10}',
    aliases: graphDao => '[A-Za-z0-9]{2,10}',
    aliasesItem: graphDao => '[A-Za-z0-9]{2,10}',
    uniques: graphDao => '[A-Za-z0-9]{2,10}',
    nodes: graphDao => '[A-Za-z0-9]{2,10}'
  }
};

export default { valid };
