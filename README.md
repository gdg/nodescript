NodeScript - JavaScript without the Variable Declarations and Semicolons

**In**

```js
// script.ns

x = 10
y = 20

[x, y] = [y, x]
```

**Out**

```js
// script.js

let x = 10;
let y = 20;

[x, y] = [y, x];
```
