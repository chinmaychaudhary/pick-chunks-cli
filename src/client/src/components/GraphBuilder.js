import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";

import useMeasure from "react-use/lib/useMeasure";

import Box from "@material-ui/core/Box";
import Skeleton from "@material-ui/lab/Skeleton";

import { useD3jsFormatQuery } from "../hooks/api/useD3jsFormatQuery";

const GraphBuilder = ({ entryFile, selectedChunks }) => {
	const { data: treeFormat } = useD3jsFormatQuery(entryFile.filepath);
	const [targetRef, { width: svgWidth }] = useMeasure();
	const selectFormat = (treeData) => {
		if (selectedChunks.has(treeData.name)) {
			treeData["nodeSvgShape"] = {
				shape: "circle",
				shapeProps: {
					stroke: "#00BBD3",
					fill: "#00BBD3",
					r: 11,
				},
			};
		} else {
			treeData["nodeSvgShape"] = {
				shape: "circle",
				shapeProps: {
					stroke: "#C7C7C7",
					fill: "#C7C7C7",
					r: 11,
				},
			};
		}
		if (treeData.name !== treeFormat.name) {
			treeData._collapsed = true;
		}
		treeData.children.forEach((child) => {
			selectFormat(child);
		});
		return treeData;
	};

	const onMouseOverHandler = (nodeData) => {
		if (nodeData && nodeData._children) {
			document.getElementById(nodeData.id).children[0].style.r = 13;
		}
	};
	const onMouseOutHandler = (nodeData) => {
		if(nodeData){
			document.getElementById(nodeData.id).children[0].style.r = 11;
		}
	};
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
							data={selectFormat(treeFormat)}
							// initialDepth={0}
							separation={{
								siblings: 1.3,
								nonSiblings: 2,
							}}
							translate={{
								x: svgWidth / 2,
								y: 50,
							}}
							onMouseOver={onMouseOverHandler}
							onMouseOut={onMouseOutHandler}
							scaleExtent={{
								min: 0.1,
								max: 1.5,
							}}
							styles={{
								links: {
									stroke: "#C7C7C7",
									strokeWidth: 1,
								},
								nodes: {
									node: {
										name: {
											stroke: "none",
											fill: "#C7C7C7",
										},
									},
									leafNode: {
										name: {
											stroke: "none",
											fill: "#C7C7C7",
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
