// pages/api/create-world.js
import prisma from "../../lib/prisma";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "types/supabase";
export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const supabaseServerClient = createServerSupabaseClient<Database>({
      req,
      res,
    });
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    try {
      console.log("here");
      console.log(user?.id);
      console.log(name);
      const newWorld = await prisma.world.create({
        data: {
          title: name,
          userId: user?.id,
        },
      });

      console.log(newWorld.id);

      res.status(200).json(newWorld.id);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
