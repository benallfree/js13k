import { readFileSync, writeFileSync } from 'fs'

import { statSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json').toString())
const version = packageJson.version

const zipPath = `van13k-${version}.zip`
const stats = statSync(zipPath)
const bytes = stats.size

const readme = readFileSync('./README.md').toString()
const newReadme = readme.replace(/<!-- BYTES -->\d+/, `<!-- BYTES -->${bytes}`)

writeFileSync(`./README.md`, newReadme)

console.log(`Bytes: ${bytes}`)
