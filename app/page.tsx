import { getSiteConfig, getThemeConfig, getActiveMusic, getMemories } from '@/app/actions';
import Hero from '@/components/Hero';
import Timer from '@/components/Timer';
import MemoryGrid from '@/components/MemoryGrid';
import LoveLetter from '@/components/LoveLetter';
import MusicPlayer from '@/components/MusicPlayer';

export default async function Home() {
  const siteConfig = await getSiteConfig();
  const themeConfig = await getThemeConfig();
  const activeMusic = await getActiveMusic();
  const memories = await getMemories();

  // Defaults if DB is empty
  const heroTitle = siteConfig?.hero_title || 'Happy Anniversary';
  const partnerName = siteConfig?.partner_name || 'My Love';
  const anniversaryDate = siteConfig?.anniversary_date || new Date();
  const loveLetterContent = siteConfig?.love_letter_content || 'I love you...';
  // const primaryColor = themeConfig?.primary_color || '#ff6b6b'; // Unused in this version

  return (
    <main className="min-h-screen relative selection:bg-pink-200">
      <MusicPlayer url={activeMusic?.url || null} title={activeMusic?.title || null} />

      <Hero partnerName={partnerName} />

      <Timer startDate={anniversaryDate} />

      <MemoryGrid memories={memories} />

      <LoveLetter content={loveLetterContent} />

      <footer className="text-center py-8 text-gray-400 text-sm">Made with ❤️ for {partnerName}</footer>
    </main>
  );
}
