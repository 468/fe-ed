// pages/api/external-submit-text.js
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import prisma from "../../lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

const processTextData = async (input: string) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are 'NEPHILA MINI', an AI bot that ingests text that has been submitted by a user, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful.",
      },
      {
        role: "user",
        content: `Please parse the following text, returning between 1 and 10 keywords (each keyword being a single word in lemmatized form) that summarizes your interpretation of the content. Feel free to be creative in your interpretations. Please do not return keywords that are generic such as 'science', 'politics', 'design', 'button', 'cookies', 'title', instead focusing only on what is unique or interesting about the text provided. In your response, return ONLY the keywords, each seperated by a single comma (no whitespace). Please respond solely with the requested information in following format: {"tags": ["TAG", "TAG", "TAG"]}. Submitted content: ${input}`,
      },
    ],
  };

  try {
    const result = await axios.post(apiUrl, data, { headers, timeout: 60000 });

    const returnedData = result.data.choices[0].message.content;
    const parsedResponse = JSON.parse(returnedData);
    const tags = parsedResponse.tags;
    return tags;
  } catch (error: any) {
    console.error("Error processing text data with OpenAI:", error.message);
    throw error;
  }
};

export default async function handler(req: any, res: any) {
  console.log("got here");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(400)
        .json({ error: "URL and Authorization token are required" });
    }
    let decodedJWT = decodeURIComponent(token);
    let parsedJWT = JSON.parse(decodedJWT)[0];
    console.log("got here");
    const { data: user, error } = await supabase.auth.getUser(parsedJWT);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Unauthenticated or invalid token" });
    }

    console.log("got here");
    const { text } = req.body;

    const tags = await processTextData(text);

    const world = await prisma.world.findFirst({
      where: { userId: user.user?.id },
    });

    console.log("got here");
    if (!world) {
      return res.status(500).json({ error: "No world found for user" });
    }

    const newNode = await prisma.node.create({
      data: {
        isSuggestion: false,
        url: null,
        title: text, // Modify as needed
        worldId: world.id,
        tags: {
          create: tags.map((name: string) => ({
            name: name.trim().toLowerCase(),
          })),
        },
      },
    });

    res.status(200).json({ newNode });
  } catch (error: any) {
    console.error("Error in endpoint handler:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
