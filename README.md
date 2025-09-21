# 🤖 Gemini Chatbot

A modern, responsive chatbot built with **SvelteKit** and powered by **Google Gemini AI** using the `@google/genai` library. Features a beautiful chat interface with real-time messaging, conversation history, and error handling.

![Gemini Chatbot](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue?style=for-the-badge&logo=google)
![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-orange?style=for-the-badge&logo=svelte)

## ✨ Features

- 🎨 **Modern UI**: Clean, responsive design with Google Material Design principles
- 💬 **Real-time Chat**: Instant messaging with typing indicators
- 🧠 **AI-Powered**: Powered by Google Gemini Pro using the `@google/genai` library
- 📱 **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🔄 **Conversation History**: Maintains context throughout the chat session
- ⚡ **Fast & Lightweight**: Built with SvelteKit for optimal performance
- 🛡️ **Error Handling**: Graceful error handling with user-friendly messages
- 🎯 **Full-Stack**: Integrated frontend and backend with SvelteKit server-side endpoints

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gemini-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see your chatbot in action!

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking

### Project Structure

```
├── src/
│   ├── routes/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── +server.js    # Chat API endpoint
│   │   │   └── health/
│   │   │       └── +server.js    # Health check endpoint
│   │   ├── +layout.svelte        # App layout
│   │   └── +page.svelte          # Main chat page
│   ├── lib/
│   │   └── components/           # Reusable components
│   │       ├── ChatMessage.svelte
│   │       └── ChatInput.svelte
│   └── app.css                   # Global styles
├── package.json
├── vite.config.js
├── svelte.config.js
└── index.html
```

## 🎨 Customization

### Styling

The app uses CSS custom properties for easy theming. Modify the variables in `src/app.css`:

```css
:root {
  --primary-color: #4285f4;      /* Main brand color */
  --secondary-color: #34a853;    /* Accent color */
  --background-color: #f8f9fa;   /* Background */
  --surface-color: #ffffff;      /* Card/surface color */
  --text-color: #202124;         /* Primary text */
  --text-secondary: #5f6368;     /* Secondary text */
}
```

### Gemini Configuration

Modify the Gemini model settings in `src/routes/api/chat/+server.js`:

```javascript
// Change the model
model: 'gemini-2.0-flash-001',  // or 'gemini-1.5-pro', 'gemini-1.5-flash'

// Adjust generation parameters
generationConfig: {
  temperature: 0.7,        // Creativity (0-1)
  topK: 40,               // Top K sampling
  topP: 0.95,             // Top P sampling
  maxOutputTokens: 1024,  // Max response length
}
```

## 🔧 API Reference

### POST `/api/chat`

Send a message to the chatbot.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "bot", 
      "content": "Previous response"
    }
  ]
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you! How can I help you today?",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GEMINI_API_KEY` environment variable in Vercel dashboard
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Add environment variables in Netlify dashboard

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for the powerful AI capabilities
- [SvelteKit](https://kit.svelte.dev/) for the amazing full-stack framework
- [Svelte](https://svelte.dev/) for the reactive frontend framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/gemini-chatbot/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Chatting! 🎉**
