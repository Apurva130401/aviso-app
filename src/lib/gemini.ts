import { GoogleGenAI, Type } from "@google/genai";

export interface BrandAnalysis {
    coreIdentity: string;
    brandArchetype: string;
    voiceTone: string;
    targetAudience: string;
    uvp: string;
    colorPalette: string[];
}

export interface AdVariant {
    primaryText?: string;
    headline?: string;
    cta?: string;
    headlines?: string[];
    descriptions?: string[];
    postContent?: string;
}

export const analyzeBrand = async (url: string, goal?: string, additionalContext?: string): Promise<BrandAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const prompt = `
    Act as an elite Brand Strategist and Marketing Psychologist.
    Analyze the website at ${url}.
    ${goal ? `Campaign Goal: ${goal}` : ""}
    ${additionalContext ? `Additional Context: ${additionalContext}` : ""}
    
    Extract a high-fidelity brand profile:
    1. Core Identity: What is the soul of this brand?
    2. Brand Voice & Tone: Specific adjectives and style (e.g., "Witty & Irreverent", "Stoic & Premium").
    3. Target Audience: Detailed demographics and psychological profile (Pain points, desires).
    4. Unique Value Proposition (UVP): Why do customers choose them over competitors?
    5. Brand Archetype: (e.g., The Rebel, The Sage, The Hero).
    6. Suggested Color Palette: 5 hex codes representing the brand's visual identity.
    
    Return as JSON.
  `;

    const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    coreIdentity: { type: Type.STRING },
                    brandArchetype: { type: Type.STRING },
                    voiceTone: { type: Type.STRING },
                    targetAudience: { type: Type.STRING },
                    uvp: { type: Type.STRING },
                    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["coreIdentity", "brandArchetype", "voiceTone", "targetAudience", "uvp", "colorPalette"],
            },
        },
    });

    return JSON.parse(response.text || "{}");
};

export const generateToneOptions = async (analysis: BrandAnalysis): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const prompt = `
    Based on this brand analysis:
    Identity: ${analysis.coreIdentity}
    Voice: ${analysis.voiceTone}
    UVP: ${analysis.uvp}
    
    Generate 4 distinct "Brand Tone" options for an upcoming ad campaign. 
    Each option should be a short paragraph describing the specific angle and emotional hook.
    Example: "The Empathetic Problem Solver", "The Bold Disruptor", etc.
    
    Return as a JSON array of strings.
  `;

    const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    });

    return JSON.parse(response.text || "[]");
};

export const generateFinalAds = async (
    analysis: BrandAnalysis,
    selectedTone: string,
    platforms: string[],
    settings: Record<string, string[]>,
    includeImages: boolean
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

    const prompt = `
    Act as a World-Class Direct Response Copywriter.
    Your goal is to generate high-converting ads for ${analysis.coreIdentity}.
    
    ### Brand Context:
    - Identity: ${analysis.coreIdentity}
    - Archetype: ${analysis.brandArchetype}
    - UVP: ${analysis.uvp}
    - Target Audience: ${analysis.targetAudience}
    - Brand Voice/Tone: ${analysis.voiceTone}
    - Campaign Angle: ${selectedTone}
    
    ### Copywriting Guidelines:
    - Use psychological triggers like scarcity, social proof, or intense curiosity.
    - Follow high-performance frameworks like PAS (Problem-Agitate-Solution) or AIDA.
    - Keep it punchy, emotional, and platform-specific.
    - **Premium Filter**: Strictly avoid cliché marketing words like "Revolutionary", "Unbelievable", "Click here", "Game-changer", "Secret", "Scam".
    - Focus on the *Identity* and *UVP* of the brand. Use sophisticated, high-end vocabulary that matches a professional agency output.
    - For Direct Response: Focus on the "One Big Idea" and the "Desired Future State" of the customer.
    
    ### Platforms and requested fields:
    ${platforms.map(p => `- ${p}: ${(settings[p] || ["all"]).join(", ")}`).join("\n")}
    
    For each platform, provide 2 variants.
    - facebook: Primary Text (sophisticated & persuasive), Headline (benefit-focused), CTA
    - instagram: Primary Text (social-first, hook-driven), Headline, CTA
    - google: 3 Headlines (dynamic & relevant), 2 Descriptions (feature-to-benefit mapping)
    - twitter: Post Content (authority-building or curiosity-gap hook)
    - linkedin: Post Content (thought-leadership style, professional patterns)
    
    Return as JSON.
    `;

    const textResponse = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    facebook: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { primaryText: { type: Type.STRING }, headline: { type: Type.STRING }, cta: { type: Type.STRING } } } },
                    instagram: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { primaryText: { type: Type.STRING }, headline: { type: Type.STRING }, cta: { type: Type.STRING } } } },
                    google: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { headlines: { type: Type.ARRAY, items: { type: Type.STRING } }, descriptions: { type: Type.ARRAY, items: { type: Type.STRING } } } } },
                    twitter: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { postContent: { type: Type.STRING } } } },
                    linkedin: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { postContent: { type: Type.STRING } } } },
                }
            },
        },
    });

    const rawText = textResponse.text || "{}";
    let result: any;
    try {
        result = JSON.parse(rawText);
    } catch {
        // Sanitize bad escape sequences from Gemini output
        const sanitized = rawText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
        result = JSON.parse(sanitized);
    }

    if (includeImages) {
        const imagePrompt = `High-end professional ad photography for ${analysis.coreIdentity}. 
    Style: ${selectedTone}. 
    Colors: ${analysis.colorPalette.join(", ")}. 
    No text. Cinematic lighting, modern aesthetic.`;

        try {
            const imageResponse = await ai.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents: [{ text: imagePrompt }],
                config: { imageConfig: { aspectRatio: "1:1" } }
            });

            for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    result.adImage = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        } catch (err) {
            console.error("Image generation failed:", err);
        }
    }

    return result;
};

export const refineContent = async (originalContent: string, refinementPrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: `Original Content: ${originalContent}\n\nRefinement Request: ${refinementPrompt}\n\nRewrite the content based on the request. Return ONLY the rewritten text.`,
    });
    return response.text || originalContent;
};
