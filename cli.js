#!/usr/bin/env node
"use strict";
const React = require("react");
const importJsx = require("import-jsx");
const { render } = require("ink");
const meow = require("meow");

const cli = meow(`
	Usage
	  $ ast

	Options
		--name  Your name

	Examples
	  $ ast --name=Jane
	  Hello, Jane
`);

if (cli.flags.generate) {
	console.log("pre processing...");
	process.env.postProcess = '0';
	const work = require("./pre-process");
	work({ entry: cli.flags.entry, srcContext: cli.flags.context });
	console.log("pre processing done!");
}
process.env.postProcess = '1';
const ui = importJsx("./ChooseDynamicImports");
render(React.createElement(ui, cli.flags));
