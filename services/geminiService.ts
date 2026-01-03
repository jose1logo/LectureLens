import { GoogleGenAI, Schema, Type } from "@google/genai";
import { LectureData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const digitizeNotes = async (
  file: File,
  includeSummary: boolean
): Promise<LectureData> => {
  try {
    const imagePart = await fileToGenerativePart(file);
    const modelId = 'gemini-3-flash-preview';

    const schemaProperties: {[key: string]: Schema} = {
      title: { type: Type.STRING, description: "A short descriptive title from the document" },
      date: { type: Type.STRING, description: "Date of the lecture or 'Undated'" },
      content: { type: Type.STRING, description: "The COMPLETE text content of the document in Markdown format. Do not summarize or truncate. Preserve all headers, bullet points, and original structure." }
    };

    const requiredFields = ["title", "date", "content"];

    if (includeSummary) {
        schemaProperties.summary = { type: Type.STRING, description: "A concise summary of the content" };
        requiredFields.push("summary");
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: schemaProperties,
      required: requiredFields,
    };

    const systemInstruction = `
      You are an expert academic transcriber. 
      Your task is to accurately digitize handwritten or printed lecture notes.
      
      CRITICAL INSTRUCTIONS:
      1. Analyze the provided image/PDF.
      2. Extract ALL text content verbatim into the 'content' field.
      3. DO NOT TRUNCATE. Process the entire document from start to finish.
      4. Use Markdown formatting to mirror the visual structure (headers #, lists -, bold **).
      5. Ensure the output is valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: imagePart },
          { text: "Digitize these notes. Extract EVERYTHING." }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        maxOutputTokens: 65536, 
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini.");
    }

    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    const parsedData = JSON.parse(cleanText) as LectureData;

    // Post-processing: Replace literal escaped newlines with actual newlines
    // This fixes issues where the AI returns "Line 1\nLine 2" as a single string literal
    if (parsedData.content) {
      parsedData.content = parsedData.content.replace(/\\n/g, '\n');
    }
    if (parsedData.summary) {
      parsedData.summary = parsedData.summary.replace(/\\n/g, '\n');
    }

    return parsedData;

  } catch (error: any) {
    console.error("Gemini Parsing Error:", error);
    
    if (error.message?.includes('404')) {
      throw new Error("The selected Gemini model is not available. Please try again later.");
    }
    
    if (error instanceof SyntaxError || error.message?.includes('JSON')) {
       throw new Error("Failed to parse the document structure. The content might be too complex or the image unclear.");
    }

    throw new Error(error.message || "Failed to digitize notes.");
  }
};