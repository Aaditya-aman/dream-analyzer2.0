import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { dream, emotions } = await req.json();
    if (!dream || !emotions || !Array.isArray(emotions) || emotions.length === 0) {
      return NextResponse.json({ error: 'Missing dream or emotions' }, { status: 400 });
    }

    // Configure the model with safety settings
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const prompt = `You are a compassionate and insightful dream analyst who blends symbolism, mythology, psychology, and spiritual archetypes. A user has described their dream in vivid detail. Your task is to deeply analyze it—unpacking symbols, emotional tones, and psychological implications—and offer meaningful insights.\n\nStructure your response like this:\n\n🐉 Symbolic Summary\nSummarize the dream's core image(s) and offer a symbolic overview (1–2 paragraphs), using metaphors and archetypes when appropriate.\n\n🧩 Interpretation Themes\nBreak down the dream with 3–5 subheadings, each exploring a different angle. For each:\n- Identify symbols and emotions.\n- Offer possible meanings (psychological, emotional, spiritual).\n- Use relatable language and mythic/psychological references if relevant.\n\n🪞 Reflective Questions\nList 2–3 deep, open-ended questions that help the user introspect and connect the dream to their waking life.\n\n🔮 Hidden Message\nConclude with a one-sentence metaphorical insight—something poetic or powerful that reflects the dream's hidden wisdom.\n\n💡 Conclusion\nWrap up the interpretation with an empowering message about transformation, growth, or emotional insight.\n\nDream description: ${dream}\nEmotions: ${emotions.join(", ")}.\n\nUse the specified emoji for each section in your response, and do not repeat emojis. Format clearly for easy reading. Make the result in 100 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error('Dream analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze dream' },
      { status: 500 }
    );
  }
} 