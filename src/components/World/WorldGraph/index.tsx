import { useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { LinkData, NodeData } from "../../types";
import { NodeType } from "@prisma/client";

interface NodeGraphProps {
  nodesAndLinks: {
    nodes: NodeData[];
    links: LinkData[];
  };
}

function WorldGraph({ nodesAndLinks }: NodeGraphProps): JSX.Element {
  const fgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);

  const handleNodeHover = (node: NodeData | null) => {
    setHoveredNode(node && node.nodeType === NodeType.IMAGE ? node : null);
  };

  const ImagePreview = ({ url }: { url: string }) => {
    if (!url) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 10000, // Increased zIndex
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={url}
          alt="Preview"
          style={{ maxWidth: "200px", maxHeight: "200px" }}
        />
      </div>
    );
  };

  useEffect(() => {
    // @ts-ignore
    const bloomPass = new UnrealBloomPass(1, 0.5, 0.5, 512);
    bloomPass.strength = 0.33;
    bloomPass.radius = 0.33;
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
    if (!node.url) return;
    window.open(node.url, "_blank");
  };

  return (
    <>
      {hoveredNode && hoveredNode.url && <ImagePreview url={hoveredNode.url} />}
      <ForceGraph3D
        ref={fgRef}
        controlType={"orbit"}
        nodeColor={(node: any) => {
          return node.isSuggestion ? "#555555" : "#ffffff";
        }}
        graphData={nodesAndLinks}
        nodeLabel="nodeLabel"
        linkWidth={1.5}
        nodeRelSize={6}
        backgroundColor="#000000"
        onNodeClick={(node, event: MouseEvent) => openLink(node as NodeData)}
        onNodeHover={(node) => handleNodeHover(node as NodeData)}
      />
    </>
  );
}

export default WorldGraph;
