#!/usr/bin/env node
"use strict";
const React = require("react");
const importJsx = require("import-jsx");
const { render } = require("ink");
const meow = require("meow");

const cli = meow(`
	Usage
	  $ pick-chunks-cli

	Options
		--srcEntry  path to entry file
		--srcContext path to src directory
		--pickEntry path to the file from which you want to start picking
		--force force compute dependency graph again

	Examples
	  $ pick-chunks-cli --srcEntry=path/to/my/entry/file.js --srcContext=path/to/src/dir/
`);
const entry = cli.flags.srcEntry;
process.env.srcEntry = entry;

try {
	const fileInfoMap = require("./file-info-data.json");
	if (!fileInfoMap[entry] || cli.flags.force) {
		throw "lol";
	}
} catch (e) {
	console.log("computing dependency graph...");
	process.env.preProcessDone = "0";
	const work = require("./pre-process");
	work({ entry, srcContext: cli.flags.srcContext });
	console.log("pre processing done!");
}

process.env.preProcessDone = "1";
const ui = importJsx("./ChooseDynamicImports");
render(
	React.createElement(ui, {
		...cli.flags,
		entry: cli.flags.pickEntry || cli.flags.srcEntry,
	})
);
