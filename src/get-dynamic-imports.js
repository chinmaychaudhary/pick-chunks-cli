const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");
const { getFilePath, getChunkNameFromArgument } = require("./utils");

const parseCache = new Map();
function parseFile(filepath) {
	const memoAns = parseCache.get(filepath);
	if (memoAns) {
		return memoAns;
	}

	const fileContent = fs.readFileSync(filepath, { encoding: "utf-8" });
	const staticImports = [];
	let dynamicImports = new Map();
	let ast;

	try {
		ast = parser.parse(fileContent, {
			sourceType: "module",
			plugins: ["jsx", "typescript", "classProperties"],
		});
	} catch (e) {
		console.log(filepath);
		debugger;
	}

	const dir = path.parse(filepath).dir;

	traverse(ast, {
		ImportDeclaration(astPath) {
			const fp = getFilePath(dir, astPath.node.source.value);
			if (fp) {
				staticImports.push(fp);
			}
		},
		CallExpression(astPath) {
			const callExpNode = astPath.node;
			if (callExpNode.callee.type === "Import") {
				const arg = callExpNode.arguments[0];
				const fp = getFilePath(dir, arg.value);
				const cName = getChunkNameFromArgument(arg);
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
	shouldDigDynamicImports,
	ans = new Map(),
	visited = {}
) {
	visited[filepath] = true;
	const { staticImports, dynamicImports } = parseFile(filepath);
	const neighbours = shouldDigDynamicImports
		? staticImports.concat(dynamicImports.map((imp) => imp.filepath))
		: staticImports;

	dynamicImports.forEach((di) => {
		ans.set(di.chunkName, di);
	});

	neighbours
		.filter((neighbour) => !visited[neighbour])
		.forEach((neighbour) => {
			getDynamicImports(neighbour, shouldDigDynamicImports, ans, visited);
		});

	return ans;
}

exports.getDynamicImports = getDynamicImports;
