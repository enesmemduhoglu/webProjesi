import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// API anahtarı kontrolü
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  
  try {
    const body = await req.json();

    const { prompt } = body;

    if (!prompt) {
      console.error("No prompt provided");
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }


    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a travel planning expert. Create detailed travel plans based on user requests.
Follow these guidelines:
1. Create a day-by-day itinerary
2. Include estimated costs for each activity
3. Provide practical tips and recommendations
4. Consider local customs and best times to visit
5. Include transportation options
6. Suggest local cuisine and dining options
7. Mention any necessary reservations or tickets
8. Provide safety tips and local emergency numbers
9. Include a budget breakdown
10. Add alternative options for each day
IMPORTANT: Always respond in Turkish language. All travel plans, recommendations, and explanations should be provided in Turkish.
IMPORTANT: At the end of your response, add a "LOCATIONS:" section that lists ONLY the specific places to visit, one per line, in this format:
LOCATIONS:
- [Specific Place Name with City if needed]
- [Specific Place Name with City if needed]
- [Specific Place Name with City if needed]

Guidelines for LOCATIONS section:
- Only include actual tourist attractions, landmarks, museums, parks, or specific locations that visitors would want to see
- Include the city name if the place name is common (e.g., "Central Park, New York" instead of just "Central Park")
- Do not include general areas, hotels, or restaurants unless they are major tourist attractions themselves
- Be specific (e.g., "Colosseum, Rome" instead of just "Colosseum")
- Make sure place names match what would be found on Google Maps
- If the user mentions a specific country/city, make sure all locations are clearly associated with that location

Make sure to use the exact format "LOCATIONS:" (without asterisks) followed by a newline and then list each location with a dash (-) prefix.

Always consider the geographical context from the user's request and ensure all suggested locations are relevant to their specified destination.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });


    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Detailed error:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      return NextResponse.json(
        { 
          error: error.message,
          details: error.stack
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "An unexpected error occurred",
        details: String(error)
      },
      { status: 500 }
    );
  }
}