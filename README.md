# Chatbot with GLHF API

A modern, responsive chatbot application built with Next.js and the GLHF API. This application allows users to have interactive conversations with various state-of-the-art AI language models, including Llama, DeepSeek, Mixtral, and more.

## Features

- **Interactive Chat Interface**: Clean and responsive UI for chatting with AI models
- **Extensive Model Support**: Select from 18 different GLHF-powered AI models
- **Smart Model Switching**: Prevents confusion by restricting model changes in active chats
- **DeepSeek R1 Integration**: Special support for viewing thinking processes in DeepSeek R1 responses
- **Enhanced Code Handling**: Code blocks with syntax highlighting and improved copy-to-clipboard functionality
- **Chat Management**: Create, switch between, and delete conversations
- **Persistent Storage**: Conversations and settings are saved in localStorage
- **Customizable Generation Settings**: Adjust parameters like temperature, max tokens, etc.
- **Offline Mode**: Fallback responses when API key is not configured
- **Mobile-Friendly Design**: Responsive layout with collapsible sidebar for mobile devices
- **Dark Mode Support**: Full compatibility with light and dark themes
- **Smart URL Handling**: Auto-detects and formats clickable URLs with expansion options

## Tech Stack

- **Next.js 15.x**: React framework for the frontend
- **React 19.x**: For building the user interface
- **TypeScript**: Type-safe code
- **TailwindCSS**: For styling
- **Express.js**: For backend server
- **OpenAI SDK**: For communication with the GLHF API
- **localStorage API**: For client-side data persistence
- **Markdown Support**: For rendering rich text and code blocks

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- GLHF API key (optional for full functionality)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/chatbot.git
cd chatbot
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your GLHF API key:

```
GLHF_API_KEY=your_api_key_here
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- Start a new chat using the "+" button in the sidebar
- Type your message in the input field at the bottom
- Select different AI models using the model selector in the header
- Adjust generation settings using the "⚙️ Settings" button
- View all available models on the Models page
- Save and manage multiple chat conversations
- For DeepSeek R1 model: Toggle between showing/hiding the thinking process
- Copy code blocks with enhanced visual feedback

## Advanced Features

### Model Switching Protection

To prevent confusion in conversations:

- When attempting to switch models in a chat with existing messages, you'll see a warning dialog
- You can choose to either start a new chat with the selected model or keep using the current model

### DeepSeek R1 Support

The application has special support for DeepSeek R1's unique response format:

- Thinking process is hidden by default but can be expanded
- The final answer is always visible
- Toggle between showing and hiding the thinking process with a single click

### Enhanced Copy to Clipboard

When copying code:

- Visual feedback shows when code has been successfully copied
- "Copied!" notification appears with a smooth animation
- Copy button changes color to confirm the action

## Project Structure

```
chatbot/
├── app/                    # Next.js app router files
│   ├── api/                # API routes
│   │   ├── chat/           # Chat API endpoint
│   │   └── verify-key/     # API key verification endpoint
│   ├── models/             # Models selection page
│   └── page.tsx            # Main application page
├── components/             # React components
│   ├── Chatbot.tsx         # Main chatbot component
│   ├── chat/               # Chat-related components
│   │   ├── ApiKeyDialog.tsx        # API key configuration dialog
│   │   ├── ChatHeader.tsx          # Chat header with controls
│   │   ├── MessageList.tsx         # Message rendering
│   │   ├── ModelSwitchDialog.tsx   # Model switching warning dialog
│   │   └── useChat.ts              # Core chat functionality hook
│   └── ui/                 # UI components
│       ├── model-selector.tsx
│       └── placeholders-and-vanish-input.tsx
├── lib/                    # Utilities and configuration
│   ├── glhf.ts             # GLHF API client
│   ├── models.ts           # Model definitions (18 models available)
│   ├── offline-mode.ts     # Offline mode functionality
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

## Configuration

The chatbot can be configured through the UI with these settings:

- **Temperature**: Controls randomness (0-2)
- **Max Tokens**: Maximum number of tokens in the response (50-1000)
- **Top P**: Nucleus sampling parameter (0-1)
- **Frequency Penalty**: Reduces repetition (0-2)
- **Presence Penalty**: Encourages topic diversity (0-2)

## Offline Mode

When no GLHF API key is provided, the application automatically switches to offline mode, providing simulated responses. This is useful for testing the UI without API calls.

## API Key Management

Users can add their own GLHF API key through the UI:

1. Click on the "🔑 API Key" button in the header
2. Enter your API key
3. The application will verify the key and save it in localStorage

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [GLHF API](https://glhf.chat) - AI API provider
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [ReactMarkdown](https://github.com/remarkjs/react-markdown) - Markdown rendering
