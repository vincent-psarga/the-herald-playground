import { ReactNode } from 'react';

export interface FooterProps {
  readonly children: ReactNode;
}

/**
 * What the talk is, said under every slide.
 *
 * Where it was given, when, to whom: that is about the talk and not about the
 * slide it happens to be written on, so it is not content and does not read as
 * content. A deck writes it once, wherever it likes — the first slide is the
 * obvious place — and the build stands it under every slide.
 *
 *     <Footer>Packmind — veille tech — 2026/09/25</Footer>
 */
export function Footer({ children }: FooterProps) {
  return <footer className="deck__footer">{children}</footer>;
}
