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
  const [saveMode, setSaveMode] = useState("test_documents"); // Save mode to save the document in the database

  // Response and loading variables to store the response and loading state
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  //Message dialog & dialog state to show the message to the user
  const [messageDialog, setMessageDialog] = useState(false); // Message dialog to show the message to the user
  const [message, setMessage] = useState(""); // Message to show to the user
  const [dialogTitle, setDialogTitle] = useState(""); // Title of the message dialog

  const handleOpenMessageDialog = (message: string, dialogTitle: string) => {
    setMessageDialog(true); // Open the message dialog
    setMessage(message); // Set the message to show to the user
    setDialogTitle(dialogTitle); // Set the title of the message dialog
  }

  const handleCloseMessageDialog = () => {
    setMessageDialog(false); // Close the message dialog
  }

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
  const handleSaveDocument = async (title: string, content: string, savingAs: string) => {
    setSaving(true)

    if (!user) { // Check if user is logged in
      setSaving(false)
      handleOpenMessageDialog("Please Login to save your documents.", "Login Required");
      
      return;
    }

    if (saveTitle == "") {
      handleOpenMessageDialog("Please enter a title for your document.", "Title Required");
      setSaving(false)

      return;
    }

    const { error } = await supabase.from(savingAs).insert([
      {
        title: title,
        content: content,
        user_id: user.id, // Attach user_id
      },
    ]);

    if (error) {
      console.error("Error saving document:", error); // Log the error if any
      handleOpenMessageDialog("Error saving document. Please try again. for support: divyanshm510@gmail.com", "Save Error"); // Show error message to the user
    } else {
      handleOpenMessageDialog("Document saved successfully!", "Success"); // Show success message to the user
      setResponse("")
      setPrompt("")
    }

    setSaving(false)
  };

  return (
    <div className="p-4">
      <p className="text-[50px] font-[800] text-center text-gray-700">
        Welcome back! <span className="bg-gradient-to-r text-transparent from-indigo-700 to-purple-700 bg-clip-text">{user?.firstName}</span>
      </p>

      <br />

      <center>
        <form action="">
          <input
            type="text"
            className="p-[27px] rounded-2xl md:w-[800px] text-xl border transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-[3.6px] focus:ring-blue-800"
            placeholder="Describe a Test or Notes of a Chapter That You Want to make"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={handleSubmit} // Handle the click event
            disabled={loading == true} // Disable button when loading
            className="flex items-center gap-2 text-2xl hover:text-white focus:text-white focus:bg-gradient-to-r focus:outline-none hover:bg-gradient-to-r focus:bg-gradient-to-r hover:from-indigo-800 focus:from-indigo-800 hover:to-blue-800 focus:to-blue-800 py-3 px-7 hover:scale-110 focus:scale-110 cursor-pointer mt-4 border transition-all duration-300 rounded-full"
          >
            <Sparkles /> {loading ? "Generating..." : "Generate"}
          </button>
        </form>
      </center>


      {response && (
        <div className="mt-4 p-4 border border-gray-200 rounded-xl w-[80%] m-auto">

          <div className="prose text-lg leading-relaxed">
            <ReactMarkdown>{response}</ReactMarkdown> {/* Parsing the response to display support of text formatting */}
          </div>
          <br />

          <div className="p-3 border-t border-gray-200 mt-4">
            <br />
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Title"
              className="border rounded w-full mb-2 focus:outline-none p-4 bg-gray-100 border-none"
            />
          </div>

          <div className="actions flex justify-center mt-[20px]">
            <select className="ml-2 mr-4 border border-gray-100 bg-gray-100 p-3 rounded-lg" defaultValue={"test_documents"} onChange={(e) => setSaveMode(e.target.value)}>
              <option value="test_documents">Tests</option>
              <option value="notes">Notes</option>
            </select>
            <button
              onClick={() => handleSaveDocument(saveTitle, response, saveMode)}
              disabled={saving}
              className="py-3 px-7 border bg-blue-600 hover:bg-blue-700 text-white rounded-2xl cursor-pointer transition-all duration-300"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button className="cursor-pointer py-3 px-7 hover:underline" disabled={saving} onClick={() => setResponse('')}>Cancel</button>
          </div>
        </div>
      )}

      {/* Message Dialog to show the message to the user */}
      {messageDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-50 bg-opacity-75">
          <div className="bg-slate-800 text-white p-6 rounded-lg shadow-lg w-[300px]">
            <h2 className="text-lg font-semibold mb-4">{dialogTitle}</h2>
            <p>{message}</p>
            <button onClick={handleCloseMessageDialog} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex mt-[30%]">
        <a href="https://github.com/divyanshMauryaaa/" target="_blank">
          <Github className="hover:text-indigo-700" size={30} />
        </a>

        <p className="flex text-sm text-gray-500">
          &nbsp;<Info size={16} /> Developer's profile
        </p>
      </div>
    </div>
  );
}
