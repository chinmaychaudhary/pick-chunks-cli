import React, { useState } from "react";

import { ChunksPicker } from "./ChunksPicker";
import { GraphBuilder } from "./GraphBuilder";

const ChunkGraphToggler = ({ showGraph, entryFile, className }) => {
	const [selectedChunks, setSelectedChunks] = useState(new Set());
	return (
		<>
			{showGraph ? (
				<GraphBuilder entryFile={entryFile} />
			) : (
				<ChunksPicker
					className={className}
					entryFile={entryFile}
					setSelectedChunks={setSelectedChunks}
					selectedChunks={selectedChunks}
				/>
			)}
		</>
	);
};

export { ChunkGraphToggler };
