#!/usr/bin/env node

let babylon = require('nodescript-babylon')
let babel = require('babel-core')
let fs = require('fs')


let fileName = process.argv[2]

fs.readFile(fileName,  'utf8', function (err, data) {
    if (err) { throw err }

    let ast = babylon.parse(data, {plugins: ['si']}) // si: semicolon insertion
    let newData = babel.transformFromAst(ast, data, {plugins: ['vdi']}).code // vdi: variable-declaration insertion
    console.log(newData)
})
