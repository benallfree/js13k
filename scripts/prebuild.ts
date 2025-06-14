import { readFileSync, writeFileSync } from 'fs'
// Bump the build number
console.log(`Bumping build number`)
const BUILDINFO = './buildInfo.json'
const buildInfo = JSON.parse(readFileSync(BUILDINFO).toString())
buildInfo.build++
writeFileSync(BUILDINFO, JSON.stringify(buildInfo, null, 2))
