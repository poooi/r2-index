import fs from 'node:fs/promises'
import os from 'node:os'

import { faker } from '@faker-js/faker'
import { execa } from 'execa'
import pEachSeries from 'p-each-series'

// clean up
await execa`corepack pnpm rimraf ./temp`
await execa`corepack pnpm rimraf .wrangler`

await fs.mkdir('./temp')

// create a 1mb file
console.log(os.platform())

/**
 *
 * @param {string} filename
 */
const createStubFile = async (filename) => {
  const filesize = faker.number.float({ min: 1, max: 10, fractionDigits: 2 })
  if (os.platform() === 'win32') {
    await execa`fsutil file createnew temp/${filename} ${filesize * 1000000}`
  } else {
    await execa`dd if=/dev/urandom of=./temp/${filename} bs=${filesize * 1000000} count=1`
  }
}

await pEachSeries(new Array(20).fill(0), async () => {
  const filename = faker.system.fileName()
  await createStubFile(filename)
  console.log('created file ', filename)
  await execa`corepack pnpm wrangler r2 object put poi-nightlies/${filename} --local --file ./temp/${filename}`
})

await pEachSeries(new Array(20).fill(0), async () => {
  const filename = faker.system.fileName()
  const path = faker.system.directoryPath()
  await createStubFile(filename)
  console.log('created file ', path, filename)
  await execa`corepack pnpm wrangler r2 object put poi-nightlies/${path}/${filename} --local --file ./temp/${filename}`
})
