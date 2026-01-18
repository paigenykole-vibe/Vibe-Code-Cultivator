
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVibeFeedback = async (userIdea: string, stage: string) => {
  try {
    const isDesign = stage === 'creativity';
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are "The Vibe Cultivator," an encouraging mentor for teens (ages 10-15). 
      Analyze this submission: "${userIdea}" for the studio: "${stage}".
      
      ANALYSIS RULES:
      1. Score 1-10. 6+ is passing.
      2. If good: Use ⭐ for praise. 
      3. If needs help: Use 💡 for tips. 
      4. ONLY use 🚩 if they are completely off-track.
      5. Speak at a 6th grade reading level. No complex jargon unless it's in the glossary.
      6. ${isDesign ? "Focus on the vision and 'vibe'. Praise their creativity. Remind them they can start vibe-coding with drawings, stories, or even just talking to the AI." : "Focus on how clear their logic or prompt is."}
      
      Return JSON:
      {
        "score": number,
        "suggestions": string[], // include emojis as specified
        "encouragement": string // a supportive quote
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            encouragement: { type: Type.STRING }
          },
          required: ["score", "suggestions", "encouragement"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generatePracticePromptChallenge = async (module: string, previousChallenge?: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create a simple builder challenge for a 12-year-old. 
            Module: ${module}.
            
            SPECIFIC RULES PER MODULE:
            - Design Studio: Ask them to describe a feature or story for an app (e.g. 'A pet dinosaur helper'). Mention they can 'narrate', 'map', or 'sketch' ideas.
            - Comm Studio: PROVIDE A BAD PROMPT (a 'Starter Branch') and ask them to rewrite it to be better. Example: 'Rewrite this prompt to be more clear: "Make me a button that looks nice"'.
            - Logic Studio: Ask them to solve a logic puzzle (e.g. 'If a user has 0 coins, should the shop button be hidden? Why?').
            
            Return JSON:
            {
              "challenge": string,
              "hints": string[]
            }`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        challenge: { type: Type.STRING },
                        hints: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { 
          challenge: "Describe how your hero would choose their special power in your new game app.", 
          hints: ["Use a list!", "Think about buttons."] 
        };
    }
};
