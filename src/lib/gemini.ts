import { GoogleGenAI, Type } from "@google/genai";

export interface BrandAnalysis {
    coreIdentity: string;
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
    Act as an expert Brand Strategist.
    Analyze the website at ${url}.
    ${goal ? `Campaign Goal: ${goal}` : ""}
    ${additionalContext ? `Additional Context: ${additionalContext}` : ""}
    
    Extract:
    1. Core Identity
    2. Brand Voice & Tone
    3. Target Audience
    4. Unique Value Proposition (UVP)
    5. Suggested Color Palette (provide 5 hex codes that represent the brand)
    
    Return as JSON.
  `;

    const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
            tools: [{ urlContext: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    coreIdentity: { type: Type.STRING },
                    voiceTone: { type: Type.STRING },
                    targetAudience: { type: Type.STRING },
                    uvp: { type: Type.STRING },
                    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["coreIdentity", "voiceTone", "targetAudience", "uvp", "colorPalette"],
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
    Generate high-converting ads based on:
    Brand: ${analysis.coreIdentity}
    UVP: ${analysis.uvp}
    Selected Tone/Angle: ${selectedTone}
    
    Platforms and requested fields:
    ${platforms.map(p => `- ${p}: ${(settings[p] || ["all"]).join(", ")}`).join("\n")}
    
    For each platform, provide 2 variants.
    - facebook: Primary Text, Headline, CTA
    - instagram: Primary Text, Headline, CTA
    - google: 3 Headlines, 2 Descriptions
    - twitter: Post Content
    - linkedin: Post Content
    
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

    const result = JSON.parse(textResponse.text || "{}");

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
