import { useQuery } from "../core/useQuery";
import { useCallback } from "react";

const useAllDescendantChunksQuery = () => {
	const loadAllDescendantChunks = useCallback(
		(filepath) =>
			fetch(`/api/all-descendant-chunks?fp=${filepath}`).then((r) => r.json()),
		[]
	);

	return loadAllDescendantChunks;
};

export { useAllDescendantChunksQuery };
