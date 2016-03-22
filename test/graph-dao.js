import graphDaoCreator from '../src/graph-dao.js';
import test from 'tape';

test( 'Graph DAO should be resilient to the absence of transition keys', t => {
  t.plan( 2 );
  t.deepEqual( graphDaoCreator( { transitions: {} } ).transitionKeys, [], 'empty transitions' );
  t.deepEqual( graphDaoCreator( {} ).transitionKeys, [], 'no transition' );
} );

test( 'should be resilient to the absence of alias keys', t => {
  t.plan( 2 );
  t.deepEqual( graphDaoCreator( { aliases: {} } ).aliasKeys, [], 'empty aliases' );
  t.deepEqual( graphDaoCreator( {} ).aliasKeys, [], 'no alias' );
} );

test( 'should be resilient to the absence of iterators', t => {
  t.plan( 2 );
  t.deepEqual( graphDaoCreator( { iterators: [] } ).iteratorKeys, [], 'empty iterators' );
  t.deepEqual( graphDaoCreator( {} ).iteratorKeys, [], 'no iterator' );
} );

test( 'should return the list of node keys', t => {
  const graph = {
    nodes: { a: 'Alpha', b: 'Beta' }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.nodeKeys, [ 'a', 'b' ] );
} );

test( 'should return the list of native keys', t => {
  const graph = {
    natives: { a: 'Alpha', b: 'Beta' }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.nativeKeys, [ 'a', 'b' ] );
} );

test( 'should return the list of renderer keys', t => {
  const graph = {
    renderers: { a: 'Alpha', b: 'Beta' }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.rendererKeys, [ 'a', 'b' ] );
} );

test( 'should return the list of unique keys', t => {
  const graph = {
    uniques: {
      a: {
        list: [ '1/3', '2/3', '3/3' ]
      },
      b: {
        list: [ '1/6', '2/6' ]
      },
      ignoreme: {
      }
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.uniqueKeys, [ 'a:1/3', 'a:2/3', 'a:3/3', 'b:1/6', 'b:2/6' ] );
} );

test( 'should return the list of alias keys', t => {
  const graph = {
    aliases: {
      'clr2': {
        blackish: 'clr:black',
        greyish: 'clr:grey'
      },
      'clr3': {
        greenish: 'clr:black',
        blueish: 'clr:grey'
      },
      'alpha:beta-charlie': {
        top: 'clr:black'
      },
      'nothereyet': {}
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.aliasKeys, [ 'alpha:beta-charlie:top', 'clr2:blackish', 'clr2:greyish', 'clr3:blueish', 'clr3:greenish' ] );
} );

test( 'should return the list of transition keys', t => {
  const graph = {
    transitions: {
      clr: {
        black: 12,
        white: 16,
        grey: 18
      },
      appearance: {
        smooth: 19,
        grain: 17,
        rough: 16
      },
      ignoreme: ''
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.transitionKeys, [ 'appearance:grain', 'appearance:rough', 'appearance:smooth',
   'clr:black', 'clr:grey', 'clr:white' ] );
} );

test( 'should return the list of iterator keys', t => {
  const graph = {
    iterators: [ 'alpha', 'beta' ]
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.iteratorKeys,
    [ 'alpha->end', 'alpha->next', 'alpha->previous', 'alpha->start',
   'beta->end', 'beta->next', 'beta->previous', 'beta->start' ] );
} );

test( 'should return the list of wildchar alias keys', t => {
  const graph = {
    aliases: {
      'clr2': {
        blackish: 'clr:black',
        greyish: 'clr:grey'
      },
      'brand:clr3': {
        greenish: 'clr:black',
        blueish: 'clr:grey'
      },
      'a-b:c:d_a': {

      }
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.starAliasKeys, [ 'brand:clr3:*', 'clr2:*' ] );
} );

test( 'should return the list of wildchar transition keys', t => {
  const graph = {
    transitions: {
      'clr2': {
        black: 12,
        white: 16,
        grey: 18
      },
      'brand:clr3': {
        black: 12,
        white: 16,
        grey: 18
      },
      'a-b:c:d_a': {
      }
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.starTransitionKeys, [ 'brand:clr3:*', 'clr2:*' ] );
} );

test( 'should return the list of filter keys', t => {
  const graph = {
    transitions: {
      clr: {
        black: 12,
        white: 16,
        grey: 18
      },
      appearance: {
        smooth: 19,
        grain: 17,
        rough: 16
      },
      ignoreme: ''
    },
    aliases: {
      oss117: {
        nice: '',
        better: '',
        worse: ''
      }
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.filterKeys, [ '*', 'appearance:*', 'appearance:grain', 'appearance:rough', 'appearance:smooth',
   'clr:*', 'clr:black', 'clr:grey', 'clr:white', 'oss117:*', 'oss117:better', 'oss117:nice', 'oss117:worse' ] );
} );

test( 'should return the list of source keys', t => {
  const graph = {
    transitions: {
      clr: {
        black: 12,
        white: 16,
        grey: 18
      },
      appearance: {
        smooth: 19,
        grain: 17,
        rough: 16
      },
      ignoreme: ''
    },
    aliases: {
      oss117: {
        nice: '',
        better: '',
        worse: ''
      }
    }
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 1 );
  t.deepEqual( graphDao.sourceKeys, [ 'appearance:grain', 'appearance:rough', 'appearance:smooth',
   'clr:black', 'clr:grey', 'clr:white', 'oss117:better', 'oss117:nice', 'oss117:worse' ] );
} );

test( 'should return search edges by source ', t => {
  const graph = {
    edges: [ { s: 'a', d: 'b' }, { s: 'b', d: 'a' }, { s: 'c', d: 'd' }, { s: 'c', d: 'e' } ]
  };
  const graphDao = graphDaoCreator( graph );
  t.plan( 4 );
  t.deepEqual( graphDao.searchEdgesBySource( 'a' ), [ { s: 'a', d: 'b' } ], 'a' );
  t.deepEqual( graphDao.searchEdgesBySource( 'b' ), [ { s: 'b', d: 'a' } ], 'b' );
  t.deepEqual( graphDao.searchEdgesBySource( 'c' ), [ { s: 'c', d: 'd' }, { s: 'c', d: 'e' } ], 'c' );
  t.deepEqual( graphDao.searchEdgesBySource( 'g' ), [], 'g' );
} );
