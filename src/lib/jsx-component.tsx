import { importDefaultComponent, propsComponent } from './jsx.js';

export type LinkProps = {
  class?: string;
  id: string;
  page: string;
  style?: HTMLElementStyle;
  text?: string
};

export type HTMLElementStyle = Partial<CSSStyleDeclaration>;
export interface ClickEvent extends MouseEvent {
  target: HTMLElement;
}

const data = new Map();
window.addEventListener( 'popstate', ( _event ) => {
  window.location.href = window.location.pathname;
} );

export const Link = ( ref: LinkProps ): HTMLElement => {

  propsComponent( ref, ref.id );
  data.set( ref.id, ref );

  return(
    <>
      <span class={ref.class || ''} id={ref.id} onClick={link_click} style={ref.style || style}>
        {ref.text || ref.page }
      </span>
    </>
  );
};

async function link_click( event: ClickEvent ): Promise<void> {
  const PageComponent = await importDefaultComponent( `./${data.get( event.target.id ).page}.js` );
  const AppElement = document.getElementById( 'app' );
  const PageElement = AppElement.querySelector( 'main' );
  history.pushState( {}, '', `/${data.get( event.target.id ).page}.html`.toLowerCase() );
  history.replaceState( {}, '', `/${data.get( event.target.id ).page}.html`.toLowerCase() );
  AppElement.replaceChild( <PageComponent />, PageElement );
}

const style: HTMLElementStyle = {
  cursor: 'pointer',
  textDecoration: 'underline'
};
