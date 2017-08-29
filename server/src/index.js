'use strict'
import noble from 'noble'

noble.on('stateChange', (state) => {
    if (state == 'poweredOn') {
        noble.startScanning([], true)
    }
})

import pkg from '../package.json'
import app from './server'

console.log(pkg.description)
console.log(`Version: ${pkg.version}`)
console.log(`Author: ${pkg.author}`)
console.log(`Licence: ${pkg.license}`)
console.log(`Repository: ${pkg.homepage}`)
