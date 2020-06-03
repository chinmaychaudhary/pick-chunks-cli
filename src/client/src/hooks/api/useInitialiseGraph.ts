import { useQuery } from "../core/useQuery";
import { useEffect, useState } from "react";

const useInitialiseGraph = () => {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/init-graph").then(() => setLoading(false));
	}, []);

	return loading;
};

export { useInitialiseGraph };
