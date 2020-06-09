import { useQuery } from "../core/useQuery";

const useFileSearchQuery = (keyword: string) =>
	useQuery({
		shouldFetch: !!keyword,
		url: `/api/search-files?keyword=${keyword}`,
		method: "GET",
		payload: null,
	});

export { useFileSearchQuery };
