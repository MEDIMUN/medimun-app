"use client";

import { useCallback, useLayoutEffect, useRef } from 'react';

const isBrowser = typeof window !== 'undefined';

const getScrollPosition = ( { element, useWindow } ) => {
   if ( !isBrowser ) return { x: 0, y: 0 };

   if ( useWindow ) {
      return { x: window.scrollX, y: window.scrollY };
   }
   const target = element ? element.current : document.body;
   const position = target.getBoundingClientRect();
   return { x: position.left, y: position.top };
};

const useScrollPosition = ( { handler, deps, element, useWindow, debounce } ) => {
   const position = useRef( getScrollPosition( { useWindow } ) );

   const throttleTimeout = useRef( null );

   const callBack = useCallback( () => {
      const currPos = getScrollPosition( { element, useWindow } );
      if ( handler ) {
         handler( { previous: position.current, current: currPos } );
      }
      position.current = currPos;
      throttleTimeout.current = null;
   }, [ handler, element, useWindow ] );

   useLayoutEffect( () => {
      const handleScroll = () => {
         if ( debounce ) {
            if ( throttleTimeout.current === null ) {
               throttleTimeout.current = setTimeout( callBack, debounce );
            }
         } else {
            callBack();
         }
      };

      window.addEventListener( 'scroll', handleScroll );
      return () => window.removeEventListener( 'scroll', handleScroll );
   }, [ callBack, deps, debounce ] );

   if ( !handler ) {
      return position.current;
   }
};

export default useScrollPosition;