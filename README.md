## NodeScript - JavaScript without the Variable Declarations and Semicolons

<p>
  <img src="https://cloud.githubusercontent.com/assets/1466111/23102658/ed2d84da-f6b5-11e6-9ca9-6555dac14975.gif" width="150%" height="150%" alt="NodeScript"/>
</p>

### Installation

```
$ npm install -g nodescript
```
### Usage

```
$ nodescript [options] [script.ns] [arguments]
```

### Options

```
-e, --eval          evaluate string
-p, --print         print compiled file
-o, --output        compile input file/directory into output file/directory
-w, --watch         watch file/directory for changes

-h, --help          print help message
-V, --version       print version number
```

### Examples
```
# Open REPL (WIP)
$ nodescript

# Execute script.ns (WIP)
$ nodescript script.ns

# Print compiled script.ns (WIP)
$ nodescript --print script.ns

# Compile script.ns to script.js and watch for changes
$ nodescript --watch script.ns --output script.js

# Compile src directory to lib directory and watch for changes
$ nodescript --watch src --output lib
```

### Supported Operating Systems

- Linux
- ~~macOS~~ (WIP)
- ~~Windows~~ (WIP)
