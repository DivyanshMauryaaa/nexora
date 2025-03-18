"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  // Input value
  const [prompt, setPrompt] = useState("");

  // Response and loading
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Gemini API
  const handleSubmit = async () => {
    setLoading(true);
    setResponse(""); // Clear previous response
  
    try {
      const res = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
  
      const data = await res.json();
  
      setResponse(data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "No response");
      console.log(data?.text);
    } catch (error) {
      setResponse("Error fetching response.");
      console.error("API Error:", error);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="p-4">
      <p className="text-[50px] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-[800] text-transparent text-center">
        TestGem AI
      </p>

      <br />

      <center>
        <input
          type="text"
          className="p-[30px] rounded-2xl w-[600px] text-xl border transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the Test You Want to Make here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleSubmit} // ✅ Added onClick
          disabled={loading} // Disable button when loading
          className="flex items-center gap-2 text-2xl hover:text-white hover:bg-gradient-to-r from-indigo-500 to-blue-500 py-3 px-7 cursor-pointer mt-4 border transition-all duration-300 rounded-full"
        >
          <Sparkles /> {loading ? "Generating..." : "Generate"}
        </button>
      </center>

      
      {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded-xl w-[80%] m-auto">
            <div className="prose text-lg leading-relaxed">
              <ReactMarkdown>{response}</ReactMarkdown> {/* ✅ Markdown applied */}
            </div>
          </div>
        )}
    </div>
  );
}
