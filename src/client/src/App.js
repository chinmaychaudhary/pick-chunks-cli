import React from "react";
import useLocalStorage from "react-use/lib/useLocalStorage";

import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";

import { useInitialiseGraph } from "./hooks/api/useInitialiseGraph";

import { EntryFilePicker } from "./components/EntryFilePicker";
import { ChunksPicker } from "./components/ChunksPicker";

import "./App.css";

const useStyles = makeStyles((theme) => ({
	flexNone: { flex: "0 0 auto" },
	flex1: { flex: "1", minHeight: "0" },
}));

function App() {
	const classes = useStyles();
	const loading = useInitialiseGraph();
	const [entryFile, setEntryFile] = useLocalStorage("pick-entry", {
		filepath: "",
		name: "",
	});
	return (
		<Box padding={5} display="flex" flexDirection="column" height="100%">
			{loading ? (
				<Typography component="div" variant="h4">
					<Skeleton />
				</Typography>
			) : (
				<>
					<EntryFilePicker
						className={classes.flexNone}
						entryFile={entryFile}
						onEntryFileChange={setEntryFile}
					/>
					<ChunksPicker className={classes.flex1} entryFile={entryFile} />
				</>
			)}
		</Box>
	);
}

export default App;
