/**
 * A deck is a module like any other once the build has been through it: what it
 * exports is the component that draws its content, handed the components it is
 * allowed to call.
 */
declare module '*.mdx' {
  import { ComponentType, ElementType } from 'react';

  const Content: ComponentType<{
    readonly components?: Readonly<Record<string, ElementType>>;
  }>;
  export default Content;
}
