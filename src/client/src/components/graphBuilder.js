import React, { useRef } from "react";
import Tree from "react-d3-tree";

import useMeasure from "react-use/lib/useMeasure";

import Box from "@material-ui/core/Box";
import Skeleton from "@material-ui/lab/Skeleton";

import { useD3jsFormatQuery } from "../hooks/api/useD3jsFormatQuery";

const GraphBuilder = ({ entryFile }) => {
    const { data: treeFormat } = useD3jsFormatQuery(entryFile.filepath);
	const [ targetRef, { width: svgWidth }] = useMeasure();

	console.log(treeFormat);
	return (
		entryFile &&
		entryFile.filepath && (
			<React.Fragment>
				{treeFormat ? (
					<Box
						mt={2}
						border={1}
						flex="1"
						borderRadius="borderRadius"
						ref={targetRef}
					>
						<Tree
							orientation="vertical"
							data={treeFormat}
							// shouldCollapseNeighborNodes="True"
							initialDepth={1}
							separation={{
								siblings: 1.3,
								nonSiblings: 2,
							}}
							translate={{
								x: svgWidth/2,
								y: 50,
                            }}
                            scaleExtent={
                                {
                                    min: 0.1,
                                    max: 1.5
                                }
                            }
							styles={{
								links: {
									stroke: "#F8F9FE",
									strokeWidth: 1,
								},
								nodes: {
									node: {
										circle: {
											stroke: "#F8F9FE",
											fill: "#fff",
										},
										name: {
											stroke: "none",
											fill: "#fff",
										},
									},
									leafNode: {
										circle: {
											stroke: "#F8F9FE",
											fill: "#303030",
										},
										name: {
											stroke: "none",
											fill: "#fff",
										},
									},
								},
							}}
						/>
					</Box>
				) : (
					<Skeleton variant="rect" width="100%" height="100%" />
				)}
			</React.Fragment>
		)
	);
};

export { GraphBuilder };
