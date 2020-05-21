const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");
const { getFilePath, getChunkNameFromArgument, isJsFile } = require("./utils");
const _once = require('lodash/once');

const parseCache = new Map();

const getFileInfoMap = _once(() => require('../file-info-data.json'));

function readFileContent(filepath) {
	try {
		const fileContent = fs.readFileSync(filepath, { encoding: "utf-8" });
		return fileContent;
	} catch (e) {
		console.log(filepath);
		debugger;
	}
}

function parseFile(filepath, srcContext) {
	if (process.env.postProcess === '1') {
		const fileInfoMap = getFileInfoMap();
		const ans = fileInfoMap[filepath];
		if(!ans){
			console.log('missing', filepath);
		}
		return ans;
	}

	const memoAns = parseCache.get(filepath);
	if (memoAns) {
		return memoAns;
	}

	const fileContent = readFileContent(filepath);
	const staticImports = [];
	let dynamicImports = new Map();
	let ast;

	try {
		ast = parser.parse(fileContent, {
			sourceType: "module",
			plugins: ["jsx", "typescript", "classProperties", "exportDefaultFrom"],
		});
	} catch (e) {
		console.log(filepath);
		debugger;
	}

	const dir = path.parse(filepath).dir;

	traverse(ast, {
		ImportDeclaration(astPath) {
			const p = astPath.node.source.value;
			if (!isJsFile(p)) {
				return;
			}
			const fp = getFilePath(dir, srcContext, p);
			if (fp) {
				if (typeof fp !== "string") {
					debugger;
				}
				staticImports.push(fp);
			}
		},
		CallExpression(astPath) {
			const callExpNode = astPath.node;
			if (callExpNode.callee.type === "Import") {
				const arg = callExpNode.arguments[0];
				if (!isJsFile(arg.value)) {
					return;
				}
				const fp = getFilePath(dir, srcContext, arg.value);
				const cName = getChunkNameFromArgument(arg);
				if (typeof fp !== "string") {
					debugger;
				}
				if (cName) {
					dynamicImports.set(cName, { filepath: fp, chunkName: cName });
				}
			}
		},
	});

	dynamicImports = [...dynamicImports.values()];
	const ans = { staticImports, dynamicImports };
	parseCache.set(filepath, ans);
	return ans;
}

function getDynamicImports(
	filepath,
	srcContext,
	shouldDigDynamicImports,
	ans = new Map(),
	visited = {}
) {
	visited[filepath] = true;
	const { staticImports, dynamicImports } = parseFile(filepath, srcContext);
	const neighbours = shouldDigDynamicImports
		? staticImports.concat(dynamicImports.map((imp) => imp.filepath))
		: staticImports;

	dynamicImports.forEach((di) => {
		ans.set(di.chunkName, di);
	});

	neighbours
		.filter((neighbour) => !visited[neighbour])
		.forEach((neighbour) => {
			getDynamicImports(
				neighbour,
				srcContext,
				shouldDigDynamicImports,
				ans,
				visited
			);
		});

	return ans;
}

function getParseCache() {
	return parseCache;
}

exports.getDynamicImports = getDynamicImports;
exports.getParseCache = getParseCache;
