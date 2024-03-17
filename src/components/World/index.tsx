import { useEffect, useState } from "react";
import WorldGraph from "./WorldGraph";
import { NodeData, LinkData, Tag } from "../types";
import CreateWorld from "../CreateWorld";
import WorldLoading from "./WorldLoading";

const World = (): JSX.Element => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [worlds, setWorlds] = useState<string[] | null>(null);
  const [currentWorld, setCurrentWorld] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorlds = async () => {
      const response = await fetch("/api/get-worlds");

      if (response.ok) {
        const worlds = await response.json();
        setWorlds(worlds);
        setCurrentWorld(worlds[0]?.id);
      } else {
        console.error("Error fetching worlds:", await response.json());
      }
    };

    fetchWorlds();
  }, []);

  useEffect(() => {
    if (!currentWorld) return;

    const fetchNodes = async () => {
      const response = await fetch(`/api/get-nodes?worldId=${currentWorld}`);

      if (response.ok) {
        const fetchedNodes = await response.json();
        const nodes = fetchedNodes.map((node: NodeData) => ({
          ...node,
          id: node.id.toString(),
          nodeLabel: node.title,
          color: "#fff",
          nodeType: node.nodeType,
          index: node.id,
        }));

        setNodes(nodes);
      } else {
        console.error("Error fetching nodes:", await response.json());
      }
    };

    window.addEventListener("focus", fetchNodes);

    fetchNodes();

    return () => {
      window.removeEventListener("focus", fetchNodes);
    };
  }, [currentWorld]);

  useEffect(() => {
    if (nodes.length === 0) return;

    const newLinks = nodes.flatMap((sourceNode, i) => {
      const sourceNodeTags = sourceNode.tags.map((tag) => tag.name);
      return nodes.slice(i + 1).flatMap((targetNode) => {
        const targetNodeTags = targetNode.tags.map((tag) => tag.name);
        const commonTags = sourceNodeTags.filter((tagText) =>
          targetNodeTags.includes(tagText)
        );
        return commonTags.length > 0
          ? [{ source: sourceNode.id, target: targetNode.id }]
          : [];
      });
    });

    setLinks(newLinks);
  }, [nodes]);

  const onWorldCreate = async (worldName: string) => {
    const res = await fetch("/api/create-world", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: worldName }),
    });

    if (res.ok) {
      const worldId = await res.json();
      if (!worlds) return;
      setWorlds([...worlds, worldId]);
      setCurrentWorld(worldId);
    } else {
      console.error("There was an error creating the world");
    }
  };

  if (worlds === null) {
    return <WorldLoading />;
  }

  if (worlds.length === 0) {
    return <CreateWorld onWorldCreate={onWorldCreate} />;
  }

  return <WorldGraph nodesAndLinks={{ nodes, links }} />;
};

export default World;
