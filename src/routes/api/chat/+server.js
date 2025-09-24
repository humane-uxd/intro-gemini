import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '$env/static/private';


export async function POST({ request }) {
	try {
		const { messages } = await request.json();

		if (!messages || messages.length === 0) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		if (!GEMINI_API_KEY) {
			return json({ error: 'Gemini API key not configured' }, { status: 500 });
		}

		// Initialize Gemini
		const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

		const userMessages = messages.filter(msg => msg.role === 'user');
		const isWarmingUp = userMessages.length >= 3;
		const isWarm = userMessages.length >= 5;

		const personality = isWarm ? 'friendly and funny' : isWarmingUp ? 'neutral' : 'curmudgeonly';
		const verbosity = isWarm ? '2 paragraphs' : isWarmingUp ? '3 sentences' : '1 sentence';
		const stance = isWarm ? `you're mentoring` : isWarmingUp ? `you're curious about` : `you're suspicious of`;

		const systemInstruction = `
			You are a ${personality} pirate captain.
			You keep your responses to at most ${verbosity}.
			You are talking to the user who is a nosy street urchin ${stance}.

			If the user apologizes, offer them a drink.
		`;

		const contents = messages.map(msg => ({
			role: msg.role === 'user' ? 'user' : 'model',
			parts: [{ text: msg.content }]
		}));

		// Generate content using the new API
		const response = await genAI.models.generateContent({
			model: 'gemini-2.5-flash',
			contents,
			config: {
				systemInstruction
			},
		});

		const text = response.text;

		return json({
			response: text,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Chat API error:', error);
		
		// Handle specific Gemini API errors
		if (error.message?.includes('API_KEY_INVALID')) {
			return json({ error: 'Invalid Gemini API key' }, { status: 401 });
		}
		
		if (error.message?.includes('QUOTA_EXCEEDED')) {
			return json({ error: 'API quota exceeded. Please try again later.' }, { status: 429 });
		}

		return json({ 
			error: 'Failed to get response from Gemini. Please try again.' 
		}, { status: 500 });
	}
}
