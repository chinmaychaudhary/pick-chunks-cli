import { useQuery as baseUseQuery } from "react-query";

function queryFn(url, method, payload) {
	return fetch(url, {
		method,
		//@ts-ignore
		body: payload ? JSON.stringify(payload) : null,
	})
		.then((r) => r.json())
		.then((res) => {
			console.log(res);
			return res;
		});
}

const EMPTY_OBJ = {};

const useQuery = ({
	shouldFetch = true,
	url,
	method,
	payload,
	config = EMPTY_OBJ,
}) =>
	baseUseQuery({
		queryKey: shouldFetch && [url, method, payload],
		queryFn,
		config,
	});

export { useQuery };
