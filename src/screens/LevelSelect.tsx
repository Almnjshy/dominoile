import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/types/game';
import { Lock, Star, ChevronLeft } from 'lucide-react';

export default function LevelSelect() {
  const { setScreen, setCurrentLevel, progress, setScreen: setScreenFn } = useGameStore();

  const handleLevelClick = (level: number) => {
    if (level > progress.unlockedLevel) return;
    setCurrentLevel(level);
    setScreenFn('playing');
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/wood_panel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 p-4">
        <button
          onClick={() => setScreen('menu')}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-[#C9A84C]" />
        </button>
        <h1 className="text-2xl font-bold text-white font-arabic">اختر المرحلة</h1>
      </div>

      {/* Level Grid */}
      <div className="relative z-10 flex-1 px-6 py-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {LEVELS.map((level) => {
            const isUnlocked = level.level <= progress.unlockedLevel;
            const stars = progress.levelStars[level.level] || 0;
            const levelColors = [
              'from-green-600 to-green-800',
              'from-green-500 to-green-700',
              'from-blue-500 to-blue-700',
              'from-blue-600 to-blue-800',
              'from-purple-500 to-purple-700',
              'from-purple-600 to-purple-800',
              'from-orange-500 to-orange-700',
              'from-red-500 to-red-700',
              'from-red-600 to-red-800',
              'from-[#C9A84C] to-[#A08030]',
            ];

            return (
              <button
                key={level.level}
                onClick={() => handleLevelClick(level.level)}
                disabled={!isUnlocked}
                className={`relative p-4 rounded-2xl transition-all duration-200 ${
                  isUnlocked
                    ? 'hover:scale-[1.03] active:scale-[0.97] cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  background: isUnlocked
                    ? `linear-gradient(135deg, ${levelColors[level.level - 1].replace('from-', '').replace(' to-', ' 0%, ').split(' ')[0]} 0%, ${levelColors[level.level - 1].replace('from-', '').replace(' to-', ' 0%, ').split(' ').pop()} 100%)`
                    : 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)',
                  boxShadow: isUnlocked
                    ? '0 4px 0 rgba(0,0,0,0.4), 0 6px 20px rgba(0,0,0,0.3)'
                    : 'none',
                }}
              >
                {/* Level number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-white">{level.level}</span>
                  {!isUnlocked && (
                    <Lock className="w-5 h-5 text-white/50" />
                  )}
                </div>

                {/* Level name */}
                <h3 className="text-white font-bold text-sm font-arabic text-right mb-1">
                  {level.nameAr}
                </h3>

                {/* Target score */}
                <p className="text-white/60 text-xs font-arabic text-right">
                  {level.targetScore} نقطة
                </p>

                {/* Stars */}
                {isUnlocked && (
                  <div className="flex justify-end gap-1 mt-2">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Active indicator */}
                {isUnlocked && level.level === progress.unlockedLevel && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A84C] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress summary */}
      <div className="relative z-10 p-4">
        <div className="glass-panel rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#C9A84C] fill-[#C9A84C]" />
            <span className="text-white font-bold">
              {Object.values(progress.levelStars).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <span className="text-[#B8A080] text-sm font-arabic">
            من أصل {progress.unlockedLevel * 3} نجمة
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[#C9A84C] font-bold">{progress.unlockedLevel}</span>
            <span className="text-[#B8A080] text-sm font-arabic">/ 10 مراحل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
