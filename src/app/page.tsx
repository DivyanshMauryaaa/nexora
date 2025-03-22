"use client";

import { Github, Info, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ''
);

export default function Home() {
  const { user } = useUser(); //Getting logged-in user from clerk

  // Input value to take the input prompt from the user
  const [prompt, setPrompt] = useState("");
  const [saveTitle, setSaveTitle] = useState("");

  // Response and loading variables to store the response and loading state
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handiling when user clicks the "Generate" button to fetch the response 
  const handleSubmit = async () => {
    setLoading(true); //Set Loading is equal to true so that it displays "Generating..." insted of "Generate" and notify the user that the response is being generated
    setResponse(""); // Clear previous response

    try {
      const res = await fetch("/api/model", { // Fetch the response from the API "/api/model"
        method: "POST", //Define the method as POST for secure connection
        headers: { "Content-Type": "application/json" }, //Define the headers as "Content-Type": "application/json" for defining the type of repsonse
        body: JSON.stringify({ prompt }), //Converting JSON to string form
      });

      const data = await res.json(); //Convert the response to JSON format

      setResponse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response"); //Setting client reponse according to the server response recieved

    } catch (error) { //Handling the error if the response is not fetched
      setResponse("Error fetching response.");
      console.error("API Error:", error);
    }

    setLoading(false); //Setting the loading to false after the response is fetched
  };

  //TODO: Implement the save functionality to save the response to the database
  const handleSaveDocument = async (title: string, content: string) => {
    setSaving(true)

    if (!user) {
      console.error("No logged-in user.");
      return;
    }

    if (saveTitle == "") {
      alert("Please enter a title");
      return;
    }

    const { error } = await supabase.from("test_documents").insert([
      {
        title: title,
        content: content,
        user_id: user.id, // Attach user_id
      },
    ]);

    if (error) {
      console.error("Insert Error:", error.message);
    } else {
      alert("Test saved successfully!");

      setResponse("")
      setPrompt("")
    }

    setSaving(false)
  };

  return (
    <div className="p-4">
      <p className="text-[50px] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-[800] text-transparent text-center">
        TestGem AI
      </p>

      <br />

      <center>
        <form action="">
          <input
            type="text"
            className="p-[30px] rounded-2xl md:w-[600px] text-xl border transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the Test You Want to Make here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={handleSubmit} // Handle the click event
            disabled={loading == true} // Disable button when loading
            className="flex items-center gap-2 text-2xl hover:text-white focus:text-white focus:bg-gradient-to-r focus:outline-none hover:bg-gradient-to-r from-indigo-500 to-blue-500 py-3 px-7 cursor-pointer mt-4 border transition-all duration-300 rounded-full"
          >
            <Sparkles /> {loading ? "Generating..." : "Generate"}
          </button>
        </form>
      </center>


      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl w-[80%] m-auto">
          <div className="p-3">
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Title"
              className="p-2 border rounded"
            />
          </div>

          <div className="prose text-lg leading-relaxed">
            <ReactMarkdown>{response}</ReactMarkdown> {/* Parsing the response to display support of text formatting */}
          </div>

          <div className="actions flex justify-center mt-[20px]">
            <button
              onClick={() => handleSaveDocument(saveTitle, response)}
              disabled={saving}
              className="py-3 px-7 border bg-blue-600 hover:bg-blue-700 text-white rounded-2xl cursor-pointer"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button className="cursor-pointer py-3 px-7 hover:underline" disabled={saving}>Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-[30%] flex">
        <a href="https://github.com/divyanshMauryaaa" target="_blank">
          <Github className="hover:text-indigo-700" size={30} />
        </a>

        <p className="flex text-sm text-gray-500">
          &nbsp;<Info size={16}/> This project is private
        </p>
      </div>
    </div>
  );
}
