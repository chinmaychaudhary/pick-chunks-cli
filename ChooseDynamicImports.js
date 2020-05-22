"use strict";

const path = require("path");
const React = require("react");
const { useState, useMemo, useContext, useRef, useCallback } = require("react");
const PropTypes = require("prop-types");
const { Text, Color, Box, AppContext, useInput } = require("ink");
const { getDynamicImports } = require("./src/get-dynamic-imports");

function transformMapToArr(mp) {
	return [...mp.values()];
}

function getChunks(fp, srcContext, shouldDig) {
	return transformMapToArr(getDynamicImports(fp, srcContext, shouldDig));
}

const App = ({ entry, srcContext }) => {
	const [current, setCurrent] = useState({ filepath: entry, chunkName: "" });
	const [cursor, setCursor] = useState(0);
	const getFileChunks = useCallback(
		(fp, shouldDig) => {
			return getChunks(fp, srcContext, shouldDig);
		},
		[srcContext]
	);
	const dynamicImports = useMemo(() => getFileChunks(current.filepath), [
		current.filepath,
	]);
	const [selectedChunks, setSelectedChunks] = useState(new Set());
	const size = dynamicImports.length;
	const stack = useRef([]);

	const { exit } = useContext(AppContext);

	useInput((input, key) => {
		if (input === "q") {
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
						"Press `s` to select node",
						"Press `x` to delete a node",
						"Press `p` to pick the entire tree",
						"Press `d` to drop the entire tree",
						"Press `enter` to dig in",
						"Press <- to go back",
					].join("\n")}
				</Text>
			</Box>
			<Box flexDirection="column">
				{dynamicImports.map(({ chunkName, filepath }, index) => {
					return (
						<Text key={chunkName}>
							<Color
								cyanBright={cursor === index}
								green={cursor !== index && selectedChunks.has(chunkName)}
							>
								{`${selectedChunks.has(chunkName) ? "+" : "-"} ${chunkName}`}
							</Color>
						</Text>
					);
				})}
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

App.defaultProps = {
};

module.exports = App;
