// pages/api/external-submit-link.js
import prisma from "../../lib/prisma";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { Database } from "types/supabase";

// Initialize Supabase client

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

const stripTags = (input: string) => {
  return input
    .replace(/<(script|style|button|a)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getSummary = async (strippedText: string) => {
  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "https://www.fe-ed.world/api/summarize"
      : "http://localhost:3000/api/summarize";

  try {
    const summaryResponse = await axios.post(apiUrl, {
      text_to_summarize: strippedText,
      number_of_sentences: 7, // Change this to the desired number of sentences in the summary
    });

    const summarize = summaryResponse.data.summary;

    return summarize;
  } catch (error: any) {
    console.error("Error fetching summary:", error.message);
    throw error;
  }
};

const processScrapedData = async (input: string, prompt: string | null) => {
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
          prompt ||
          "You are 'NEPHILA MINI', an AI bot that ingests content that has been scraped from websites, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful.",
      },
      {
        role: "user",
        content: `Please parse the following scraped content, returning between 1 and 10 keywords (each keyword being a single word in lemmatized form) that summarizes your interpretation of the content. Feel free to be creative in your interpretations. Please do not return keywords that are generic such as 'science', 'politics', 'design', 'button', 'cookies', 'title', instead focusing only on what is unique or interesting about the text provided. In your response, return ONLY the keywords, each seperated by a single comma (no whitespace). Lastly, you should also return a recommended URL. This URL is a suggestion of a real, live website that you believe the visitor will find interesting or informative that is strongly related to the content submitted. Ideally, it should be a highly specialised site that will be novel and intriguing to the visitor; not a site that is popular or well-known. Please respond solely with the requested information in following format: {"tags": ["TAG", "TAG", "TAG"], "url": "URL_HERE", "url_title": "URL_PAGE_TITLE_HERE" }. Submitted content: ${input}`,
      },
    ],
  };

  try {
    // Set a timeout of 10 seconds (10000 milliseconds).
    const result = await axios.post(apiUrl, data, { headers, timeout: 60000 });

    const returnedData = result.data.choices[0].message.content;
    const parsedResponse = JSON.parse(returnedData);

    // Extract tags and url
    const tags = parsedResponse.tags;
    const url = parsedResponse.url;
    const title = parsedResponse.url_title;

    return { tags, url, title };
  } catch (error: any) {
    console.error(
      "There was an error processing the scraped data with OpenAI: ",
      error.message
    );
    throw error; // Rethrow the error so that it can be caught and handled in the calling function
  }
};

export default async function handler(req: any, res: any) {
  // Check for correct request method first.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const { url, title, html } = req.body;

    if (!url || !token) {
      return res
        .status(400)
        .json({ error: "URL and Authorization token are required" });
    }

    let decodedJWT = decodeURIComponent(token);
    let parsedJWT = JSON.parse(decodedJWT)[0];

    const { data: user, error } = await supabase.auth.getUser(parsedJWT);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Unauthenticated or invalid token" });
    }

    const strippedText = stripTags(html);
    const { summary } = await getSummary(strippedText);

    const world = await prisma.world.findFirst({
      where: { userId: user.user?.id },
      select: { linkPrompt: true, id: true },
    });

    // Make sure a world was found for the user.
    if (!world) {
      return res.status(500).json({ error: "No world found for user" });
    }

    let processedData;

    try {
      processedData = await processScrapedData(
        `${title} ${summary}`,
        world.linkPrompt
      );
    } catch (error: any) {
      console.error(
        "There was an error processing the scraped data: ",
        error.message
      );
      return res
        .status(500)
        .json({ error: "Failed to process the scraped data" });
    }

    const keywordArray = processedData.tags;
    const suggestedUrl = processedData.url;
    const suggestedUrlTitle = processedData.title;

    // Try to create the new node.
    const newNode = await prisma.node.create({
      data: {
        isSuggestion: false,
        url: url,
        title: title || "Untitled",
        worldId: world?.id,
        tags: {
          create: keywordArray.map((name: string) => ({
            name: name.trim().toLowerCase(),
          })),
        },
      },
    });

    // If the suggested URL isn't the same as the original URL, try to create a suggested node.
    if (suggestedUrl !== url && Math.random() <= 0.34) {
      console.log("Creating Suggested");

      // Move this into its own try/catch block as well to handle errors creating the suggested node separately.
      try {
        await prisma.node.create({
          data: {
            isSuggestion: true,
            url: suggestedUrl,
            title: suggestedUrlTitle || suggestedUrl,
            worldId: world?.id,
            tags: {
              create: keywordArray.map((name: string) => ({
                name: name.trim().toLowerCase(),
              })),
            },
          },
        });
      } catch (error: any) {
        console.error(
          "There was an error creating the suggested node: ",
          error.message
        );
      }
    }

    res.status(200).json({ newNode, processedData });
  } catch (error: any) {
    console.error("There was an error processing the request: ", error.message);
    return res.status(500).json({ error: error.message });
  }
}
