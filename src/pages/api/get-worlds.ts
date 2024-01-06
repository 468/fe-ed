// pages/api/get-worlds.js
import prisma from "../../lib/prisma";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "types/supabase";

export default async function handler(req: any, res: any) {
  console.log("test");
  if (req.method === "GET") {
    const supabaseServerClient = createServerSupabaseClient<Database>({
      req,
      res,
    });
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();

    try {
      // Fetch the worlds connected to the user
      const worlds = await prisma.world.findMany({
        where: {
          userId: user?.id,
        },
      });
      res.status(200).json(worlds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
