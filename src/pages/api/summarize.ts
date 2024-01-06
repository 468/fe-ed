// @ts-nocheck
import { SummarizerManager } from "node-summarizer";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text_to_summarize, number_of_sentences } = req.body;

  if (!text_to_summarize || !number_of_sentences) {
    res
      .status(400)
      .json({ error: "Missing text_to_summarize or number_of_sentences" });
    return;
  }

  try {
    const summarizer = new SummarizerManager(
      text_to_summarize,
      parseInt(number_of_sentences)
    );
    const summary = await summarizer.getSummaryByRank();

    res.status(200).json({ summary: summary });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while summarizing the text" });
  }
}
