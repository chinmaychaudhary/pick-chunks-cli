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

import { useChildrenChunksQuery } from "../hooks/api/useChildrenChunksQuery";
import { useAllDescendantChunksQuery } from "../hooks/api/useAllDescendantsChunksQuery";

const useStyles = makeStyles((theme) => ({
	rootContainer: {
		cursor: (props) => (props.disabled ? "not-allowed" : "default"),
	},
	container: {
		pointerEvents: (props) => (props.disabled ? "none" : "all"),
	},
	listRoot: {
		backgroundColor: theme.palette.background.paper,
	},
}));

const ChunksPicker = ({ entryFile }) => {
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

	const handleChunkToggle = useCallback(
		(e) => {
			e.stopPropagation();
			const { filepath, chunkName, checked } = e.currentTarget.dataset;
			const metaKey = true;
			if (metaKey) {
				setProcessing(true);
			}
			const nextChunks = new Set([...selectedChunks]);
			if (checked === "1") {
				if (metaKey) {
					loadAllDescendantChunks(filepath).then((descChunks) => {
						[...descChunks, { chunkName }].forEach(({ chunkName: cName }) => {
							nextChunks.delete(cName);
						});
						setSelectedChunks(nextChunks);
						setProcessing(false);
					});
				} else {
					nextChunks.delete(chunkName);
					setSelectedChunks(nextChunks);
					setProcessing(false);
				}
			} else {
				if (metaKey) {
					loadAllDescendantChunks(filepath).then((descChunks) => {
						[...descChunks, { chunkName }].forEach(({ chunkName: cName }) => {
							nextChunks.add(cName);
						});
						setSelectedChunks(nextChunks);
						setProcessing(false);
					});
				} else {
					nextChunks.add(chunkName);
					setSelectedChunks(nextChunks);
					setProcessing(false);
				}
			}
		},
		[selectedChunks]
	);

	const handleChunkEnter = useCallback((e) => {
		const { filepath, chunkName } = e.currentTarget.dataset;
		setCrumbs((prevCrumbs) => prevCrumbs.concat({ filepath, chunkName }));
	}, []);

	useEffect(() => {
		setCrumbs([{ filepath: entryFile.filepath, chunkName: "entry" }]);
		setSelectedChunks(new Set());
	}, [entryFile]);

	return (
		<Box className={classes.rootContainer} disabled={processing}>
			<Box className={classes.container} disabled={processing}>
				<Breadcrumbs aria-label="breadcrumb">
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
					style={{ marginBottom: "20px" }}
					label="Search Chunks"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
				/>
				<List dense className={classes.listRoot}>
					{filteredChunks?.map(({ filepath, chunkName }) => {
						return (
							<ListItem
								key={filepath}
								button
								data-chunk-name={chunkName}
								data-filepath={filepath}
								onClick={handleChunkEnter}
								disabled={processing}
							>
								<ListItemText id={chunkName} primary={chunkName} />
								<ListItemSecondaryAction>
									<Checkbox
										edge="end"
										inputProps={{
											"aria-labelledby": chunkName,
											"data-checked": selectedChunks.has(chunkName) ? "1" : "0",
											"data-chunk-name": chunkName,
											"data-filepath": filepath,
										}}
										onChange={handleChunkToggle}
										checked={selectedChunks.has(chunkName)}
										disabled={processing}
									/>
								</ListItemSecondaryAction>
							</ListItem>
						);
					})}
				</List>
			</Box>
		</Box>
	);
};

export { ChunksPicker };
