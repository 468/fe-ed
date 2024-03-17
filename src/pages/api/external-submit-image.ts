// pages/api/external-submit-image.js
import axios from "axios";
const formidable = require("formidable");
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import prisma from "../../lib/prisma";
import { NodeType } from "@prisma/client";
import mime from "mime-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(supabaseUrl as string, supabaseKey as string);

async function uploadImageToSupabase(buffer, fileName) {
  const filePath = `uploads/${fileName}`; // Adjust path as needed
  const { data, error } = await supabase.storage
    .from("fe-ed_images")
    .upload(filePath, buffer, {
      cacheControl: "3600",
      upsert: true, // Optional: Set to true if you want to overwrite existing files
    });

  if (error) {
    console.error("Upload error details:", error);
    throw new Error("Failed to upload image to Supabase Storage");
  }

  console.log(data);
  const imageUploadedPath = supabase.storage
    .from("fe-ed_images")
    .getPublicUrl(data.path);

  return imageUploadedPath.data.publicUrl;
}

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    // Check for required parameters in request.

    if (!token) {
      return res
        .status(400)
        .json({ error: "URL and Authorization token are required" });
    }

    // Decode and parse JWT token.
    let decodedJWT = decodeURIComponent(token);
    let parsedJWT = JSON.parse(decodedJWT)[0];

    // Verify the token and get the user.
    const { data: user, error } = await supabase.auth.getUser(parsedJWT);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Unauthenticated or invalid token" });
    }

    console.log("d");
    const data = await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    console.log("data below");
    console.log(data);

    if (!data.files || !data.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageFile = data.files.image[0];
    console.log(imageFile);
    const image = fs.readFileSync(imageFile.filepath);

    const fileName = imageFile.originalFilename;
    const imageBase64 = image.toString("base64");
    const contentType = mime.lookup(fileName) || "application/octet-stream";

    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are 'NEPHILA MINI', an AI bot that ingests an image, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful. In your response, return ONLY the keywords, each seperated by a single comma (no whitespace). Please respond solely with the requested information in following format: {"tags": ["TAG", "TAG", "TAG"].`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${contentType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseContent = openAIResponse.data.choices[0].message.content;
    const parsedResponse = JSON.parse(responseContent);

    // Extract tags and url
    const tags = parsedResponse.tags;

    console.log(tags);

    const world = await prisma.world.findFirst({
      where: { userId: user.id },
    });

    if (!world) {
      return res.status(500).json({ error: "No world found for user" });
    }

    const buffer = Buffer.from(imageBase64, "base64");
    const imageFilePath = await uploadImageToSupabase(buffer, fileName);

    console.log(imageFilePath);

    const newNode = await prisma.node.create({
      data: {
        isSuggestion: false,
        url: imageFilePath,
        title: fileName,
        nodeType: NodeType.IMAGE,
        worldId: world.id,
        tags: {
          create: tags.map((name) => ({
            name: name.trim().toLowerCase(),
          })),
        },
      },
    });

    console.log(newNode);

    res.status(200).json({ newNode });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
