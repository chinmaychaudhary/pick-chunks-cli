"use strict";

const React = require("react");
const { useState, useMemo, useContext, useRef, useCallback } = require("react");
const PropTypes = require("prop-types");
const { Text, Color, Box, AppContext, useInput } = require("ink");
const { getDynamicImports } = require("./src/get-dynamic-imports");

const FuzzySearch = require("fuzzy-search");
const TextInput = require("ink-text-input").default;

function transformMapToArr(mp) {
	return [...mp.values()];
}

function getChunks(fp, srcContext, shouldDig) {
	return transformMapToArr(getDynamicImports(fp, srcContext, shouldDig));
}

const regex = /[a-zA-Z]/;

function sanitizeInput(inp) {
	return [...inp].filter((char) => regex.test(char)).join("");
}

const App = ({ entry, srcContext }) => {
	const [current, setCurrent] = useState({ filepath: entry, chunkName: "" });
	const [cursor, setCursor] = useState(0);
	const [mode, setMode] = useState("VIEW");
	const [search, setSearch] = useState("");
	const getFileChunks = useCallback(
		(fp, shouldDig) => {
			return getChunks(fp, srcContext, shouldDig);
		},
		[srcContext]
	);
	const dynamicImports = useMemo(() => getFileChunks(current.filepath), [
		current.filepath,
	]);
	const fuzSearch = useMemo(() => {
		return new FuzzySearch(dynamicImports, ["chunkName"]);
	}, [dynamicImports, mode]);
	const [selectedChunks, setSelectedChunks] = useState(new Set());
	const listToRender =
		mode === "SEARCH" ? fuzSearch.search(search) : dynamicImports;

	const size =
		mode === "SEARCH" ? listToRender.length + 1 : listToRender.length;
	const stack = useRef([]);

	const { exit } = useContext(AppContext);

	useInput((input, key) => {
		if (input === ":") {
			setMode("SEARCH");
			setCursor(0);
			return;
		}

		if (mode === "SEARCH") {
			if (key.escape) {
				setCursor(0);
				setSearch("");
				setMode("VIEW");
				return;
			}

			if (key.leftArrow || key.return || key.rightArrow) {
				return;
			}

			if (key.upArrow) {
				setCursor((curr) => (curr - 1 + size) % size);
			}

			if (key.downArrow) {
				setCursor((curr) => (curr + 1) % size);
			}

			if (cursor !== 0) {
				const actualCursor = cursor - 1;
				if (input === "s") {
					setSelectedChunks(
						(sc) => new Set([...sc, listToRender[actualCursor].chunkName])
					);
				}

				if (input === "x") {
					setSelectedChunks((sc) => {
						sc.delete(listToRender[actualCursor].chunkName);
						return new Set([...sc]);
					});
				}

				if (input === "p") {
					const di = getFileChunks(
						listToRender[actualCursor].filepath,
						true
					).map((it) => it.chunkName);
					setSelectedChunks(
						(sc) =>
							new Set([...sc, listToRender[actualCursor].chunkName, ...di])
					);
				}

				if (input === "d") {
					const di = getFileChunks(
						listToRender[actualCursor].filepath,
						true
					).map((it) => it.chunkName);
					setSelectedChunks((sc) => {
						[...di, listToRender[actualCursor].chunkName].forEach((c) => {
							sc.delete(c);
						});
						return new Set([...sc]);
					});
				}
			}

			return;
		}

		if (input === "q") {
			if (selectedChunks.size) {
				const clipboardy = require('clipboardy');
				const csv = [...selectedChunks].join(",");
				clipboardy.writeSync(csv);
				console.log("\n\n\n");
				console.log("Copied this:\n\n\n");
				console.log(csv);
				console.log("\n\n\n");
			}
			exit();
		}

		if (input === "s") {
			setSelectedChunks(
				(sc) => new Set([...sc, dynamicImports[cursor].chunkName])
			);
		}

		if (input === "x") {
			setSelectedChunks((sc) => {
				sc.delete(dynamicImports[cursor].chunkName);
				return new Set([...sc]);
			});
		}

		if (input === "p") {
			const di = getFileChunks(dynamicImports[cursor].filepath, true).map(
				(it) => it.chunkName
			);
			setSelectedChunks(
				(sc) => new Set([...sc, dynamicImports[cursor].chunkName, ...di])
			);
		}

		if (input === "d") {
			const di = getFileChunks(dynamicImports[cursor].filepath, true).map(
				(it) => it.chunkName
			);
			setSelectedChunks((sc) => {
				[...di, dynamicImports[cursor].chunkName].forEach((c) => {
					sc.delete(c);
				});
				return new Set([...sc]);
			});
		}

		if (key.leftArrow) {
			if (stack.current.length) {
				setCursor(0);
				setCurrent(stack.current.pop());
			}
		}

		if (key.upArrow) {
			setCursor((curr) => (curr - 1 + size) % size);
		}

		if (key.downArrow) {
			setCursor((curr) => (curr + 1) % size);
		}

		if (key.return || key.rightArrow) {
			stack.current.push(current);
			setCurrent(dynamicImports[cursor]);
			setCursor(0);
		}
	});

	return (
		<>
			<Box flexDirection="column" paddingTop={2} paddingBottom={2}>
				<Text>
					{[
						"Press `:` to enter in search mode",
						"Press `esc` to exit from search mode",
						"Press `s` to select node",
						"Press `x` to delete a node",
						"Press `p` to pick the entire tree",
						"Press `d` to drop the entire tree",
						"Press `enter` to dig in",
						"Press <- to go back",
						"Press `q` to exit",
					].join("\n")}
				</Text>
			</Box>
			{mode === "SEARCH" && (
				<Text>
					<Color cyanBright={cursor === 0}>Search for:</Color>
					<Color yellowBright>
						<TextInput
							value={search}
							onChange={(v) => {
								if (cursor === 0) {
									setSearch(sanitizeInput(v));
								}
							}}
						/>
					</Color>
				</Text>
			)}
			<Box flexDirection="column">
				{listToRender.map(({ chunkName, filepath }, index) => {
					const isFocused =
						mode === "SEARCH" ? index === cursor - 1 : index === cursor;
					return (
						<Text key={chunkName}>
							<Color
								cyanBright={isFocused}
								green={!isFocused && selectedChunks.has(chunkName)}
							>
								{`${selectedChunks.has(chunkName) ? "+" : "-"} ${chunkName}`}
							</Color>
						</Text>
					);
				})}
				{!listToRender.length && (
					<Text>
						<Color yellowBright>No chunks found!</Color>
					</Text>
				)}
			</Box>

			{!!selectedChunks.size && (
				<Box flexDirection="column" paddingTop={2}>
					<Text>Selected Chunks:</Text>
					<Box flexDirection="column">
						<Text>{[...selectedChunks].join(",")}</Text>
					</Box>
				</Box>
			)}
		</>
	);
};

App.propTypes = {
	entry: PropTypes.string,
	context: PropTypes.string,
};

App.defaultProps = {};

module.exports = App;
