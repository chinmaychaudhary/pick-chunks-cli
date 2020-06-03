import React from "react";
import useLocalStorage from "react-use/lib/useLocalStorage";

import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";
import Divider from "@material-ui/core/Divider";

import { useInitialiseGraph } from "./hooks/api/useInitialiseGraph";

import { EntryFilePicker } from "./components/EntryFilePicker";
import { ChunksPicker } from "./components/ChunksPicker";

import "./App.css";

function App() {
	const loading = useInitialiseGraph();
	const [entryFile, setEntryFile] = useLocalStorage("pick-entry", {
		filepath: "",
		name: "",
	});
	return (
		<div className="App">
			{loading ? (
				<Typography component="div" variant="h4">
					<Skeleton />
				</Typography>
			) : (
				<>
					<EntryFilePicker
						entryFile={entryFile}
						onEntryFileChange={setEntryFile}
					/>
					<Divider style={{ margin: "80px 0" }} />
					{entryFile.filepath && <ChunksPicker entryFile={entryFile} />}
				</>
			)}
		</div>
	);
}

export default App;
