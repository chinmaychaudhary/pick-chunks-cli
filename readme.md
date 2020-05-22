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
    $ pick-chunks-cli

	Options
		--srcEntry  path to entry file
		--srcContext path to src directory
		--pickEntry path to the file from which you want to start picking
		--force force compute dependency graph again

	Examples
	  $ pick-chunks-cli --srcEntry=path/to/my/entry/file.js --srcContext=path/to/src/dir/
```

## Problem Statement
In huge web-apps the bundling can take forever even in the development mode. To improve the recompilation time, we can choose the chunks we want to build. This project aims at solving the problem of choosing chunks.