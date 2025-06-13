import van, { type ChildDom, type Props, type State } from './van-0.12.3.min'

export const { button, div, a, p, pre, br, input, img, sup, h1, h2, textarea } = van.tags
export const { state, bind } = van

export type ReadOnlyState<T> = Omit<State<T>, 'val'> & { readonly val: T }
export const toReadOnlyState = <T>(state: State<T>) => state as ReadOnlyState<T>

export { ChildDom, Props, State, van }
