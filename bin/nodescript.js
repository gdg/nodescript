#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const babylon = require('nodescript-babylon')
const chokidar = require("chokidar")
const commander = require('commander')
const packageInfo = require('../package.json')
const outputFileSync = require('output-file-sync')

const vdi = __dirname === '/usr/lib/node_modules/nodescript/bin'
      ? path.join(__dirname, '../node_modules/babel-plugin-vdi')
      : path.join(__dirname, '../../node_modules/babel-plugin-vdi')


function exists(pathname) { return fs.existsSync(pathname) }


function isFile(pathname) {
    if (exists(pathname)) {
        return fs.statSync(pathname).isFile()
    }
}


function isDir(pathname) {
    if (exists(pathname)) {
        return fs.statSync(pathname).isDirectory()
    }
}


/* yield .ns files from directory */
function* traverse(pathname) {
    for (let name of fs.readdirSync(pathname)) {
        let subpath = path.join(pathname, name)

        if (isDir(subpath)) {
            yield* traverse(subpath)
        } else if (path.extname(subpath) === '.ns') {
            yield subpath
        }
    }
}


function parseArgs() {
    /* build '--help' information */
    commander
        .version(packageInfo.version)
        .usage('[options] [script.ns] [arguments]')
        .option('-e, --eval', 'evaluate string')
        .option('-p, --print', 'print compiled file')
        .option('-o, --output', 'compile input file/directory into output file/directory')
        .option('-w, --watch', 'watch file/directory for changes')

    /* add usage examples in '--help' information */
    commander.on('--help', function () {
        console.log('  Examples:')
        console.log('')
        console.log('    $ nodescript')
        console.log('    $ nodescript script.ns')
        console.log('    $ nodescript --print script.ns')
        console.log('    $ nodescript --watch script.ns --output script.js')
        console.log('    $ nodescript --watch src --output lib')
        console.log('')
    })

    commander.parse(process.argv)


    /* check for errors */
    let error = {
        name: 'NodeScriptError',
        message: ''
    }
    let pathnames = commander.args
    let input = pathnames[0]
    let output = pathnames[1]


    if (process.argv.length === 2) {
        error.message = 'REPL not implemented yet'
    } else if (process.argv.length === 3 && pathnames.length === 1) {
        error.message = `cannot execute '${input}'. Functionality not implemented yet`
    } else if (commander.eval) {
        error.message = '--eval not implemented yet'
    } else if (commander.print) {
        error.message = '--print not impleted yet'
    } else if (commander.watch && !commander.output) {
        error.message = '--watch requires --output'
    } else if (commander.output) {
        if (pathnames.length !== 2) {
            error.message = '--output requires 2 path names (input and output)'
        } else if (!exists(input)) {
            error.message = `'${input}' doesn't exist`
        } else if (isFile(input) && isDir(output)) {
            error.message = `'${output}' is not a file`
        } else if (isDir(input) && isFile(output)) {
            error.message = `'${output}' is not a directory`
        }
    }

    if (error.message) { throw error }

    return [input, output]
}


function compile(input, output) {
    try {
        if (isFile(input)) {
            let inputData = fs.readFileSync(input, "utf8")
            let inputAst = babylon.parse(inputData, {plugins: ['si'], sourceType: 'module'})     // semicolon insertion
            let outputData = babel.transformFromAst(inputAst, inputData, {plugins: [vdi]}).code  // variable-declaration insertion

            outputFileSync(output, outputData)
            fs.chmodSync(output, fs.statSync(input).mode)
            console.log(input, '->', output)
        } else { // input is a directory
            for (let filepath of traverse(input)) {
                let filepathOutput = path.join(output, path.relative(input, filepath))
                filepathOutput = filepathOutput.replace(/\.ns$/, '.js')

                compile(filepath, filepathOutput)
            }
        }
    } catch (e) {
        if (commander.watch) {
            console.error(e)
        } else {
            throw e
        }
    }
}


function compileOnChange(input, output) {
    /* build watcher */
    let watcher = chokidar.watch(input, {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 50,
            pollInterval: 10
        }
    })

    /* add event listeners for files */
    for (let event of ['add', 'change']) {
        watcher.on(event, function (filepath) {

            if (filepath === input) {
                compile(input, output)
            } else if (path.extname(filepath) === '.ns') {

                let filepathOutput = path.join(output, path.relative(input, filepath))
                filepathOutput = filepathOutput.replace(/\.ns$/, '.js')

                compile(filepath, filepathOutput)
            }
        })
    }
}


function main() {

    let [input, output] = parseArgs()

    compile(input, output)

    if (commander.watch) {
        compileOnChange(input, output)
    }
}


if (require.main === module) {
    main()
}
