# Chatbot with GLHF API

A modern, responsive chatbot application built with Next.js and the GLHF API (based on OpenAI). This application allows users to have interactive conversations with various AI language models.

## Features

- **Interactive Chat Interface**: Clean and responsive UI for chatting with AI models
- **Multiple Model Support**: Select from a variety of GLHF-powered AI models
- **Chat Management**: Create, switch between, and delete conversations
- **Persistent Storage**: Conversations and settings are saved in localStorage
- **Customizable Generation Settings**: Adjust parameters like temperature, max tokens, etc.
- **Offline Mode**: Fallback responses when API key is not configured
- **Mobile-Friendly Design**: Responsive layout with collapsible sidebar for mobile devices
- **Dark Mode Support**: Full compatibility with light and dark themes

## Tech Stack

- **Next.js 15.x**: React framework for the frontend
- **React 19.x**: For building the user interface
- **TypeScript**: Type-safe code
- **TailwindCSS**: For styling
- **OpenAI SDK**: For communication with the GLHF API
- **localStorage API**: For client-side data persistence
- **Motion**: For animations

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

## Project Structure

```
chatbot/
├── app/                   # Next.js app router files
│   ├── api/               # API routes
│   │   └── chat/          # Chat API endpoint
│   ├── models/            # Models selection page
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Chatbot.tsx        # Main chatbot component
│   └── ui/                # UI components
│       ├── model-selector.tsx
│       └── placeholders-and-vanish-input.tsx
├── lib/                   # Utilities and configuration
│   ├── glhf.ts            # GLHF API client
│   ├── models.ts          # Model definitions
│   ├── offline-mode.ts    # Offline mode functionality
│   └── utils.ts           # Helper functions
└── public/                # Static assets
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

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [GLHF API](https://glhf.chat) - AI API provider
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [React](https://reactjs.org/) - UI library
