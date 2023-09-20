export function titleCase ( str, separator ) {
   if ( typeof str !== "string" ) return "";
   let splitStr = str.split( separator );
   for ( var i = 0; i < splitStr.length; i++ ) {
      splitStr[ i ] = splitStr[ i ].charAt( 0 ).toUpperCase() + splitStr[ i ].substring( 1 );
   }
   return splitStr.join( separator );
}