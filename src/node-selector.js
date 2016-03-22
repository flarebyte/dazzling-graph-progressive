import _ from 'lodash';

const isAbsent = value => _.isNull( value ) || _.isUndefined( value ) || _.isEmpty( value );

const findWildChar = ( search, list ) => {
  if ( search === '*' ) {
    return _.uniq( list ).sort();
  }
  const prefix = search.replace( /\*$/, '' );
  return _.filter( list, w => _.startsWith( w, prefix ) );
};

const anyWildCharTags = ( state, list ) => {
  const wildTags = _.filter( list, w => _.endsWith( w, '*' ) );
  const findIt = search => findWildChar( search, state );
  return _.flatten( _.map( wildTags, findIt ) );
};

const oneOf = ( state, list ) => {
  const found = _.intersection( state, list );
  const wildTags = anyWildCharTags( state, list );
  return _.union( found, wildTags ).sort();
};

const isOneOf = ( state, list ) => !_.isEmpty( oneOf( state, list ) );

const allOf = ( state, list ) => {
  const wildTags = _.filter( list, w => _.endsWith( w, '*' ) );
  const listWithoutWildTags = _.difference( list, wildTags );
  const isSatisfiedSoFar = _.isEmpty( listWithoutWildTags ) ? true : _.isEqual( _.intersection( state, listWithoutWildTags ).sort(), list.sort() );
  const findIt = search => findWildChar( search, state );
  const wildTagsSearch = _.map( wildTags, findIt );
  const isWildCharSatisfied = wildTags.length === wildTagsSearch.length;

  return isSatisfiedSoFar && isWildCharSatisfied ? _.union( _.flatten( wildTagsSearch ).sort(), listWithoutWildTags ) : [];
};

const isAllOf = ( state, list ) => !_.isEmpty( allOf( state, list ) );

const isNoneOf = ( state, list ) => isAbsent( list ) ? false : !_.isEmpty( _.intersection( state, list ) );

const asTruthTable = f => {
  const noAllOf = isAbsent( f.allOf ) ? 'A' : 'ALL OF';
  const noOneOf = isAbsent( f.oneOf ) ? 'B' : 'ONE OF';
  return `${noAllOf},${noOneOf}`;
};

const select = ( state, node ) => {
  const noState = isAbsent( state );
  const filtering = selection => {
    const noneOfFailed = isNoneOf( state, selection.f.noneOf );
    if ( noneOfFailed ) {
      return false;
    }
    const truthTable = asTruthTable( selection.f );

    switch ( truthTable ) {
      case 'A,B': return false;
      case 'A,ONE OF': return isOneOf( state, selection.f.oneOf );
      case 'ALL OF,B': return isAllOf( state, selection.f.allOf );
      case 'ALL OF,ONE OF': return isOneOf( state, selection.f.oneOf ) && isAllOf( state, selection.f.allOf );
      default: return Error( 'unexpected case' );
    }
  };

  const addPicked = selection => {
    const truthTable = asTruthTable( selection.f );

    switch ( truthTable ) {
      case 'A,ONE OF': selection.picked = oneOf( state, selection.f.oneOf ).sort(); break;
      case 'ALL OF,B': selection.picked = allOf( state, selection.f.allOf ).sort(); break;
      case 'ALL OF,ONE OF': selection.picked = _.union( oneOf( state, selection.f.oneOf ), isAllOf( state, selection.f.allOf ) ).sort(); break;
      default: return Error( 'unexpected case' );
    }
    return selection;
  };

  return noState ? [] : _.map( _.filter( node.select, filtering ), addPicked );
};

export default { select, oneOf, allOf, findWildChar };
