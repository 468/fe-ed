// pages/api/get-nodes.js
import prisma from "../../lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const { worldId } = req.query;

    if (!worldId) {
      return res.status(400).json({ error: "World ID is required" });
    }

    try {
      // Fetch the nodes and their connected tags
      const nodes = await getNodesWithTagsByWorldId(worldId);

      res.status(200).json(nodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

async function getNodesWithTagsByWorldId(worldId: string) {
  // Use Prisma to fetch the Nodes and their connected Tags based on the World ID
  console.log(worldId);
  const nodes = await prisma.node.findMany({
    where: {
      worldId: worldId,
    },
    include: {
      tags: true,
    },
  });

  return nodes;
}
