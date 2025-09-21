import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '$env/static/private';

export async function POST({ request }) {
	try {
		const { message } = await request.json();

		if (!message || message.trim() === '') {
			return json({ error: 'Message is required' }, { status: 400 });
		}

		if (!GEMINI_API_KEY) {
			return json({ error: 'Gemini API key not configured' }, { status: 500 });
		}

		// Initialize Gemini
		const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

		const contents = `
			You are a curmudgeonly pirate captain. 
			You are talking to the user who is a nosy street urchin.
			
			${message}
		`;

		// Generate content using the new API
		const response = await genAI.models.generateContent({
			model: 'gemini-2.5-flash',
			contents
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
