declare module '@ivy-industries/jsx' {
  type children = HTMLElement | HTMLElement[] | jsxObject | jsxObject[] | null | string | string[];
  type attributes = {
      [property: keyof HTMLElementEventMap | string]: ( {} | number | string | unknown[] ) & EventListenerOrEventListenerObject;
  };
  interface jsxObject {
      attributes: attributes;
      children: children[];
      elementName: ( ( attributes: jsxObject['attributes'], ...children: jsxObject['children'][] ) => HTMLElement ) | string;
  }
  type signal_initializer = boolean | number | string;
  type signal = {} | HTMLElement | boolean | number | string | unknown[];
  export function Fragment( jsxElement: HTMLElement ): HTMLElement;
  export default function jsx( jsxObject: jsxObject ): HTMLElement;
  export function importComponent( relative_path: string, identifier: string ): Promise<() => HTMLElement>;
  export function importDefaultComponent( relative_path: string ): Promise<() => HTMLElement>;
  export function propsComponent( props: {}, identifier: string ): void;
  export function signal( identifier: string, initializer?: signal_initializer ): [( awaiting_data?: boolean ) => HTMLSpanElement, () => signal, ( data: signal ) => void, ( replace?: boolean, before?: boolean, awaiting_data?: boolean ) => void];
  export function virtual_routes( url: string, vroutes: string[] ): 200 | 404;
  export function url_params( url: string, vroutes: string[] ): {};
  export function get_page_component( url: string ): string;
}

declare module '@ivy-industries/jsx/component'{
  export type HTMLElementStyle = Partial<CSSStyleDeclaration>;
  export type LinkProps = {
      class?: string;
      id: string;
      page: string;
      style?: HTMLElementStyle;
      text?: string;
  };
  export const Link: ( ref: LinkProps ) => HTMLElement;
}
