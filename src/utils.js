const fs = require("fs");
const path = require("path");
const _get = require("lodash/get");

const extensions = [".js", ".jsx", ".ts", ".tsx"];

// same as webpack config context
const CONTEXT = process.env.myContext;

function getChunkNameFromArgument(arg) {
	const comment = _get(arg, "leadingComments[0].value");
	if (comment) {
		const res = comment.match(/webpackChunkName\s*:\s*"([^."].*)"/);
		return res ? res[1] : null;
	}
}

function getWithExt(pathResolveParams, mainFile) {
	let ans = path.resolve(...pathResolveParams, mainFile);
	if (fs.existsSync(ans)) {
		return ans;
	}
	for (ext of extensions) {
		const fp = path.resolve(...pathResolveParams, mainFile + ext);
		if (fs.existsSync(fp)) {
			return fp;
		}
	}
	return null;
}

function resolveWithPackageJson(fp, { context, dir }) {
	const pkgPath = context
		? path.resolve(process.cwd(), context, fp + "/package.json")
		: path.resolve(dir, fp + "/package.json");

	if (fs.existsSync(pkgPath)) {
		const mainFile = require(pkgPath).main;
		return context
			? getWithExt([process.cwd(), context, fp], mainFile)
			: getWithExt([dir, fp], mainFile);
	}

	return null;
}

function resolveWithExt(fp, ext, { context, dir }) {
	const fyle = context
		? path.resolve(process.cwd(), context, fp + ext)
		: path.resolve(dir, fp + ext);
	return fs.existsSync(fyle) ? fyle : null;
}

function resolveFilePathWithExts(filePath, opts) {
	for (ext of extensions) {
		const fp = resolveWithExt(filePath, ext, opts);
		if (fp) {
			return fp;
		}
	}
	return null;
}

function resolveWithIndexFile(fp, opts) {
	return resolveFilePathWithExts(fp + "/index", opts);
}

function resolveFilePath(fp, opts) {
	let ans = resolveFilePathWithExts(fp, opts);
	if (ans) {
		return ans;
	}
	ans = resolveWithPackageJson(fp, opts);
	if (ans) {
		return ans;
	}
	ans = resolveWithIndexFile(fp, opts);
	if (ans) {
		return ans;
	}
	return null;
}

function getFilePath(dir, filePath) {
	return filePath.startsWith(".")
		? resolveFilePath(filePath, { dir })
		: resolveFilePath(filePath, { context: CONTEXT });
}

exports.getChunkNameFromArgument = getChunkNameFromArgument;
exports.getFilePath = getFilePath;
