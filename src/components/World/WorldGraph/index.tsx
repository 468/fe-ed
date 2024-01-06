import { useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LinkData, NodeData } from "../../types";

interface NodeGraphProps {
  nodesAndLinks: {
    nodes: NodeData[];
    links: LinkData[];
  };
}

function WorldGraph({ nodesAndLinks }: NodeGraphProps): JSX.Element {
  const fgRef = useRef();

  useEffect(() => {
    // @ts-ignore
    const bloomPass = new UnrealBloomPass(1, 0.5, 0.5, 512);
    bloomPass.strength = 2;
    bloomPass.radius = 1;
    bloomPass.threshold = 0.1;
    if (!fgRef.current) return;
    // @ts-ignore
    fgRef.current.postProcessingComposer().addPass(bloomPass);
    // @ts-ignore
    const controls = fgRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.1;
  }, []);

  const openLink = (node: NodeData) => {
    window.open(node.url, "_blank");
  };

  return (
    <ForceGraph3D
      ref={fgRef}
      controlType={"orbit"}
      nodeColor={(node: any) => {
        return node.isSuggestion ? "#333333" : "#ffffff";
      }}
      graphData={nodesAndLinks}
      nodeLabel="nodeLabel"
      linkWidth={1.5}
      nodeRelSize={6}
      onNodeClick={(node, event: MouseEvent) => openLink(node as NodeData)}
    />
  );
}

export default WorldGraph;
