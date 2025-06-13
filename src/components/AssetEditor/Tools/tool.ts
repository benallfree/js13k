export enum EditorTools {
  Draw,
  Erase
}
export const TOOL_NAMES: {
  [_ in EditorTools]: string
} = {
  [EditorTools.Draw]: '✏️',
  [EditorTools.Erase]: '🧹'
}

export const mkTool = (s: string) => parseInt(s) as EditorTools
