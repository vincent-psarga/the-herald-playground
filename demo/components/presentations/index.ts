/**
 * What a deck may call by name.
 *
 * A slide is markdown until it needs to be more than markdown, and what it
 * reaches for then is one of these: every component exported here is in scope in
 * every deck, under the name it is exported by. A deck naming anything else is
 * refused when it is drawn, which is the right time to hear about it.
 *
 * They live apart from the demo's own components on purpose. These are written
 * to be read across a room — larger, fewer, saying one thing — and a component
 * shared with the pages would end up serving neither.
 */
export { Blazon } from './Blazon';
export { Body } from './Body';
export { Footer } from './Footer';
export { Rest, Side } from './Side';
export { Step, Steps } from './Steps';
