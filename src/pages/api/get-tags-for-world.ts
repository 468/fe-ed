import prisma from "../../lib/prisma";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "types/supabase";

// Define a type for the tag
type Tag = {
  name: string;
};

// Define a type for the tag frequency object
type TagFrequency = {
  [name: string]: number;
};

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const { worldId } = req.query;

    if (!worldId) {
      return res.status(400).json({ error: "World ID is required" });
    }

    const supabaseServerClient = createServerSupabaseClient<Database>({
      req,
      res,
    });
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();

    try {
      const tags = await prisma.tag.findMany({
        where: {
          Node: {
            worldId: worldId,
          },
        },
        select: {
          name: true, // Select only the name field of each tag
        },
      });

      // Counting the frequency of each tag
      const tagFrequency: TagFrequency = tags.reduce((acc, tag) => {
        if (tag.name) {
          // Check if name is not null or undefined
          acc[tag.name] = (acc[tag.name] || 0) + 1;
        }
        return acc;
      }, {} as TagFrequency);

      // Creating an array from the tag names, ordered by frequency and sliced to top 25
      const sortedTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])
        .slice(0, 25);

      res.status(200).json(sortedTags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
