const path = require( 'path' );

const nextPath = path.join( __dirname, 'node_modules', '.bin', 'next' );

process.argv.length = 1;
process.argv.push( nextPath, 'start' );

require( nextPath );

//sed -i 's/const defaultCommand = "dev";/const defaultCommand = "start";/g' node_modules/.bin/next