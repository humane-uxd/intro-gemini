import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '$env/static/private';


export async function POST({ request }) {
	try {
		const { message } = await request.json();

		if (!message) {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		if (!GEMINI_API_KEY) {
			return json({ error: 'Gemini API key not configured' }, { status: 500 });
		}

		// Initialize Gemini
		const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

		let systemInstruction = `
			You are an expert judge of sentiment and color semantics.
			You are given a message and you need to judge the sentiment of the message.
			You must choose a color that best represents that sentiment.
			You must return the color as a CSS named color.
		`;

		const contents = `
			Evaluate the sentiment of the following message: ${message}
		`

		// Generate content using the new API
		const response = await genAI.models.generateContent({
			model: 'gemini-2.5-flash-lite',
			contents,
			config: {
				systemInstruction,
				responseMimeType: 'application/json',
				responseSchema: {
					type: 'object',
					properties: {
						color: { type: 'string' },
						sentiment: { type: 'string' }
					},
					required: ['color', 'sentiment']
				}
			}
		});

		const text = JSON.parse(response.text);

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
			error: 'Failed to get response from Gemini: ${error.message}. Please try again.' 
		}, { status: 500 });
	}
}
