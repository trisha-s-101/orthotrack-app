const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY

export async function generateHandoffSummary(prompt) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    console.log(error)
    throw new Error(error.error.message)
  }

  const data = await response.json()

  return data.candidates[0].content.parts[0].text
}