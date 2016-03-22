import validateConf from '../src/validate-configuration.js';
import test from 'tape';
import config from './config.js';

test( 'Validate Configuration should assert configuration', t => {
  t.plan( 1 );
  validateConf.assertValid( config.valid );
  t.pass( 'valid' );
} );
