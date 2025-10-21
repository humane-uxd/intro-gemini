<script>
	import { onMount } from 'svelte';
	import ChatMessage from '../lib/components/ChatMessage.svelte';
	import ChatInput from '../lib/components/ChatInput.svelte';

	let messages = [];
	let isLoading = false;
	let error = null;
	let messagesContainer;

	let mouseMovementDistance = 0;
	let lastMousePosition = { x: 0, y: 0 };
	let isMouseTracking = false;

	// Auto-scroll to bottom when messages update
	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	// Reactive statement to scroll when messages change
	$: if (messages.length > 0) {
		setTimeout(scrollToBottom, 10); // Small delay to ensure DOM is updated
	}

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

		// Create initial bot message for streaming
		const botMessage = {
			id: messages.length + 1,
			role: 'bot',
			content: '',
			timestamp: new Date().toISOString(),
			isStreaming: true
		};
		messages = [...messages, botMessage];

		try {			
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ messages: messages.slice(0, -1) }) // Exclude the streaming bot message
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to get response');
			}

			// Handle streaming response
			const reader = response.body?.pipeThrough(new TextDecoderStream())?.getReader();

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					messages[messages.length - 1].isStreaming = false;
					break;
				};

				messages[messages.length - 1].content += value;
				messages[messages.length - 1].timestamp = new Date().toISOString();
			}

			// Show message immediately, then query for sentiment for faster UX.
			const sentimentResponse = await fetch('/api/judges/sentiment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ message: messages[messages.length - 1].content })
			});

			const sentimentData = await sentimentResponse.json();

			// update messages array (rather than botMessage) to trigger Svelte re-render
			messages[messages.length - 1].sentimentColor = sentimentData.response.color;
		} catch (err) {
			console.error('Error sending message:', err);
			error = err.message;
			// Remove the streaming bot message on error
			messages = messages.slice(0, -1);
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
		<div class="messages-container" bind:this={messagesContainer}>
			{#each messages as message (message.id)}
				<ChatMessage {message} />
			{/each}

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
