import { readFileSync, writeFileSync } from 'fs'
import { ExtractorResultDetailed, PurgeCSS } from 'purgecss'

const tags = [
  'a',
  'abbr',
  'acronym',
  'address',
  'applet',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'basefont',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noframes',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'tt',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
]

const purgeFromJs = (content: string): ExtractorResultDetailed => {
  const regex = /"([A-Za-z_-]{1,2})"/g
  const matches: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1])
  }

  // console.log(`Possible classes (${matches.length}): ${matches.join(', ')}`)
  return {
    attributes: {
      names: [],
      values: [],
    },
    ids: [],
    tags,
    undetermined: [],
    classes: matches,
  }
}

const purgeCSSResult = await new PurgeCSS().purge({
  content: ['dist/assets/*.js'],
  css: ['dist/assets/*.css'],
  extractors: [
    {
      extractor: purgeFromJs,
      extensions: ['js'],
    },
  ],
})

// process.exit(0)

purgeCSSResult.forEach((result) => {
  const { css, file } = result
  if (!file) return
  const bytesBefore = Buffer.byteLength(readFileSync(file, 'utf-8'), 'utf-8')
  const bytesAfter = Buffer.byteLength(css, 'utf-8')
  console.log(`Writing optimized css: ${file}`)
  writeFileSync(file, css)
  console.log(`Reduced size from ${bytesBefore} to ${bytesAfter} bytes`)
})
