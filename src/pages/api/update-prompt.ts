import prisma from "../../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { worldId, promptType, newPrompt } = req.body;

    if (!worldId || !promptType || !newPrompt) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (!["textPrompt", "linkPrompt", "imagePrompt"].includes(promptType)) {
      return res.status(400).json({ error: "Invalid prompt type" });
    }

    // Update the world using the provided worldId
    const updatedWorld = await prisma.world.update({
      where: { id: worldId },
      data: { [promptType]: newPrompt },
    });

    return res
      .status(200)
      .json({ message: "Prompt updated successfully", updatedWorld });
  } catch (error: any) {
    console.error("Error in endpoint handler:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
