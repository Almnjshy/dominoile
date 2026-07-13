import { useGameStore } from '@/store/gameStore';
import { LEVELS } from '@/types/game';
import { ChevronRight, Star, Trophy, Target, Flame, TrendingUp } from 'lucide-react';

export default function StatisticsScreen() {
  const { progress, setScreen } = useGameStore();

  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);
  const maxStars = 30; // 10 levels * 3 stars

  const stats = [
    {
      icon: Trophy,
      label: 'إجمالي الفوز',
      value: progress.totalWins,
      color: '#C9A84C',
    },
    {
      icon: Target,
      label: 'إجمالي الخسارة',
      value: progress.totalLosses,
      color: '#E74C3C',
    },
    {
      icon: Star,
      label: 'إجمالي النقاط',
      value: progress.totalScore,
      color: '#C9A84C',
    },
    {
      icon: TrendingUp,
      label: 'أعلى نتيجة',
      value: progress.highestScore,
      color: '#2ECC40',
    },
    {
      icon: Flame,
      label: 'أطول سلسلة',
      value: progress.longestChain,
      color: '#F39C12',
    },
  ];

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
          <ChevronRight className="w-6 h-6 text-[#C9A84C]" />
        </button>
        <h1 className="text-2xl font-bold text-white font-arabic">الإحصائيات</h1>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-6 py-4 overflow-y-auto">
        {/* Overall progress */}
        <div className="glass-panel rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#B8A080] text-sm font-arabic">التقدم العام</span>
            <span className="text-[#C9A84C] font-bold">
              {Math.round((totalStars / maxStars) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(totalStars / maxStars) * 100}%`,
                background: 'linear-gradient(90deg, #C9A84C, #E8D594)',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#C9A84C] fill-[#C9A84C]" />
              <span className="text-white text-sm">{totalStars}</span>
              <span className="text-[#B8A080] text-xs">/ {maxStars}</span>
            </div>
            <span className="text-[#B8A080] text-xs font-arabic">
              {progress.unlockedLevel} / 10 مراحل
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                <span className="text-[#B8A080] text-xs font-arabic">{stat.label}</span>
              </div>
              <p className="text-white text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Level progress */}
        <div className="glass-panel rounded-2xl p-4">
          <h3 className="text-[#C9A84C] font-bold font-arabic mb-3">تقدم المراحل</h3>
          <div className="space-y-2">
            {LEVELS.map((level) => {
              const stars = progress.levelStars[level.level] || 0;
              const isUnlocked = level.level <= progress.unlockedLevel;

              return (
                <div
                  key={level.level}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isUnlocked ? 'bg-white/5' : 'bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isUnlocked
                          ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {level.level}
                    </span>
                    <div>
                      <p className={`text-sm font-arabic ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                        {level.nameAr}
                      </p>
                      <p className="text-[#B8A080] text-xs">{level.targetScore} نقطة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= stars
                            ? 'text-[#C9A84C] fill-[#C9A84C]'
                            : 'text-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
