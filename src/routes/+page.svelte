<script>
	import { onMount } from 'svelte';
	import ChatMessage from '../lib/components/ChatMessage.svelte';
	import ChatInput from '../lib/components/ChatInput.svelte';

	let messages = [];
	let isLoading = false;
	let error = null;

	let mouseMovementDistance = 0;
	let lastMousePosition = { x: 0, y: 0 };
	let isMouseTracking = false;

	// Initialize with welcome message
	onMount(() => {
		messages = [{
			id: 1,
			role: 'bot',
			content: "Hello! I'm your Gemini-powered chatbot. How can I help you today?",
			timestamp: new Date().toISOString()
		}];
	});

	function handleMouseMove(event) {
		if (!isMouseTracking) {
			lastMousePosition = { x: event.clientX, y: event.clientY };
			isMouseTracking = true;
			return;
		}

		const currentPosition = { x: event.clientX, y: event.clientY };
		const distance = Math.sqrt(
			Math.pow(currentPosition.x - lastMousePosition.x, 2) + 
			Math.pow(currentPosition.y - lastMousePosition.y, 2)
		);
		
		mouseMovementDistance += distance;
		lastMousePosition = currentPosition;
	}

	function resetMouseTracking() {
		mouseMovementDistance = 0;
		isMouseTracking = false;
	}

	async function handleSendMessage({detail: message}) {
		if (!message.trim() || isLoading) return;

		// Add user message	
		const userMessage = {
			id: messages.length + 1,
			role: 'user',
			content: message,
			timestamp: new Date().toISOString(),
			mouseMovementDistance: Math.round(mouseMovementDistance)
		};
		
		messages = [...messages, userMessage];
		resetMouseTracking();
		isLoading = true;
		error = null;

		try {			
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ messages })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to get response');
			}

			// Add bot response
			const botMessage = {
				id: messages.length + 1,
				role: 'bot',
				content: data.response,
				timestamp: data.timestamp
			};

			messages = [...messages, botMessage];

			// Show message immediately, then query for sentiment for faster UX.
			const sentimentResponse = await fetch('/api/judges/sentiment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ message: botMessage.content })
			});

			const sentimentData = await sentimentResponse.json();
			console.log(sentimentData);

			// update messages array (rather than botMessage) to trigger Svelte re-render
			messages[messages.length - 1].sentimentColor = sentimentData.response.color;
		} catch (err) {
			console.error('Error sending message:', err);
			error = err.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Gemini Chatbot</title>
	<meta name="description" content="A chatbot powered by Google Gemini and built with SvelteKit" />
</svelte:head>

<div class="container" on:mousemove={handleMouseMove}>
	<header class="header">
		<h1>🤖 Gemini Chatbot</h1>
		<p>Powered by Google Gemini AI • Built with SvelteKit</p>
	</header>

	<div class="chat-container">
		<div class="messages-container">
			{#each messages as message (message.id)}
				<ChatMessage {message} />
			{/each}
			
			{#if isLoading}
				<div class="message bot">
					<div class="message-avatar">🤖</div>
					<div class="message-content">
						<div class="loading">
							<span>Thinking</span>
							<div class="loading-dots">
								<div class="loading-dot"></div>
								<div class="loading-dot"></div>
								<div class="loading-dot"></div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if error}
				<div class="error-message">
					<strong>Error:</strong> {error}
				</div>
			{/if}
		</div>

		<div class="input-container">
			<ChatInput 
				on:send={handleSendMessage}
				disabled={isLoading}
			/>
		</div>
	</div>
</div>
