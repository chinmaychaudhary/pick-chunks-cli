'use strict';
const React = require('react');
const { useState, useMemo, useContext, useRef } = require('react');
const PropTypes = require('prop-types');
const { Text, Color, Box, AppContext, useInput } = require('ink');
const { getDynamicImports } = require('./get-dynamic-imports');
const path = require('path');

const ENTRY = path.resolve(process.cwd(), 'code/my-entry.js');

const App = ({ entry }) => {
	const [current, setCurrent] = useState({ filepath: entry, chunkName: '' });
	const [cursor, setCursor] = useState(0);
	const dynamicImports = useMemo(() => getDynamicImports(current.filepath), [
		current.filepath,
	]);
	const [selectedChunks, setSelectedChunks] = useState(new Set());
	const size = dynamicImports.length;
	const stack = useRef([]);

	const { exit } = useContext(AppContext);

	useInput((input, key) => {
		if (input === 'q') {
			exit();
		}

		if (input === 'p') {
			const di = getDynamicImports(dynamicImports[cursor].filepath, true).map(
				(it) => it.chunkName
			);
			setSelectedChunks(
				(sc) => new Set([...sc, dynamicImports[cursor].chunkName, ...di])
			);
		}

		if (input === 'd') {
			const di = getDynamicImports(dynamicImports[cursor].filepath, true).map(
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
						'Press `p` to pick',
						'Press `d` to drop',
						'Press `enter` to dig in',
						'Press <- to go back',
					].join('\n')}
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
								{`${selectedChunks.has(chunkName) ? '+' : '-'} ${chunkName}`}
							</Color>
						</Text>
					);
				})}
			</Box>

			{!!selectedChunks.size && (
				<Box flexDirection="column" paddingTop={2}>
					<Text>Selected Chunks:</Text>
					<Box flexDirection="column">
						<Text>{[...selectedChunks].join(',')}</Text>
					</Box>
				</Box>
			)}
		</>
	);
};

App.propTypes = {
	entry: PropTypes.string,
};

App.defaultProps = {
	entry: ENTRY,
};

module.exports = App;
