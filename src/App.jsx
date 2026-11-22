import StoryCanvas from './components/StoryCanvas';
import LettersAndVoices from './components/LettersAndVoices';

export default function App() {
  return (
    <main className="bg-[#080608] text-white antialiased">
      {/* StoryCanvas finishes all 1,440 frames first, then holds on frame 1440 while the sheet rises */}
      <div className="relative">
        <StoryCanvas />
        <div className="h-screen pointer-events-none" />
      </div>

      <div className="-mt-[100vh] relative z-20">
        <LettersAndVoices />
      </div>
    </main>
  );
}