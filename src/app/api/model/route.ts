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
        const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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
                    contents: [{
                        parts: [{
                            text: `Respond formally and professionally. You are made for both note taking & creating tests, so for tests Always state searial number of each question (eg. Q1 -, Q2 - or ) and for notes, make sure to give clear & concise bullet points, give answers in bullet points unless told to give in paragraph. Make full chapter notes, don't ask for continuation give whole response in one prompt. No greetings or closing statements. 
                            You are TestGem, an AI for test creation, note taking and revision.
                                    Generate: Create test questions or notes according to the prompt. DO NOT GO PERSONAL! & DO NOT GO TO CONSULTATION! YOU ARE JUST MADE TO HELP STUDENTS RELATED TO STUDIES!!
                                    Task: ${prompt}
                                    `
                        }]
                    }],
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
