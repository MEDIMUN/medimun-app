"use client";

export function removeSearchParams ( router, params ) {
   const url = new URL( window.location.href );
   for ( const [ key, value ] of Object.entries( params ) ) {
      url.searchParams.delete( key );
   }
   router.push( url.toString() );
}

export function updateSearchParams ( router, params ) {
   const url = new URL( window.location.href );
   for ( const [ key, value ] of Object.entries( params ) ) {
      url.searchParams.set( key, value );
   }
   router.push( url.toString() );
}