import { useGameStore } from '@/store/gameStore';
import { Star, RotateCcw, Home, ChevronLeft } from 'lucide-react';

export default function MatchEndScreen() {
  const {
    matchWinner,
    matchScores,
    players,
    currentLevel,
    setScreen,
  } = useGameStore();

  const humanPlayer = players.find((p) => p.isHuman);
  const humanWon = humanPlayer?.id === matchWinner;
  const humanScore = matchScores[0] || 0;
  const aiScore = Math.max(...matchScores.slice(1));
  const margin = humanScore - aiScore;

  const stars = humanWon ? (margin >= 40 ? 3 : margin >= 20 ? 2 : 1) : 0;

  const handleNextLevel = () => {
    if (humanWon && currentLevel < 10) {
      setScreen('levelSelect');
    } else {
      setScreen('menu');
    }
  };

  const handleReplay = () => {
    setScreen('playing');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/wood_panel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className={`absolute inset-0 ${humanWon ? 'bg-black/60' : 'bg-black/70'}`} />

      {/* Confetti effect for win */}
      {humanWon && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: -20,
                animation: `confetti ${3 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  background: ['#C9A84C', '#2ECC40', '#E74C3C', '#2B5A9E', '#6B3FA0'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        {/* Trophy or result */}
        <div className="mb-4">
          {humanWon ? (
            <img
              src="/assets/trophy.png"
              alt="Trophy"
              className="w-24 h-24 object-contain animate-bounce"
              style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.6))' }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#E74C3C]/20 flex items-center justify-center">
              <span className="text-5xl">😔</span>
            </div>
          )}
        </div>

        {/* Result text */}
        <h1
          className={`text-4xl font-bold font-arabic mb-2 ${
            humanWon ? 'gold-text' : 'text-[#E74C3C]'
          }`}
        >
          {humanWon ? 'فزت!' : 'خسرت!'}
        </h1>

        {/* Level name */}
        <p className="text-[#B8A080] text-sm font-arabic mb-6">
          المرحلة {currentLevel}
        </p>

        {/* Stars */}
        {humanWon && (
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-10 h-10 transition-all duration-500 ${
                  s <= stars
                    ? 'text-[#C9A84C] fill-[#C9A84C] scale-100'
                    : 'text-white/20 scale-75'
                }`}
                style={{
                  animation: s <= stars ? `scaleIn 0.5s ease-out ${s * 0.3}s both` : 'none',
                  filter: s <= stars ? 'drop-shadow(0 0 8px rgba(201,168,76,0.6))' : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Score panel */}
        <div className="wood-panel rounded-xl p-4 w-full mb-6">
          <h3 className="text-[#C9A84C] text-sm font-arabic text-center mb-3">النتيجة النهائية</h3>
          <div className="space-y-2">
            {players.map((player, i) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  player.id === matchWinner ? 'bg-[#C9A84C]/20' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-white text-sm font-arabic">{player.name}</span>
                </div>
                <span className={`font-bold ${player.id === matchWinner ? 'text-[#C9A84C]' : 'text-white'}`}>
                  {matchScores[i] || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Margin */}
          {humanWon && (
            <div className="mt-3 pt-3 border-t border-[#C9A84C]/20 text-center">
              <span className="text-[#C9A84C] text-sm font-arabic">
                فارق النقاط: +{margin}
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {humanWon && currentLevel < 10 && (
            <button
              onClick={handleNextLevel}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              المرحلة التالية
            </button>
          )}
          <button
            onClick={handleReplay}
            className="btn-green w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة اللعب
          </button>
          <button
            onClick={() => setScreen('menu')}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold font-arabic hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            القائمة الرئيسية
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
