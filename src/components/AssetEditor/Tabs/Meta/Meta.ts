import { mkClass } from '@/util'
import { div, p } from '@/van'
import { BedrockEditor } from './BedrockEditor'
import { DescriptionEditor } from './DescriptionEditor'
import { TitleEditor } from './TitleEditor'

export type MetaProps = {}
export const DefaultMetaProps: MetaProps = {}
export const Meta = (props?: Partial<MetaProps>) => {
  const {} = { ...DefaultMetaProps, ...props }

  return div(
    { ...mkClass(`Meta`) },
    p(`Title`),
    TitleEditor(),
    p(`Description`),
    DescriptionEditor(),
    p(`Bedrock`),
    BedrockEditor()
  )
}
