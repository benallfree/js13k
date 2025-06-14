import { readFileSync, statSync, writeFileSync } from 'fs'
// Bump the build number
console.log(`Updating build info`)
const BUILDINFO = './buildInfo.json'
const buildInfo = JSON.parse(readFileSync(BUILDINFO).toString())
buildInfo.bytes = statSync(`./out.zip`).size
writeFileSync(BUILDINFO, JSON.stringify(buildInfo, null, 2))

const readme = readFileSync('./README.md').toString()
const newReadme = readme
  .replace(/<!-- BUILD -->\d+/, `<!-- BUILD -->${buildInfo.build}`)
  .replace(/<!-- BYTES -->\d+/, `<!-- BYTES -->${buildInfo.bytes}`)

writeFileSync(`./README.md`, newReadme)

console.log(`Build #${buildInfo.build}`)
console.log(`Bytes: ${buildInfo.bytes}`)

// execSync(`git commit -am 'v${buildInfo.build}'`)
// execSync(`git tag 'v${buildInfo.build}'`)
