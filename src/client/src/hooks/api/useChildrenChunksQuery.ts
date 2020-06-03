import { useQuery } from "../core/useQuery";

const useChildrenChunksQuery = (filepath) =>
	useQuery({
		shouldFetch: !!filepath,
		url: `/api/children-chunks?fp=${filepath}`,
		method: "GET",
		payload: null,
	});

export { useChildrenChunksQuery };
