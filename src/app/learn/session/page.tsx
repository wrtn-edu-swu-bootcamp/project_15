'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HighlightedText from '@/components/article/HighlightedText';
import Sidebar from '@/components/article/Sidebar';
import { 
  CEFRLevel, 
  AnalysisResult, 
  HighlightWord, 
  AnalyzedExpression,
  AnalyzedGrammar,
  VocabularyByPOS,
  LEVEL_COLORS, 
  LEVEL_NAMES 
} from '@/types';
import { processAnalysisResult, createUserHighlightWord, TotalMatchStats } from '@/lib/textUtils';

interface SessionData {
  content: string;
  level: CEFRLevel;
  analysis: AnalysisResult;
  processed?: {
    words: HighlightWord[];
    expressions: AnalyzedExpression[];
    grammar: AnalyzedGrammar[];
    summary: AnalysisResult['summary'];
    keyPoints: string[];
  };
  stats?: TotalMatchStats;
}

interface ProcessedData {
  words: HighlightWord[];
  expressions: AnalyzedExpression[];
  grammar: AnalyzedGrammar[];
  summary: AnalysisResult['summary'];
  keyPoints: string[];
  vocabulary: VocabularyByPOS;
  stats: TotalMatchStats;
}

export default function LearnSessionPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [userWords, setUserWords] = useState<HighlightWord[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'word' | 'expression' | 'grammar'>('all');
  const [levelFilter, setLevelFilter] = useState<CEFRLevel[]>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [savedWords, setSavedWords] = useState<HighlightWord[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // 세션 스토리지에서 분석 데이터 불러오기
    const data = sessionStorage.getItem('analysisData');
    if (data) {
      try {
        const parsed = JSON.parse(data) as SessionData;
        setSessionData(parsed);
        
        // 서버에서 이미 처리된 데이터가 있으면 사용
        if (parsed.processed && parsed.stats) {
          setProcessedData({
            words: parsed.processed.words || [],
            expressions: parsed.processed.expressions || [],
            grammar: parsed.processed.grammar || [],
            summary: parsed.processed.summary || { topic: '', keyMessage: '' },
            keyPoints: parsed.processed.keyPoints || [],
            vocabulary: parsed.analysis?.vocabulary || { nouns: [], verbs: [], adjectives: [], adverbs: [], others: [] },
            stats: parsed.stats,
          });
        } else {
          // 클라이언트에서 처리
          const processed = processAnalysisResult(parsed.analysis, parsed.content);
          setProcessedData(processed);
        }
      } catch (error) {
        console.error('Failed to parse session data:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  // 모든 단어 (분석된 단어 + 사용자 추가 단어) 합치기
  const allWords = useMemo(() => {
    if (!processedData) return [];
    return [...processedData.words, ...userWords];
  }, [processedData, userWords]);

  const handleSaveWord = (word: HighlightWord) => {
    // 중복 체크
    if (savedWords.some((w) => w.word === word.word && w.foundForm === word.foundForm)) {
      alert('이미 저장된 단어입니다.');
      return;
    }
    setSavedWords([...savedWords, word]);
    alert(`"${word.word}"가 냉장고에 저장되었습니다! 🧊`);
  };

  const handleStartQuiz = () => {
    // 퀴즈 데이터를 세션에 저장하고 퀴즈 페이지로 이동
    sessionStorage.setItem('quizSessionData', JSON.stringify(sessionData));
    router.push('/quiz/session');
  };

  const handleTextSelection = async () => {
    if (!isHighlightMode || !sessionData) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    // API 호출하여 분석
    try {
      const response = await fetch('/api/articles/analyze-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          context: sessionData.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 사용자 추가 단어 생성
        const newWord = createUserHighlightWord(
          data.word?.word || selectedText,
          data.word?.foundForm || selectedText,
          data.word?.meaningKo || data.word?.meaning || '의미 분석 중',
          data.word?.level || 'B1',
          data.word?.partOfSpeech || 'n.',
          data.word?.example || '',
          sessionData.content
        );
        
        if (newWord) {
          setUserWords([...userWords, newWord]);
          alert(`"${selectedText}"가 분석되어 추가되었습니다! 🔪`);
        } else {
          alert('텍스트에서 해당 단어를 찾을 수 없습니다.');
        }
      } else {
        alert('분석에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Selection analysis error:', error);
      alert('분석 중 오류가 발생했습니다.');
    }

    selection.removeAllRanges();
  };

  if (!sessionData || !processedData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFBF7' }}>
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🍳</div>
          <p className="text-gray-600">요리 준비 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFFBF7' }}>
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 홈
              </button>
              <span className={`px-3 py-1 rounded-lg font-semibold ${LEVEL_COLORS[sessionData.level]}`}>
                {sessionData.level} {LEVEL_NAMES[sessionData.level]}
              </span>
              <h1 className="text-lg font-semibold text-gray-800">기사 학습</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 디버그 토글 (개발용) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {showDebug ? '디버그 숨기기' : '디버그'}
                </button>
              )}
              
              {/* 재료 손질하기 토글 */}
              <button
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isHighlightMode
                    ? 'bg-[#6D5845] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔪 재료 손질하기 {isHighlightMode ? 'ON' : 'OFF'}
              </button>
              
              {/* 퀴즈 시작 */}
              <button
                onClick={handleStartQuiz}
                className="px-6 py-2 bg-[#6D5845] text-white rounded-lg font-semibold hover:bg-[#5A4839] transition-colors"
              >
                🍳 퀴즈 시작
              </button>
            </div>
          </div>
        </div>

        {/* 디버그 정보 */}
        {showDebug && processedData.stats && (
          <div className="bg-gray-900 text-green-400 px-6 py-3 text-xs font-mono overflow-x-auto">
            <div className="flex gap-6">
              <span>📊 매칭률: {processedData.stats.matchRate}%</span>
              <span>총 항목: {processedData.stats.totalItems}</span>
              <span>매칭 성공: {processedData.stats.totalMatched}</span>
              <span>단어: {processedData.words.length}개</span>
              <span>표현: {processedData.expressions.filter(e => e.position).length}개</span>
              <span>문법: {processedData.grammar.filter(g => g.position).length}개</span>
            </div>
            {processedData.stats.vocabulary.notFoundItems.length > 0 && (
              <div className="mt-2 text-yellow-400">
                ⚠️ 매칭 실패: {processedData.stats.vocabulary.notFoundItems.slice(0, 5).join(', ')}
                {processedData.stats.vocabulary.notFoundItems.length > 5 && ` 외 ${processedData.stats.vocabulary.notFoundItems.length - 5}개`}
              </div>
            )}
          </div>
        )}

        {/* 요약 및 핵심 포인트 */}
        {processedData.summary && processedData.summary.topic && (
          <div className="bg-[#FDF5ED] px-6 py-4 border-b border-[#E5DDD4]">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-bold text-[#6D5845] mb-2">📋 {processedData.summary.topic}</h2>
              <p className="text-sm text-gray-700">{processedData.summary.keyMessage}</p>
            </div>
          </div>
        )}

        {/* 색상 범례 */}
        <div className="bg-gray-50 px-6 py-2 border-b border-gray-200">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-gray-500">급수 색상:</span>
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((level) => (
              <span
                key={level}
                className={`px-2 py-0.5 rounded ${LEVEL_COLORS[level]}`}
              >
                {level}
              </span>
            ))}
            <span className="ml-4 text-gray-500">|</span>
            <span className="text-gray-500 ml-2">
              <span className="border border-dashed border-gray-400 px-1 rounded">점선</span> = 사용자 추가
            </span>
          </div>
        </div>

        {/* 재료 손질 모드 안내 */}
        {isHighlightMode && (
          <div className="bg-[#6D5845]/10 px-6 py-3 border-b border-[#6D5845]/20">
            <p className="text-sm text-[#6D5845]">
              🔪 <strong>재료 손질 모드 활성화!</strong> 텍스트를 드래그하여 분석하고 싶은 부분을 선택하세요.
            </p>
          </div>
        )}

        {/* 핵심 포인트 */}
        {processedData.keyPoints && processedData.keyPoints.length > 0 && (
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="max-w-3xl mx-auto">
              <h3 className="font-semibold text-gray-800 mb-2">💡 학습 포인트</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {processedData.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#6D5845]">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 분석 결과 요약 바 */}
        <div className="bg-white px-6 py-3 border-b border-gray-200">
          <div className="max-w-3xl mx-auto flex items-center gap-6 text-sm">
            <span className="text-gray-500">분석 결과:</span>
            <span className="text-[#6D5845] font-medium">
              📝 단어 {allWords.length}개
            </span>
            <span className="text-[#6D5845] font-medium">
              💬 표현 {processedData.expressions.filter(e => e.position).length}개
            </span>
            <span className="text-[#6D5845] font-medium">
              📖 문법 {processedData.grammar.filter(g => g.position).length}개
            </span>
            {processedData.stats && (
              <span className="text-gray-400 text-xs ml-auto">
                매칭률 {processedData.stats.matchRate}%
              </span>
            )}
          </div>
        </div>

        {/* 기사 본문 */}
        <div
          className="flex-1 p-8 overflow-y-auto bg-white"
          onMouseUp={isHighlightMode ? handleTextSelection : undefined}
          style={{ cursor: isHighlightMode ? 'text' : 'default' }}
        >
          <div className="max-w-3xl mx-auto">
            <HighlightedText
              content={sessionData.content}
              words={allWords}
              expressions={processedData.expressions}
              grammar={processedData.grammar}
              levelFilter={levelFilter}
              activeTab={activeTab}
              onSaveWord={handleSaveWord}
            />
          </div>
        </div>
      </div>

      {/* 사이드바 */}
      <Sidebar
        vocabulary={processedData.vocabulary}
        words={allWords}
        expressions={processedData.expressions}
        grammar={processedData.grammar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        onSaveWord={handleSaveWord}
      />
    </div>
  );
}
