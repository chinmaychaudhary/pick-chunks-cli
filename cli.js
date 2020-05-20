#!/usr/bin/env node
'use strict';
const React = require('react');
const importJsx = require('import-jsx');
const {render} = require('ink');
const meow = require('meow');

const ui = importJsx('./ChooseDynamicImports');

const cli = meow(`
	Usage
	  $ ast

	Options
		--name  Your name

	Examples
	  $ ast --name=Jane
	  Hello, Jane
`);

render(React.createElement(ui, cli.flags));
