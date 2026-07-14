import { useGameStore } from '@/store/gameStore';
import TitleScreen from '@/screens/TitleScreen';
import MainMenu from '@/screens/MainMenu';
import LevelSelect from '@/screens/LevelSelect';
import GameScreen from '@/screens/GameScreen';
import MatchEndScreen from '@/screens/MatchEndScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import StatisticsScreen from '@/screens/StatisticsScreen';
import { useEffect, useState } from 'react';

export default function App() {
  const { currentScreen } = useGameStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setError(e.message);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A0E08] text-[#C9A84C] p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">خطأ</h1>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'title':
        return <TitleScreen />;
      case 'menu':
        return <MainMenu />;
      case 'levelSelect':
        return <LevelSelect />;
      case 'playing':
        return <GameScreen />;
      case 'matchEnd':
        return <MatchEndScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'statistics':
        return <StatisticsScreen />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1A0E08]">
      {renderScreen()}
    </div>
  );
}
