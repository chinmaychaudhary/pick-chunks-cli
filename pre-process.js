"use strict";

const fs = require("fs");
const path = require("path");

const {
	getDynamicImports,
	getParseCache,
} = require("./src/get-dynamic-imports");

function work({ entry, srcContext }) {
	getDynamicImports(entry, srcContext, true);
	const mp = getParseCache();
	const obj = {};

	console.log("making pojo");
	for (let pc of mp) {
		obj[pc[0]] = pc[1];
	}

	fs.writeFileSync(
		path.resolve(__dirname, "file-info-data.json"),
		JSON.stringify(obj)
	);
}

module.exports = work;
