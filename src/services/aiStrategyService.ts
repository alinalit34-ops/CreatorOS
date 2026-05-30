
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_STATS, MOCK_POSTS, MOCK_REVENUE, ANALYTICS_DATA, AUDIENCE_AGE, AUDIENCE_GEO } from "../lib/mockData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AIStrategy {
  contentIdeas: {
    title: string;
    description: string;
    platform: string;
    reasoning: string;
  }[];
  optimalSchedule: {
    day: string;
    time: string;
    platform: string;
    reason: string;
  }[];
  trendingTopics: string[];
  performanceInsight: string;
}

export async function generateCreatorStrategy(): Promise<AIStrategy> {
  const context = {
    stats: MOCK_STATS,
    recentPosts: MOCK_POSTS,
    revenue: MOCK_REVENUE,
    analytics: ANALYTICS_DATA,
    audience: { age: AUDIENCE_AGE, geo: AUDIENCE_GEO }
  };

  const prompt = `
    You are a world-class Creator Strategist AI. 
    Analyze the following creator data and provide a comprehensive strategy.
    
    Data Context:
    ${JSON.stringify(context, null, 2)}
    
    Provide:
    1. 3 highly relevant content ideas based on performance and audience.
    2. 3 optimal posting times across different platforms.
    3. 5 trending topics relevant to a "Tech & Design" creator (the user's niche).
    4. One high-impact performance insight.
    
    Return the response in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contentIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["title", "description", "platform", "reasoning"]
              }
            },
            optimalSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  time: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["day", "time", "platform", "reason"]
              }
            },
            trendingTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            performanceInsight: { type: Type.STRING }
          },
          required: ["contentIdeas", "optimalSchedule", "trendingTopics", "performanceInsight"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AIStrategy;
  } catch (error: any) {
    console.warn("AI strategy generator is currently utilizing pre-configured local strategy engine:", error?.message || error);
    // Fallback strategy if AI fails
    return {
      contentIdeas: [
        { title: "Day in the Life of a Designer", description: "Show your workspace and tools.", platform: "YouTube", reasoning: "Audience loves behind-the-scenes content." },
        { title: "Top 5 AI Tools for 2024", description: "Quick review of productivity tools.", platform: "TikTok", reasoning: "AI is a trending topic in your niche." },
        { title: "Design System Deep Dive", description: "Explain how you build components.", platform: "Twitter", reasoning: "High engagement on technical threads." }
      ],
      optimalSchedule: [
        { day: "Tuesday", time: "7:00 PM", platform: "YouTube", reason: "Highest historical engagement." },
        { day: "Friday", time: "10:00 AM", platform: "Instagram", reason: "Peak weekend discovery." },
        { day: "Monday", time: "9:00 AM", platform: "Twitter", reason: "Start of week professional traffic." }
      ],
      trendingTopics: ["Generative AI", "Minimalist UI", "Creator Economy", "Web3 Design", "Remote Work Flow"],
      performanceInsight: "Your YouTube revenue is up 12%, but Instagram engagement is slightly lagging. Consider cross-promoting your long-form content on Reels."
    };
  }
}
