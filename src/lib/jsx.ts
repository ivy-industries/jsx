type children = HTMLElement | HTMLElement[] | jsxObject | jsxObject[] | null | string | string[];
type attributes = {[ property: keyof HTMLElementEventMap | string ]: ( {} | number | string | unknown[] ) & EventListenerOrEventListenerObject};
interface jsxObject {
  attributes: attributes,
  children: children[],
  elementName: ( ( attributes: jsxObject['attributes'], ...children: jsxObject['children'][] )=>HTMLElement ) | string
}
type signal_initializer = boolean | number | string;
type signal = {} | HTMLElement | boolean | number | string | unknown[];

export function Fragment( jsxObject: HTMLElement ): HTMLElement{

  return jsxObject;
}

export default function jsx( jsxObject: jsxObject ): HTMLElement {

  if ( typeof jsxObject.elementName === 'function' ) {

    return jsxObject.elementName(
      jsxObject.attributes,
      jsxObject.children,
    ) as HTMLElement;
  }

  const element: HTMLElement = document.createElement( jsxObject.elementName );
  const properties = Object.entries( jsxObject.attributes );

  for ( const [ name, value ] of properties ) {

    if ( name.startsWith( 'on' ) && name.toLowerCase() in window ) {

      element.addEventListener(
        name.toLowerCase().substring( 2 ),
        value,
      );
    }
    else if ( name === 'style' ) {

      for ( const [ style_property, style_value ] of Object.entries( value ) ) {
        element.style[ style_property ] = style_value;
      }
    }
    else {
      element.setAttribute( name, value.toString() );
    }
  }

  for ( const children of jsxObject.children ) {
    recursive_append_child( element, children );
  }

  return element;
}

function recursive_append_child( parent: HTMLElement, children: children ): void {

  if ( Array.isArray( children ) ) {
    for( const nested of children ){
      recursive_append_child( parent, nested );
    }
  }
  else{
    if( children instanceof HTMLElement ){
      parent.appendChild( children );

      return;
    }
    else if( typeof children === 'string' ){
      parent.appendChild( document.createTextNode( children ) );
    }
  }
}

export async function importComponent( relative_path: string, identifier: string ): Promise<() => HTMLElement> {
  return ( await import( `${relative_path}?t=${Date.now()}` ) )[ identifier ];
}

export async function importDefaultComponent( relative_path: string ): Promise<() => HTMLElement> {
  return ( await import( `${relative_path}?t=${Date.now()}` ) ).default;
}

export function propsComponent( props: {}, identifier: string ) {
  window[ `${identifier}-props` ] = props;
}

export function signal( identifier: string, initializer: signal_initializer = 0 ): [ ( awaiting_data?: boolean ) => HTMLSpanElement, () => signal, ( data: signal ) => void, ( replace?: boolean, before?: boolean, awaiting_data?: boolean ) => void ] {

  window[ `${identifier}-signal` ] = initializer;
  window[ `${identifier}-signal-awaiting-data` ] = false;
  const signal_elem = document.createElement( 'span' );

  signal_elem.textContent = window[ `${identifier}-signal` ];
  signal_elem.id = `${identifier}-signal`;

  const init = ( awaiting_data: boolean = false ) => {
    if( awaiting_data ){

      const spinner = document.createElement( 'div' );
      spinner.classList.add( 'awaiting-data' );
      spinner.id = `${identifier}-signal-awaiting-data`;
      signal_elem.appendChild( spinner );
    }

    return signal_elem;
  };

  const get = (): signal => {
    return window[ `${identifier}-signal` ];
  };

  const set = ( data: signal ): void => {

    if ( data.constructor === undefined ) {
      throw new TypeError( 'undefined or null aren\'t an option.' );
    }

    if ( data instanceof HTMLElement ) {

      window[ `${identifier}-signal` ] = data;

      return;
    }
    if (
      data.constructor.name !== 'Object' &&
      data.constructor.name !== 'String' &&
      data.constructor.name !== 'Number' &&
      data.constructor.name !== 'Array' &&
      data.constructor.name !== 'Boolean'
    ) {
      throw new TypeError(
        `only Object Array String Number Boolean are options. given -> ${data.constructor.name}`,
      );
    }

    window[ `${identifier}-signal` ] = data;
  };

  const render = ( replace: boolean = true, before: boolean = false, awaiting_data: boolean = false ): void => {

    const data = window[ `${identifier}-signal` ];

    if( awaiting_data ){
      const awaiting_data_element = document.querySelector( `#${identifier}-signal-awaiting-data` );
      console.log( awaiting_data_element );
      if( awaiting_data_element !== null ){
        awaiting_data_element.remove();
      }
    }

    if ( data instanceof HTMLElement ) {

      if ( replace ) {

        signal_elem.innerHTML = '';
        signal_elem.appendChild( data );

        return;
      }
      if( before ){

        signal_elem.insertBefore( data, signal_elem.firstChild );

        return;
      }
      signal_elem.appendChild( data );

      return;
    }

    signal_elem.textContent = typeof data === 'object' ? JSON.stringify( data ) : data;
  };

  return [ init, get, set, render ];
}

interface IVirtualRouteValidationSegments{
  url_segments: string[],
  virtual_segments: string[]
}

function virtual_routes_segments( url: string, virtual_route: string ): IVirtualRouteValidationSegments{

  const url_array = url.split( '/' ).filter( segment => segment !== '' );
  const virtual_route_array = virtual_route.split( '/' ).filter( segment => segment !== '' );

  return {
    url_segments: url_array,
    virtual_segments: virtual_route_array
  };
}

function virtual_routes_validation( url: string, virtual_route: string ): boolean {

  const { url_segments, virtual_segments } = virtual_routes_segments( url, virtual_route );

  if ( url_segments.length !== virtual_segments.length ) {
    return false;
  }

  for ( let i = 0; i < virtual_segments.length; i ++ ) {

    if ( virtual_segments[ i ].startsWith( ':' ) ) {
      continue;
    }
    if ( url_segments[ i ] !== virtual_segments[ i ] ) {
      return false;
    }
  }

  return true;
}

export function virtual_routes( url: string, vroutes: string[] ): 200|404{

  let status_code: 200|404 = 200;
  for ( const virtual_route of vroutes ) {

    status_code = virtual_routes_validation( url, virtual_route )
      ? 200
      : 404;

    if ( status_code === 200 ) {
      break;
    }
  }

  return status_code;
}

export function url_params( url:string, vroutes: string[] ): {} {

  const url_array = url.split( '/' ).filter( segment => segment !== '' );

  const params = {};
  let index = 0;
  for( const vroute of vroutes ){

    const vroute_array = vroute.split( '/' ).filter( seg => seg !== '' );
    for( index; index < vroute_array.length; index ++ ){

      if( vroute_array[ index ].startsWith( ':' ) ){

        params[ vroute_array[ index ].replace( ':', '' ) ] =
          Number.isNaN( parseInt( url_array[ index ] ) ) === true
            ? url_array[ index ]
            : Number( url_array[ index ] );
      }
    }
  }

  return params;
}

export function get_page_component( url: string ){

  const url_array = url.split( '/' ).filter( segment => segment !== '' );
  if( ! url_array[ 0 ] ){
    url_array[ 0 ] = 'home.html';
  }

  const page = `${url_array[ 0 ].replace( '.html', '' )}.js`;

  return `./${page.charAt( 0 ).toUpperCase()}${page.slice( 1 )}`;
}
