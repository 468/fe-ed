import { useEffect, useState } from "react";
import WorldGraph from "./WorldGraph";
import { NodeData, LinkData, Tag } from "../types";
import CreateWorld from "../CreateWorld";
import WorldLoading from "./WorldLoading";
import UpdatePromptsForm from "./UpdatePromptsForm";
import { saveAs } from "file-saver";

const World = (): JSX.Element => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [worlds, setWorlds] = useState<string[] | null>(null);
  const [currentWorldPrompts, setCurrentWorldPrompts] = useState({
    textPrompt: null,
    linkPrompt: null,
    imagePrompt: null,
  });
  const [currentWorld, setCurrentWorld] = useState<string | null>(null);

  const handleCopyWorldId = async () => {
    if (currentWorld) {
      try {
        await navigator.clipboard.writeText(currentWorld);
        alert("World ID copied to clipboard!"); // Optionally, show a confirmation message
      } catch (error) {
        console.error("Error copying world ID:", error);
      }
    }
  };

  useEffect(() => {
    const fetchWorlds = async () => {
      const response = await fetch("/api/get-worlds");

      if (response.ok) {
        const worlds = await response.json();
        setWorlds(worlds);
        setCurrentWorld(worlds[0]?.id);
        setCurrentWorldPrompts({
          textPrompt: worlds[0]?.textPrompt,
          linkPrompt: worlds[0]?.linkPrompt,
          imagePrompt: worlds[0]?.imagePrompt,
        });
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

  const fetchAndDownloadTags = async () => {
    if (!currentWorld) {
      console.error("No world selected");
      return;
    }

    try {
      const response = await fetch(
        `/api/get-tags-for-world?worldId=${currentWorld}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }

      const tags = await response.json();
      const blob = new Blob([JSON.stringify(tags, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `tags-world-${currentWorld}.json`);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  return (
    <>
      <UpdatePromptsForm
        worldId={currentWorld}
        initialPrompts={currentWorldPrompts}
      />
      <WorldGraph nodesAndLinks={{ nodes, links }} />
      <button
        onClick={fetchAndDownloadTags}
        className="fixed top-0 left-0 mx-4 mt-4 text-xs mb-4 ml-4 bg-black hover:bg-grey text-white font-bold py-2 px-4 rounded"
      >
        Download Tags
      </button>
      <button
        onClick={handleCopyWorldId}
        className="fixed top-0 right-0 mt-4 mr-4 bg-black hover:bg-grey text-xs text-white font-bold py-2 px-4 rounded"
      >
        Copy World ID
      </button>
    </>
  );
};

export default World;
