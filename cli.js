#!/usr/bin/env node
"use strict";
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

/*
const cli = {
	flags: { srcEntry: "space-app/client/index.js", srcContext: "./src/" },
};
*/
const entry = cli.flags.srcEntry;
process.env.srcEntry = entry;
process.env.pickEntry = cli.flags.pickEntry || cli.flags.srcEntry;
process.env.srcContext = cli.flags.srcContext;
process.env.shouldGenerateGraph = "0";

try {
	const fileInfoMap = require("./file-info-data.json");
	if (!fileInfoMap[entry] || cli.flags.force) {
		throw "lol";
	}
} catch (e) {
	process.env.shouldGenerateGraph = "1";
}

require("./src/server");
