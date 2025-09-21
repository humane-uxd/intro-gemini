<script>
	import { onMount } from 'svelte';
	import ChatMessage from '../lib/components/ChatMessage.svelte';
	import ChatInput from '../lib/components/ChatInput.svelte';

	let messages = [];
	let isLoading = false;
	let error = null;

	// Initialize with welcome message
	onMount(() => {
		messages = [{
			id: 1,
			role: 'bot',
			content: "Hello! I'm your Gemini-powered chatbot. How can I help you today?",
			timestamp: new Date().toISOString()
		}];
	});

	async function handleSendMessage({detail: message}) {
		if (!message.trim() || isLoading) return;

		// Add user message	
		const userMessage = {
			id: messages.length + 1,
			role: 'user',
			content: message,
			timestamp: new Date().toISOString()
		};
		
		messages = [...messages, userMessage];
		isLoading = true;
		error = null;

		try {
			const conversation = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
			
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ message: conversation })
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

<div class="container">
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
