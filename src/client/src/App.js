import React from "react";
import { useInitialiseGraph } from "./hooks/api/useInitialiseGraph";
import "./App.css";

import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/lab/Skeleton";

import { EntryFilePicker } from "./components/EntryFilePicker";

function App() {
	const loading = useInitialiseGraph();
	return (
		<div className="App">
			{loading ? (
				<Typography component="div" variant="h4">
					<Skeleton />
				</Typography>
			) : (
				<EntryFilePicker />
			)}
		</div>
	);
}

export default App;
