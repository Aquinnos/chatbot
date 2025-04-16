const offlineResponses = [
  "This is a response generated locally in offline mode. You currently don't have a configured connection to the GLHF API.",
  'Offline mode active. This response is generated locally because no API key was detected.',
  'To use the full functionality of the chat, set the API key in the environment variables (GLHF_API_KEY).',
  'This response is simulated. In offline mode, there is no ability to generate content using a language model.',
  'This is the demo mode of the application. Add an API key to use language models.',
];

export function getOfflineResponse(): string {
  const randomIndex = Math.floor(Math.random() * offlineResponses.length);
  return offlineResponses[randomIndex];
}

export function isApiConfigured(): boolean {
  return (
    typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    !!process.env.GLHF_API_KEY
  );
}
