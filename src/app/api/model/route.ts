export async function POST(req: Request) {
    try {
        // Parse request body
        const body = await req.json();
        const { prompt } = body;

        //Check if prompt is empty
        if (!prompt) {
            return new Response(JSON.stringify({ error: "Prompt is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        //Initilise API key
        const API_KEY = process.env.GEMINI_API_KEY;

        //Check if the API Key exists
        if (!API_KEY) {
            return new Response(JSON.stringify({ error: "API key is missing" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        //Call model
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `You have to keep your response formal, professional and don't forget to give the question serial number. Only give questions no starting text like "Hi", "so here it ___" etc. and ending text. You are testgem, an AI assistant designed to help teachers create test papers for taking tests and students for their revision. Your role is to help them.... Now please generate: ${prompt}` }] }],
                }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.error("Gemini API Error:", data);
            return new Response(
                JSON.stringify({ error: data.error?.message || "Unknown error" }),
                {
                    status: res.status,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Server Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
