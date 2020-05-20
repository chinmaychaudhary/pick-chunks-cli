# pick-chunks

> Created using [create-ink-app](https://github.com/vadimdemedes/create-ink-app)


## Install

```bash
$ npm install --global pick-chunks
```


## CLI

```
$ pick-chunks --help

  Usage
    $ pick-chunks

  Options
    --entry  Your entry file

  Examples
    $ pick-chunks --entry=code/my-entry.js
```

## Problem Statement
In huge web-apps the bundling can take forever even in the development mode. To improve the recompilation time, we can choose the chunks we want to build. This project aims at solving the problem of picking chunks.