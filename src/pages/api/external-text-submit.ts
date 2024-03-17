// pages/api/external-submit-text.js
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import prisma from "../../lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

const processTextData = async (input) => {
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
          "You are 'NEPHILA MINI', an AI bot that ingests content that has been scraped from websites, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful.",
      },
      {
        role: "user",
        content: `Please parse the following scraped content, returning between 1 and 10 keywords (each keyword being a single word in lemmatized form) that summarizes your interpretation of the content. Feel free to be creative in your interpretations. Please do not return keywords that are generic such as 'science', 'politics', 'design', 'button', 'cookies', 'title', instead focusing only on what is unique or interesting about the text provided. In your response, return ONLY the keywords, each seperated by a single comma (no whitespace). Lastly, you should also return a recommended URL. This URL is a suggestion of a real, live website that you believe the visitor will find interesting or informative that is strongly related to the content submitted. Ideally, it should be a highly specialised site that will be novel and intriguing to the visitor; not a site that is popular or well-known. Please respond solely with the requested information in following format: {"tags": ["TAG", "TAG", "TAG"], "url": "URL_HERE", "url_title": "URL_PAGE_TITLE_HERE" }. Submitted content: ${input}`,
      },
    ],
  };

  try {
    const result = await axios.post(apiUrl, data, { headers, timeout: 60000 });

    const returnedData = result.data.choices[0].message.content;
    const parsedResponse = JSON.parse(returnedData);
    const tags = parsedResponse.tags;
    return { tags };
  } catch (error) {
    console.error("Error processing text data with OpenAI:", error.message);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const { data: user, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Unauthenticated or invalid token" });
    }

    const { text } = req.body;

    const tags = await processTextData(text);

    // Database insertion
    const world = await prisma.world.findFirst({
      where: { userId: user.id },
    });

    if (!world) {
      return res.status(500).json({ error: "No world found for user" });
    }

    const newNode = await prisma.node.create({
      data: {
        isSuggestion: false,
        url: "Text URL or Placeholder", // Modify as needed
        title: "Text Title or Placeholder", // Modify as needed
        worldId: world.id,
        tags: {
          create: tags.map((name) => ({
            name: name.trim().toLowerCase(),
          })),
        },
      },
    });

    res.status(200).json({ newNode });
  } catch (error) {
    console.error("Error in endpoint handler:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
