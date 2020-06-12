var express = require("express");
var router = express.Router();
const path = require("path");
const { getDynamicImports } = require("./get-dynamic-imports");
const Fuse = require("fuse.js");

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
		console.log("generating graph....");
		const work = require("./pre-process");
		work({ entry: process.env.srcEntry, srcContext: process.env.srcContext });
		process.env.shouldGenerateGraph = "0";
	}
}

function createTreeFormat(entryFile, isNodeDone = new Map()){
    isNodeDone.set(entryFile.filepath, true);
    const tmpObj = {};
    tmpObj["name"] = entryFile.chunkName;
    tmpObj["children"] = [];
    const childrenChunks = getChunks(entryFile.filepath);
    childrenChunks.forEach((child) => {
        if (!isNodeDone.has(child.filepath)) {
            tmpObj["children"].push(createTreeFormat(child, isNodeDone));
        } else {
            tmpObj["children"].push({
                name: child.chunkName,
                children: [],
                repeated: true,
            });
        }
    });
    return tmpObj;
};

function initialiseGraph(req, res) {
	generateGraph();
	res.sendStatus(204);
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

function getD3jsFormat(req, res){
	generateGraph();
	const d3jsFormatData = createTreeFormat({
		filepath: req.query.fp,
		chunkName: path.basename(req.query.fp, ".js"),
	});
	res.send(JSON.stringify(d3jsFormatData));
}

const _once = require("lodash/once");

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

const getSearcher = _once(() => {
	const mp = requireUncached("../../file-info-data.json");
	const srcContext = path.resolve(process.cwd(), process.env.srcContext);
	const list = Object.keys(mp[process.env.srcEntry]).map((filename) => ({
		filepath: filename,
		name: filename.replace(srcContext, ""),
	}));
	const options = {
		keys: ["name"],
		includeMatches: true,
	};
	const myIndex = Fuse.createIndex(options.keys, list);
	return new Fuse(list, options, myIndex);
});

function searchFiles(req, res) {
	const searcher = getSearcher();
	res.send(
		JSON.stringify(
			searcher
				.search(req.query.keyword)
				.slice(0, 20)
				.map(({ item, matches }) => ({ ...item, matches }))
		)
	);
}

router.get("/init-graph", initialiseGraph);

router.get("/children-chunks", getChildrenChunks);

router.get("/all-descendant-chunks", getAllDescendantChunks);

router.get("/search-files", searchFiles);

router.get("/d3js-format", getD3jsFormat);

module.exports = router;
