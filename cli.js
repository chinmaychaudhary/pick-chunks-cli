#!/usr/bin/env node
"use strict";
const React = require("react");
const importJsx = require("import-jsx");
const { render } = require("ink");
const meow = require("meow");

const cli = meow(`
	Usage
	  $ pick-chunks

	Options
		--entry  path to entry file
		--srcContext path to src directory
		--force force compute dependency graph again

	Examples
	  $ pick-chunks --entry=path/to/my/entry/file.js --srcContext=path/to/src/dir/
`);
const entry = cli.flags.entry;
process.env.entry = entry;

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
render(React.createElement(ui, cli.flags));
