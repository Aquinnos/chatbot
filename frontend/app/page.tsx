import Chatbot from '@/components/Chatbot';

export default function Home() {
  return (
    <main className="p-4 h-[100vh]">
      <h1 className="text-xl font-bold mb-4 p-2 text-center">
        Chatbot with GLHF API
      </h1>
      <Chatbot />
    </main>
  );
}
