import React, { useState, useEffect, useCallback, useMemo } from "react";
import FuzzySearch from "fuzzy-search";
import { makeStyles } from "@material-ui/core/styles";

import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import Chip from "@material-ui/core/Chip";

import { useChildrenChunksQuery } from "../hooks/api/useChildrenChunksQuery";
import { useAllDescendantChunksQuery } from "../hooks/api/useAllDescendantsChunksQuery";

const useStyles = makeStyles((theme) => ({
	rootContainer: {
		cursor: (props) => (props.disabled ? "not-allowed" : "default"),
	},
	container: {
		pointerEvents: (props) => (props.disabled ? "none" : "all"),
	},
	output: {
		display: "flex",
	},
	listRoot: {
		height: "fit-content",
		backgroundColor: theme.palette.background.paper,
		flex: "0 0 25%",
	},
	selectedChunks: {
		"& > *": {
			margin: theme.spacing(0.5),
		},
	},
}));

const ChunksPicker = ({ entryFile, className }) => {
	const classes = useStyles();

	const loadAllDescendantChunks = useAllDescendantChunksQuery();

	const [crumbs, setCrumbs] = useState([
		{ filepath: entryFile.filepath, chunkName: "entry" },
	]);
	const handleCrumbClick = useCallback((e) => {
		e.preventDefault();
		const index = +e.currentTarget.dataset.index;
		setCrumbs((prevCrumbs) => [...prevCrumbs.slice(0, index + 1)]);
	}, []);

	const { data: childrenChunks, status } = useChildrenChunksQuery(
		crumbs[crumbs.length - 1].filepath
	);

	const [processing, setProcessing] = useState(false);

	const [keyword, setKeyword] = useState("");
	const [selectedChunks, setSelectedChunks] = useState(new Set());

	const fuzSearch = useMemo(() => {
		return new FuzzySearch(childrenChunks, ["chunkName"]);
	}, [childrenChunks]);

	const filteredChunks = useMemo(
		() => (keyword ? fuzSearch.search(keyword) : childrenChunks),
		[fuzSearch, keyword, childrenChunks]
	);

	const handleChunkEnter = useCallback((e) => {
		const { filepath, chunkName } = e.currentTarget.dataset;
		setCrumbs((prevCrumbs) => prevCrumbs.concat({ filepath, chunkName }));
		setKeyword("");
	}, []);

	const handleChunkDelete = useCallback((e) => {
		const chunkName = e.currentTarget.closest('[data-container="chunk"]')
			.dataset.chunkName;
		setSelectedChunks((prevChunks) => {
			prevChunks.delete(chunkName);
			return new Set([...prevChunks]);
		});
	}, []);

	const handleSingleChunkSelect = useCallback((chunkName) => {
		setSelectedChunks((prev) => new Set([...prev, chunkName]));
	}, []);

	const handleEntireSubGraphSelect = useCallback(
		(chunkName, filepath) => {
			const nextChunks = new Set([...selectedChunks]);
			setProcessing(true);
			loadAllDescendantChunks(filepath).then((descChunks) => {
				[...descChunks, { chunkName }].forEach(({ chunkName: cName }) => {
					nextChunks.add(cName);
				});
				setSelectedChunks(nextChunks);
				setProcessing(false);
			});
		},
		[selectedChunks]
	);

	const handleSingleChunkRemove = useCallback((chunkName) => {
		setSelectedChunks((prev) => {
			prev.delete(chunkName);
			return new Set([...prev]);
		});
	}, []);

	const handleEntireSubGraphRemove = useCallback(
		(chunkName, filepath) => {
			const nextChunks = new Set([...selectedChunks]);
			setProcessing(true);
			loadAllDescendantChunks(filepath).then((descChunks) => {
				[...descChunks, { chunkName }].forEach(({ chunkName: cName }) => {
					nextChunks.delete(cName);
				});
				setSelectedChunks(nextChunks);
				setProcessing(false);
			});
		},
		[selectedChunks]
	);

	const handleItemKeyDown = useCallback((e) => {
		const { filepath, chunkName } = e.currentTarget.dataset;
		switch (e.key) {
			case "s":
				return handleSingleChunkSelect(chunkName);
			case "x":
				return handleSingleChunkRemove(chunkName);
			case "p":
				return handleEntireSubGraphSelect(chunkName, filepath);
			case "d":
				return handleEntireSubGraphRemove(chunkName, filepath);
			default:
				return undefined;
		}
	}, []);

	const handleCheckboxToggle = useCallback((e) => {
		const { filepath, chunkName, checked } = e.currentTarget.dataset;
		debugger;
		if (checked === "0") {
			return e.metaKey
				? handleEntireSubGraphSelect(chunkName, filepath)
				: handleSingleChunkSelect(chunkName);
		}

		return e.metaKey
			? handleEntireSubGraphRemove(chunkName, filepath)
			: handleSingleChunkRemove(chunkName);
	}, []);

	useEffect(() => {
		setCrumbs([{ filepath: entryFile.filepath, chunkName: "entry" }]);
		setKeyword("");
	}, [entryFile]);

	return (
		(!!crumbs[crumbs.length - 1]?.filepath || !!selectedChunks.size) && (
			<Box mt={2} className={className} display="flex" flexDirection="column">
				<Box flex="0 0 auto">
					<Typography variant="h4" color="primary" gutterBottom>
						Pick Chunks
					</Typography>
				</Box>
				<Box
					display="flex"
					flex="1"
					minHeight={0}
					className={classes.rootContainer}
					disabled={processing}
				>
					<Box
						flex="1"
						minHeight={0}
						display="flex"
						flexDirection="column"
						className={classes.container}
						disabled={processing}
					>
						<Breadcrumbs
							aria-label="breadcrumb"
							flex="0 0 auto"
							style={{ marginBottom: "8px" }}
						>
							{crumbs
								.slice(0, crumbs.length - 1)
								.map(({ filepath, chunkName }, index) => (
									<Link
										key={filepath}
										color="inherit"
										href=""
										data-filepath={filepath}
										data-chunk-name={chunkName}
										onClick={handleCrumbClick}
										data-index={index}
									>
										{chunkName}
									</Link>
								))}
							<Typography color="textPrimary">
								{crumbs[crumbs.length - 1].chunkName}
							</Typography>
						</Breadcrumbs>
						<TextField
							flex="0 0 auto"
							style={{ marginBottom: "20px", width: "25%" }}
							label="Search Chunks"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
						/>
						<Box display="flex" flex="1" minHeight={0} overflow="auto">
							<List dense className={classes.listRoot}>
								{filteredChunks?.map(({ filepath, chunkName }) => {
									return (
										<ListItem
											key={chunkName}
											button
											data-checked={selectedChunks.has(chunkName) ? "1" : "0"}
											data-chunk-name={chunkName}
											data-filepath={filepath}
											onClick={handleChunkEnter}
											disabled={processing}
											onKeyDown={handleItemKeyDown}
											data-container="list-item"
										>
											<ListItemText id={chunkName} primary={chunkName} />
											<ListItemSecondaryAction>
												<Checkbox
													tabIndex={-1}
													edge="end"
													inputProps={{
														"aria-labelledby": chunkName,
														"data-checked": selectedChunks.has(chunkName)
															? "1"
															: "0",
														"data-chunk-name": chunkName,
														"data-filepath": filepath,
														onClick: handleCheckboxToggle,
													}}
													checked={selectedChunks.has(chunkName)}
												/>
											</ListItemSecondaryAction>
										</ListItem>
									);
								})}
							</List>
							<Box
								className={classes.selectedChunks}
								justifyContent="center"
								flexWrap="wrap"
								flex="1"
								borderRadius="borderRadius"
								// bgcolor="background.paper"
								borderColor="text.primary"
								border={1}
								mx={2}
								p={4}
								height="100%"
								position="sticky"
								top="0"
								overflow="auto"
							>
								{[...selectedChunks].map((chunk) => (
									<Chip
										key={chunk}
										label={chunk}
										onDelete={handleChunkDelete}
										variant="outlined"
										data-chunk-name={chunk}
										data-chip="1"
										data-container="chunk"
									/>
								))}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		)
	);
};

export { ChunksPicker };
