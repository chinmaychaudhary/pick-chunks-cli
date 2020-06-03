import { useQuery as baseUseQuery } from "react-query";

function queryFn(url, method, payload) {
	return fetch( url, {
		method,
		//@ts-ignore
		body: payload ? JSON.stringify(payload) : null,
	}).then((r) => r.json());
}

const useQuery = ({ shouldFetch = true, url, method, payload }) =>
	baseUseQuery({
		queryKey: shouldFetch && [url, method, payload],
		queryFn,
	});

export { useQuery };
