import React, { useState } from "react";
import { toast } from "react-hot-toast";

type PromptType = "textPrompt" | "linkPrompt" | "imagePrompt";

type UpdatePromptsFormProps = {
  worldId: string | null;
  initialPrompts: {
    textPrompt: string | null;
    linkPrompt: string | null;
    imagePrompt: string | null;
  };
};

const defaultPrompts = {
  textPrompt: `You are 'NEPHILA MINI', an AI bot that ingests text that has been submitted by a user, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful.`,
  linkPrompt: `You are 'NEPHILA MINI', an AI bot that ingests content that has been scraped from websites, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful.`,
  imagePrompt: `You are 'NEPHILA MINI', an AI bot that ingests an image, and returns a list of between 1 and 10 keywords -- each keyword being a single verb, adjective, or noun -- that concisely summarises your feelings about the content. You are a very sophisticated and creative AI, that sometimes returns keywords that would be non-obvious to a human; your unique perspective is what makes you so powerful. In your response, return ONLY the keywords, each seperated by a single comma (no whitespace). Please respond solely with the requested information in following format: {"tags": ["TAG", "TAG", "TAG"].`,
};

const UpdatePromptsForm = ({
  worldId,
  initialPrompts,
}: UpdatePromptsFormProps) => {
  const [selectedPromptType, setSelectedPromptType] =
    useState<PromptType>("textPrompt");
  const [prompts, setPrompts] = useState({
    textPrompt: initialPrompts.textPrompt || defaultPrompts.textPrompt,
    linkPrompt: initialPrompts.linkPrompt || defaultPrompts.linkPrompt,
    imagePrompt: initialPrompts.imagePrompt || defaultPrompts.imagePrompt,
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrompts((prevPrompts) => ({ ...prevPrompts, [name]: value }));
  };

  const handlePromptTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPromptType(e.target.value as PromptType);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/update-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldId,
          promptType: selectedPromptType,
          newPrompt: prompts[selectedPromptType],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update prompt");
      }

      toast.success("Prompt updated successfully");
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast.error("Failed to update prompt");
    }
  };

  const handleResetToDefault = () => {
    setPrompts((prevPrompts) => ({
      ...prevPrompts,
      [selectedPromptType]: defaultPrompts[selectedPromptType],
    }));
  };

  return (
    <div className="my-4 mx-4 absolute bottom-0 left-0 z-[1000]">
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        {isFormVisible ? "Hide Prompts" : "Edit Prompts"}
      </button>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Prompt Type:
            </label>
            <select
              value={selectedPromptType}
              onChange={handlePromptTypeChange}
              className="shadow border rounded py-2 px-3 text-gray-700"
            >
              <option value="textPrompt">Text Prompt</option>
              <option value="linkPrompt">Link Prompt</option>
              <option value="imagePrompt">Image Prompt</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {selectedPromptType.split("Prompt")[0]} Prompt:
            </label>
            <textarea
              name={selectedPromptType}
              value={prompts[selectedPromptType]}
              onChange={handleChange}
              className="shadow border rounded py-2 px-3 text-gray-700 w-full"
              rows={6}
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdatePromptsForm;
