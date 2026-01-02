exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "POST only" }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {}

  const question = (body.question || "").trim();
  if (!question) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing question" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
    };
  }

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "You are FlashAnswer for a kid. Be accurate, clear, and honest. If unsure, say so.",
        },
        { role: "user", content: question },
      ],
    }),
  });

  const data = await r.json();
  const answer = data.output_text || "No answer returned.";

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ answer }),
  };
};
