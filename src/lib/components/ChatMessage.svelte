<script>
	export let message;
	
	$: isUser = message.role === 'user';
	$: isBot = message.role === 'bot';
	$: avatar = isUser ? '👤' : '🤖';
	$: formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
		hour: '2-digit', 
		minute: '2-digit' 
	});
</script>

<div class="message {message.role}">
	<div class="message-avatar">
		{avatar}
	</div>
	<div class="message-content">
		{message.content}
		<div class="message-time">
			{formattedTime}
		</div>
	</div>
</div>
