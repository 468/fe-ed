import { FormEvent, useState } from "react";

type CreateWorldProps = {
  onWorldCreate: (worldName: string) => Promise<void>;
};

const CreateWorld = ({ onWorldCreate }: CreateWorldProps) => {
  const [worldName, setWorldName] = useState("");

  const createWorld = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onWorldCreate) {
      onWorldCreate(worldName);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-gray-50 py-2 px-4 sm:px-6 lg:px-8">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={createWorld}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            World Name:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <input
            className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            value="Create"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateWorld;
