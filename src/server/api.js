var express = require("express");
var router = express.Router();
const path = require("path");
const { getDynamicImports } = require("./get-dynamic-imports");

function transformMapToArr(mp) {
	return [...mp.values()];
}

function getChunks(fp, shouldDig) {
	return transformMapToArr(
		getDynamicImports(fp, process.env.srcContext, shouldDig)
	);
}

function generateGraph() {
	if (process.env.shouldGenerateGraph === "1") {
		const work = require("./pre-process");
		work({ entry: process.env.srcEntry, srcContext: process.env.srcContext });
		process.env.shouldGenerateGraph = "0";
	}
}

function initialiseGraph(req, res) {
	generateGraph();
	res.send();
}

function getChildrenChunks(req, res) {
	generateGraph();
	const chunks = getChunks(req.query.fp);
	res.send(JSON.stringify(chunks));
}

function getAllDescendantChunks(req, res) {
	generateGraph();
	const chunks = getChunks(req.query.fp, true);
	res.send(JSON.stringify(chunks));
}

const _once = require("lodash/once");
const FuzzySearch = require("fuzzy-search");

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

const getFilenames = _once(() => {
	const mp = requireUncached("../../file-info-data.json");
	const srcContext = path.resolve(process.cwd(), process.env.srcContext);
	return Object.keys(mp[process.env.srcEntry]).map((filename) => ({
		filepath: filename,
		name: filename.replace(srcContext, ""),
	}));
});

function searchFiles(req, res) {
	const searcher = new FuzzySearch(getFilenames(), ['name'], { sort: true });
	res.send(JSON.stringify(searcher.search(req.query.keyword).slice(0, 20)));
}

router.get("/init-graph", initialiseGraph);

router.get("/children-chunks", getChildrenChunks);

router.get("/all-descendant-chunks", getAllDescendantChunks);

router.get("/search-files", searchFiles);

module.exports = router;
