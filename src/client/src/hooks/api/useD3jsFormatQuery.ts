import { useQuery } from "../core/useQuery";

const useD3jsFormatQuery = (filepath) =>
	useQuery({
		shouldFetch: !!filepath,
		url: `/api/d3js-format?fp=${filepath}`,
		method: "GET",
		payload: null,
	});

export { useD3jsFormatQuery };