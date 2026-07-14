import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { createInitialState, playTile, drawFromStock, getValidEnds, getAIMove, isGameBlocked, getBlockedWinner, canPlayerPlay, skipTurn } from '@/lib/gameEngine'
import { getBestMove, getHintMessage } from '@/lib/hintEngine'
import { soundEngine } from '@/lib/soundEngine'
import type { TileEnd } from '@/types/game'
import { ArrowLeft, RotateCcw, Trophy, Lightbulb } from 'lucide-react'
import TimerBar from '@/components/TimerBar'

export default function GameScreen() {
  const { setScreen, goBack, settings, playerName, playerAvatar } = useGameStore()

  const [gameState, setGameState] = useState<any | null>(null)
  const [selectedTile, setSelectedTile] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [aiThinking, setAiThinking] = useState(false)
  const [roundEnded, setRoundEnded] = useState(false)
  const [hintMessage, setHintMessage] = useState('')
  const [bestMove, setBestMove] = useState<{ tileIndex: number; end: TileEnd } | null>(null)
  const [timerKey, setTimerKey] = useState(0)

  const moveCountRef = useRef(0)

  const getTimeLimit = useCallback(() => {
    if (settings.timerMode === 'off') return 0
    if (settings.timerMode === 'custom') return settings.customTime || 30
    return 30
  }, [settings.timerMode, settings.customTime])

  useEffect(() => {
    soundEngine.resume()
    const state = createInitialState(
      [playerName || 'اللاعب', 'الكمبيوتر'],
      [playerAvatar || '/assets/avatar_default.png', '/assets/avatar_ai.png']
    )
    setGameState(state)
    moveCountRef.current = 0
    setRoundEnded(false)
    setHintMessage('')
    setBestMove(null)
    setTimerKey(prev => prev + 1)
  }, [playerName, playerAvatar])

  useEffect(() => {
    if (!gameState || gameState.isGameOver || roundEnded) {
      setHintMessage('')
      setBestMove(null)
      return
    }

    if (gameState.currentPlayerIndex === 0 && settings.showHints) {
      const hint = getBestMove(gameState, 0)
      if (hint) {
        setBestMove({ tileIndex: hint.tileIndex, end: hint.end })
        setHintMessage(hint.reason)
      } else {
        const msg = getHintMessage(gameState, 0)
        setHintMessage(msg)
        setBestMove(null)
      }
    } else {
      setHintMessage('')
      setBestMove(null)
    }
  }, [gameState, settings.showHints, roundEnded])

  // AI Turn
  useEffect(() => {
    if (!gameState || gameState.isGameOver || roundEnded) return
    if (gameState.currentPlayerIndex !== 1) return

    setAiThinking(true)
    const timer = setTimeout(() => {
      if (isGameBlocked(gameState.players, gameState.stock)) {
        const blockedWinner = getBlockedWinner(gameState)
        setGameState((prev: any) => prev ? { ...prev, isGameOver: true, winner: blockedWinner } : null)
        setAiThinking(false)
        setRoundEnded(true)
        return
      }

      if (!canPlayerPlay(gameState, 1)) {
        const newState = skipTurn(gameState)
        setGameState(newState)
        setMessage('الكمبيوتر لا يستطيع اللعب - تخطي')
        setAiThinking(false)
        setTimerKey(prev => prev + 1)
        return
      }

      const aiMove = getAIMove(gameState, settings.difficulty || 'easy')

      if (aiMove) {
        const result = playTile(gameState, 1, aiMove.tileIndex, aiMove.end)
        if (result.valid && result.newState) {
          moveCountRef.current += 1
          setGameState(result.newState)
          if (result.newState.isGameOver) {
            setRoundEnded(true)
          }
        }
      } else {
        if (gameState.stock.length > 0) {
          let newState = drawFromStock(gameState, 1)
          while (!canPlayerPlay(newState, 1) && newState.stock.length > 0) {
            newState = drawFromStock(newState, 1)
          }
          setGameState(newState)
        } else {
          const newState = skipTurn(gameState)
          setGameState(newState)
        }
      }
      setAiThinking(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [gameState, settings.difficulty, roundEnded])

  const handleTimeUp = useCallback(() => {
    if (!gameState || gameState.currentPlayerIndex !== 0) return

    soundEngine.playTimerWarning()

    if (gameState.stock.length > 0) {
      const newState = drawFromStock(gameState, 0)
      setGameState(newState)
      setMessage('انتهى الوقت! سحب تلقائي')
    } else {
      const newState = skipTurn(gameState)
      setGameState(newState)
      setMessage('انتهى الوقت! تخطي الدور')
    }
    setSelectedTile(null)
    setTimerKey(prev => prev + 1)
  }, [gameState])

  const handleTileClick = (index: number) => {
    if (!gameState || gameState.currentPlayerIndex !== 0 || aiThinking || roundEnded) return
    soundEngine.playClick()
    setSelectedTile(index === selectedTile ? null : index)
    setMessage('')
  }

  const handlePlay = (end: TileEnd) => {
    if (!gameState || selectedTile === null) return

    const result = playTile(gameState, 0, selectedTile, end)
    if (result.valid && result.newState) {
      soundEngine.playPlaceTile()
      moveCountRef.current += 1
      setGameState(result.newState)
      setSelectedTile(null)
      setMessage('')
      setTimerKey(prev => prev + 1)
    } else {
      setMessage('لا يمكن اللعب بهذا الحجر!')
    }
  }

  const handleDraw = () => {
    if (!gameState || gameState.currentPlayerIndex !== 0 || aiThinking || roundEnded) return
    if (gameState.stock.length === 0) {
      setMessage('المخزن فارغ!')
      return
    }

    const newState = drawFromStock(gameState, 0)
    setGameState(newState)
    soundEngine.playDrawTile()
    setMessage('سحبت حجراً من المخزن')
    setSelectedTile(null)
  }

  const handlePass = () => {
    if (!gameState || gameState.currentPlayerIndex !== 0 || aiThinking || roundEnded) return
    const newState = skipTurn(gameState)
    setGameState(newState)
    setMessage('تخطيت دورك')
    setSelectedTile(null)
    setTimerKey(prev => prev + 1)
  }

  const handleNewGame = () => {
    const state = createInitialState(
      [playerName || 'اللاعب', 'الكمبيوتر'],
      [playerAvatar || '/assets/avatar_default.png', '/assets/avatar_ai.png']
    )
    setGameState(state)
    moveCountRef.current = 0
    setRoundEnded(false)
    setMessage('')
    setSelectedTile(null)
    setTimerKey(prev => prev + 1)
  }

  if (!gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A0E08]">
        <div className="text-[#C9A84C] text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  const player = gameState.players[0]
  const opponent = gameState.players[1]
  const playableEnds = getValidEnds(gameState.boardTiles)

  return (
    <div className="fixed inset-0 flex flex-col bg-[#1A0E08] text-[#C9A84C] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-b from-[#2D1810] to-transparent">
        <button onClick={goBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs opacity-60">{player.name}</div>
            <div className="text-lg font-bold">{player.score}</div>
          </div>
          <div className="text-2xl">⚡</div>
          <div className="text-center">
            <div className="text-xs opacity-60">{opponent.name}</div>
            <div className="text-lg font-bold">{opponent.score}</div>
          </div>
        </div>
        <button onClick={handleNewGame} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Game Message */}
      {message && (
        <div className="text-center py-2 text-sm bg-[#C9A84C]/20 text-[#C9A84C]">
          {message}
        </div>
      )}

      {/* AI Thinking */}
      {aiThinking && (
        <div className="text-center py-2 text-sm text-[#C9A84C]/80">
          الكمبيوتر يفكر...
        </div>
      )}

      {/* Hint */}
      {hintMessage && settings.showHints && (
        <div className="text-center py-1 text-xs text-[#C9A84C]/60 flex items-center justify-center gap-1">
          <Lightbulb className="w-3 h-3" />
          {hintMessage}
        </div>
      )}

      {/* Board */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="flex items-center gap-1 px-4">
          {gameState.boardTiles.length === 0 ? (
            <div className="text-[#C9A84C]/30 text-sm">ابدأ اللعب!</div>
          ) : (
            gameState.boardTiles.map((tile: any, i: number) => (
              <div
                key={tile.tile.id}
                className="w-10 h-16 bg-[#FFF8F0] rounded border border-[#C9A84C]/30 flex flex-col items-center justify-center relative"
                style={{ transform: `rotate(${tile.rotation}deg)` }}
              >
                <div className="flex gap-0.5 flex-wrap justify-center w-6">
                  {Array.from({ length: tile.tile.top }).map((_, j) => (
                    <div key={j} className="w-1 h-1 rounded-full bg-[#1A1A1A]" />
                  ))}
                </div>
                <div className="w-6 h-px bg-[#C9A84C]/30 my-0.5" />
                <div className="flex gap-0.5 flex-wrap justify-center w-6">
                  {Array.from({ length: tile.tile.bottom }).map((_, j) => (
                    <div key={j} className="w-1 h-1 rounded-full bg-[#1A1A1A]" />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Timer */}
      {settings.timerMode !== 'off' && !roundEnded && (
        <div className="px-4 py-2">
          <TimerBar
            key={timerKey}
            duration={getTimeLimit()}
            onComplete={handleTimeUp}
            isRunning={gameState.currentPlayerIndex === 0 && !aiThinking}
          />
        </div>
      )}

      {/* Player Hand */}
      <div className="p-3 bg-gradient-to-t from-[#2D1810] to-transparent">
        <div className="flex items-center justify-center gap-2 mb-3">
          {player.tiles.map((tile: any, index: number) => {
            const isSelected = selectedTile === index
            const canPlay = gameState.currentPlayerIndex === 0 && !aiThinking && !roundEnded

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(index)}
                disabled={!canPlay}
                className={`relative w-12 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-[#C9A84C] bg-[#FFF8F0] scale-110 -translate-y-2 shadow-lg shadow-[#C9A84C]/30'
                    : canPlay
                    ? 'border-[#C9A84C]/30 bg-[#FFF8F0] hover:border-[#C9A84C]/60'
                    : 'border-white/10 bg-white/5 opacity-50'
                }`}
              >
                <div className="flex gap-1 flex-wrap justify-center w-8">
                  {Array.from({ length: tile.top }).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
                  ))}
                </div>
                <div className="w-8 h-px bg-[#C9A84C]/30 my-1" />
                <div className="flex gap-1 flex-wrap justify-center w-8">
                  {Array.from({ length: tile.bottom }).map((_, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* Action Buttons */}
        {gameState.currentPlayerIndex === 0 && !aiThinking && !roundEnded && (
          <div className="flex items-center justify-center gap-3">
            {selectedTile !== null && (
              <>
                <button
                  onClick={() => handlePlay('left')}
                  className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#1A0E08] font-bold text-sm"
                >
                  يسار
                </button>
                <button
                  onClick={() => handlePlay('right')}
                  className="px-4 py-2 rounded-lg bg-[#C9A84C] text-[#1A0E08] font-bold text-sm"
                >
                  يمين
                </button>
              </>
            )}
            <button
              onClick={handleDraw}
              className="px-4 py-2 rounded-lg bg-white/10 text-[#C9A84C] font-bold text-sm border border-[#C9A84C]/30"
            >
              سحب
            </button>
            <button
              onClick={handlePass}
              className="px-4 py-2 rounded-lg bg-white/10 text-[#C9A84C] font-bold text-sm border border-[#C9A84C]/30"
            >
              تخطي
            </button>
          </div>
        )}

        {roundEnded && (
          <div className="text-center py-2">
            <button
              onClick={handleNewGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-b from-[#C9A84C] to-[#A08030] text-[#1A0E08] font-bold"
            >
              لعبة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
