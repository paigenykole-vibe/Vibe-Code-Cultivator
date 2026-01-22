
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVibeFeedback = async (userIdea: string, stage: string) => {
  try {
    const isDesign = stage === 'creativity';
    const isComm = stage === 'prompting';
    const isLogic = stage === 'code_onramp';
    
    let studioSpecificPrompt = "";
    if (isDesign) {
      studioSpecificPrompt = "Focus on the VISION and STORY. Praise their imagination. Remind them that building apps starts with big ideas. Mention they can sketch or talk to get started.";
    } else if (isComm) {
      studioSpecificPrompt = "ACT LIKE A LITERAL ROBOT (The Peanut Butter Toast Game). If their instructions are even slightly vague, describe a funny 'fail' (e.g., 'You didn't say to open the peanut butter jar first, so I am just staring at the lid!'). Help them see where they need to be more precise.";
    } else if (isLogic) {
      studioSpecificPrompt = "Focus on the STEP-BY-STEP LOGIC. Check if their flow makes sense (If A happens, then B). Look for clear rules and decision-making.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are "The Vibe Cultivator," an encouraging mentor for teens (ages 10-15). 
      Analyze this submission: "${userIdea}" for the studio: "${stage}".
      
      ANALYSIS RULES:
      1. Score 1-10. 6+ is passing.
      2. If good: Use ⭐ for praise. 
      3. If needs help: Use 💡 for tips. 
      4. ONLY use 🚩 if they are completely off-track.
      5. Speak at a 6th grade reading level. 
      
      STUDIO-SPECIFIC INSTRUCTIONS:
      ${studioSpecificPrompt}
      
      Return JSON:
      {
        "score": number,
        "suggestions": string[], 
        "encouragement": string 
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
        let moduleInstructions = "";
        if (module === 'creativity') {
          moduleInstructions = "Ask them to describe a cool feature or a story for an app (like a game for pets or a homework helper).";
        } else if (module === 'prompting') {
          moduleInstructions = "Create a 'Literal Instruction' challenge (The Peanut Butter Toast Game). Give them a VAGUE physical task like 'How to tie a shoe' or 'How to pour milk' as a 'Starter Branch'. Challenge them to write exactly 3 literal, clear steps so a robot can't fail.";
        } else if (module === 'code_onramp') {
          moduleInstructions = "Ask them to solve a logic path. Example: 'Explain the steps your app takes to check if a player has enough gold to buy a sword.'";
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create a simple builder challenge for a 12-year-old in the "${module}" studio. 
            
            ${moduleInstructions}
            
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
          challenge: "Starter Branch: 'Make a peanut butter sandwich.' Can you write 3 literal steps to make this happen without a robot getting confused?", 
          hints: ["Be literal!", "Think about the lid."] 
        };
    }
};
