# react-hot-export-loader

![version](https://img.shields.io/npm/v/react-hot-export-loader.svg)
![coveralls](https://img.shields.io/coveralls/github/ahonn/react-hot-export-loader.svg)
![travis](https://img.shields.io/travis/com/ahonn/react-hot-export-loader.svg)
![license](https://img.shields.io/github/license/ahonn/react-hot-export-loader.svg)

A Webpack loader that automatically inserts react-hot-loader code, Inspired by [react-hot-loader-loader](https://github.com/NoamELB/react-hot-loader-loader)

**Skip resources that are not exported to React components, do nothing when `process.env.NODE_ENV`**

## Install

```bash
npm install react-hot-loader --save-dev
npm install react-hot-export-loader --save-dev
```

## Getting started

1. Add `react-hot-loader/babel` to your `.babelrc`

```json
// .babelrc
{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "plugins": ["react-hot-loader/babel"]
}
```

2. Add `react-hot-export-loader` to your webpack configuration (must be before `babel-loader`)

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'react-hot-export-loader', // <== add this line
        ],
      },
    ],
  },
};
```

### How to run example
```bash
git clone git@github.com:ahonn/react-hot-export-loader.git
cd react-hot-export-loader/example
yarn install
yarn run dev
```

open localhost://8080 in your browser

## Options

### identifier

By default `react-hot-loader / root` exports the `hot` function as `__HOT__`, you can set the `identifier` option to modify the export name.

`react-hot-export-loader` will automatically inserts react-hot-loader code to the React component code like that:

```js
// before inserts
import React from 'react';

const App = () => {
  return (
    <h1>Hello World</h1>
  );
};

export default App

// after inserts
import 'react-hot-loader';
import { hot as __HOT__ } from 'react-hot-loader/root';
import React from 'react';

const App = () => {
  return (
    <h1>Hello World</h1>
  );
};

export default __HOT__(App);
```

### plugins
Array containing the babel plugins that you want to enable.

#### use `classProperties` babel plugin
- add `@babel/plugin-proposal-class-properties` to your

```json
// /babelrc
{
  "presets": ["@babel/preset-env", "@babel/preset-react"],
  "plugins": ["react-hot-loader/babel", "@babel/plugin-proposal-class-properties"]
}
```

- add `classProperties` to `react-hot-export-loader` plugins options

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'react-hot-export-loader',
            options: {
              plugins: ['classProperties'],
            },
          }
        ],
      },
    ],
  },
};
```

### filter
The function of filtering the resources you want to automatically add code

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'react-hot-export-loader',
            options: {
              filter: (ctx) => {
                const { resourcePath } = ctx;
                return resourcePath === '/path/to/any/what/you/want';
              };
            },
          }
        ],
      },
    ],
  },
};
```

## Licence
MIT
