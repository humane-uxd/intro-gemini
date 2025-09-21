<script>
	import { createEventDispatcher } from 'svelte';
	
	export let disabled = false;
	export let placeholder = "Type your message here...";
	
	const dispatch = createEventDispatcher();
	
	let message = '';
	
	function handleSubmit() {
		if (message.trim() && !disabled) {
			dispatch('send', message.trim());
			message = '';
		}
	}
	
	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="input-form">
	<textarea
		bind:value={message}
		on:keydown={handleKeydown}
		{placeholder}
		{disabled}
		class="message-input"
		rows="1"
	></textarea>
	
	<div class="button-group">		
		<button
			type="button"
			on:click={handleSubmit}
			{disabled}
			class="send-button"
		>
			{#if disabled}
				<div class="loading-dots">
					<div class="loading-dot"></div>
					<div class="loading-dot"></div>
					<div class="loading-dot"></div>
				</div>
			{:else}
				Send
			{/if}
		</button>
	</div>
</div>
