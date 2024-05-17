"use client";

export function removeSearchParams ( params, router ) {
   if ( !router ) throw new Error( "router is required" );
   const url = new URL( window.location.href );
   for ( const [ key, value ] of Object.entries( params ) ) {
      url.searchParams.delete( key );
   }
   router.push( url.toString(), { scroll: false } );
}

export function updateSearchParams ( params, router ) {
   if ( !router ) throw new Error( "router is required" );
   const url = new URL( window.location.href );
   for ( const [ key, value ] of Object.entries( params ) ) {
      url.searchParams.set( key, value );
   }
   router.push( url.toString(), { scroll: false } );
}