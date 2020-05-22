# pick-chunks

> Created using [create-ink-app](https://github.com/vadimdemedes/create-ink-app)


## Install

```bash
$ npm install --global pick-chunks-cli
```


## CLI

```
$ pick-chunks-cli --help

  Usage
    $ pick-chunks

  Options
    --entry  Your entry file
    --srcContext path to src directory

  Examples
    $ pick-chunks-cli --entry=my-entry.js --srcContext=./example-code/
```

## Problem Statement
In huge web-apps the bundling can take forever even in the development mode. To improve the recompilation time, we can choose the chunks we want to build. This project aims at solving the problem of picking chunks.