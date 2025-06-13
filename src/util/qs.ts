import { WF_QS } from '@/constants'

export const getQueryStringVariable = (variable: string) =>
  new URLSearchParams(window.location.search).get(variable)

export const getDlc = () => getQueryStringVariable(WF_QS)
export const hasDlc = () => !!getDlc()
