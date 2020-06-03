const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");
const { getFilePath, getChunkNameFromArgument, isJsFile } = require("./utils");
const _once = require("lodash/once");

const parseCache = new Map();

function requireUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

const getFileInfoMap = _once(() => {
	const mp = requireUncached("../../file-info-data.json");
	return mp[process.env.srcEntry];
});

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
	if (process.env.shouldGenerateGraph === "1") {
		const fileInfoMap = getFileInfoMap();
		let ans = fileInfoMap[filepath];
		if (ans) {
			return ans;
		}
		const adpFp = getFilePath(path.parse(filepath).dir, srcContext, filepath);
		ans = fileInfoMap[adpFp];
		fileInfoMap[filepath] = ans;
		if (!ans) {
			console.log("missing", adpFp, filepath);
		}
		return ans;
	}

	const adpFp = getFilePath(path.parse(filepath).dir, srcContext, filepath);
	const memoAns = parseCache.get(adpFp);
	if (memoAns) {
		return memoAns;
	}

	const dir = path.parse(adpFp).dir;
	const fileContent = readFileContent(adpFp);
	const staticImports = [];
	let dynamicImports = new Map();
	let ast;

	try {
		ast = parser.parse(fileContent, {
			sourceType: "module",
			plugins: ["jsx", "typescript", "classProperties", "exportDefaultFrom"],
		});
	} catch (e) {
		console.log(adpFp);
		debugger;
	}

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
		ExportNamedDeclaration(astPath) {
			const exportNode = astPath.node;
			if (exportNode.source != null) {
				const p = exportNode.source.value;
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
			}
		},
	});

	dynamicImports = [...dynamicImports.values()];
	const ans = { staticImports, dynamicImports };
	parseCache.set(adpFp, ans);
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
