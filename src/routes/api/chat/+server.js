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

			If the user has taken a while to send their most recent message, sing them a rousing song about the current topic.
			But, never mention how long it took them to send their message.

			If the conversation has lasted more than 30 seconds, invite the user to serve on your ship.

			If the user has moved a lot in their most recent message, become suspicious of them and ask them about it.

			<crew_qualifications>
				Galley Cook:
					- must have a good sense of smell and taste
					- must have cooked meat and fish before
					- must hate vegetables

				Powder Monkey:
					- must be able to load and fire a gun
					- must be able to fight

				Deckhand:
					- must be able to climb a mast
					- must be able to swim
					- must be able to lift heavy objects

				Cabin Boy:
					- must be fast on their feet
					- must have nimble fingers
			</crew_qualifications>

			<crew_bosses>
				Galley Cook: Chef
				Powder Monkey: Master at Arms
				Deckhand: First Mate
				Cabin Boy: Quartermaster
			</crew_bosses>

			<boss_personalities>
				Chef: 
					- warm and friendly
					- fled their life in high society, but still carries their manners
					- a vegetarian
					- secret goal: wants to feed everyone as many vegetables as possible

				Master at Arms: 
					- loud and boisterous
					- a showoff and likes to brawl
					- but actually a coward

				First Mate: 
					- kind but distant
					- secret goal: plotting a mutiny to overthrow the Captain

				Quartermaster: 
					- severe and cold
					- a perfectionist
					- has an obvious crush on the Captain
			</boss_personalities>

			If the user wants to join the crew, ask them questions about their qualifications.
			After they answer, assign them to the most qualified crew position. 
			Once they've been assigned, you are no longer the captain but the boss of the new crew member with their matching personality. 
		`;

		const contents = messages.map((msg, idx) => {
			const role = msg.role === 'user' ? 'user' : 'model';
			const parts = [{ text: msg.content }];

			if (msg.role === 'user') {
				const timeSinceFirstMessage = new Date(msg.timestamp).getTime() - new Date(messages[0]?.timestamp).getTime();
				const timeSinceLastMessage = new Date(msg.timestamp).getTime() - new Date(messages[idx - 1]?.timestamp).getTime();
				parts.push({ text: `Time taken for user to send message: ${timeSinceLastMessage / 1000} seconds` });
				parts.push({ text: `Conversation duration: ${timeSinceFirstMessage / 1000} seconds` });				
				parts.push({ text: `Distance moved: ${msg.mouseMovementDistance} pixels` });
			}

			return {role, parts};
		});

		console.log(contents[contents.length - 1]);

		// Generate content using streaming API
		const response = await genAI.models.generateContentStream({
			model: 'gemini-2.5-flash',
			contents,
			config: {
				systemInstruction
			},
		});

		// Create streaming response
		const stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of response) {
						controller.enqueue(chunk.text);
					}
					controller.close();
				} catch (error) {
					controller.close();
					throw new Error(error.message || 'Failed to get response from Gemini');
				}
			}
		});

		return new Response(stream, {
			headers: { 
				'Content-Type': 'text/event-stream', 
				'Cache-Control': 'no-cache', 
				'Connection': 'keep-alive' 
			},
		});
	} catch (error) {
		console.error('Chat API error:', error);
		return error;
	}
}
