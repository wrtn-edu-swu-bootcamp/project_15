'use client';

import { useState } from 'react';
import { 
  HighlightWord, 
  AnalyzedExpression, 
  AnalyzedGrammar, 
  VocabularyByPOS,
  CEFRLevel, 
  LEVEL_COLORS 
} from '@/types';

interface SidebarProps {
  vocabulary: VocabularyByPOS;
  words: HighlightWord[];
  expressions: AnalyzedExpression[];
  grammar: AnalyzedGrammar[];
  activeTab: 'all' | 'word' | 'expression' | 'grammar';
  setActiveTab: (tab: 'all' | 'word' | 'expression' | 'grammar') => void;
  levelFilter: CEFRLevel[];
  setLevelFilter: (levels: CEFRLevel[]) => void;
  onSaveWord?: (word: HighlightWord) => void;
}

type PosTab = 'all' | 'nouns' | 'verbs' | 'adjectives' | 'adverbs' | 'others';

const ALL_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const POS_LABELS: Record<PosTab, string> = {
  all: '전체',
  nouns: '명사',
  verbs: '동사',
  adjectives: '형용사',
  adverbs: '부사',
  others: '기타',
};

export default function Sidebar({
  vocabulary,
  words,
  expressions,
  grammar,
  activeTab,
  setActiveTab,
  levelFilter,
  setLevelFilter,
  onSaveWord,
}: SidebarProps) {
  const [posTab, setPosTab] = useState<PosTab>('all');

  const toggleLevel = (level: CEFRLevel) => {
    if (levelFilter.includes(level)) {
      setLevelFilter(levelFilter.filter((l) => l !== level));
    } else {
      setLevelFilter([...levelFilter, level]);
    }
  };

  // 급수 필터 적용
  const filteredWords = words.filter((w) => levelFilter.includes(w.level));
  const filteredExpressions = expressions.filter((e) => levelFilter.includes(e.level));
  const filteredGrammar = grammar.filter((g) => levelFilter.includes(g.level));

  // 품사별 필터링
  const getFilteredWordsByPOS = () => {
    if (posTab === 'all') return filteredWords;
    
    const posMapping: Record<PosTab, string[]> = {
      all: [],
      nouns: ['n.', 'n.m.', 'n.f.'],
      verbs: ['v.'],
      adjectives: ['adj.'],
      adverbs: ['adv.'],
      others: ['prép.', 'conj.', 'pron.', 'art.', 'interj.'],
    };
    
    return filteredWords.filter((w) => 
      posMapping[posTab].some((pos) => w.partOfSpeech.toLowerCase().includes(pos.toLowerCase()))
    );
  };

  const displayedWords = getFilteredWordsByPOS();

  // 품사별 개수 계산
  const getPOSCount = (pos: PosTab) => {
    if (pos === 'all') return filteredWords.length;
    
    const posMapping: Record<PosTab, string[]> = {
      all: [],
      nouns: ['n.', 'n.m.', 'n.f.'],
      verbs: ['v.'],
      adjectives: ['adj.'],
      adverbs: ['adv.'],
      others: ['prép.', 'conj.', 'pron.', 'art.', 'interj.'],
    };
    
    return filteredWords.filter((w) => 
      posMapping[pos].some((p) => w.partOfSpeech.toLowerCase().includes(p.toLowerCase()))
    ).length;
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 메인 탭 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-[#6D5845] border-b-2 border-[#6D5845]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveTab('word')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'word'
              ? 'text-[#6D5845] border-b-2 border-[#6D5845]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          단어 ({filteredWords.length})
        </button>
        <button
          onClick={() => setActiveTab('expression')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'expression'
              ? 'text-[#6D5845] border-b-2 border-[#6D5845]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          표현 ({filteredExpressions.length})
        </button>
        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'grammar'
              ? 'text-[#6D5845] border-b-2 border-[#6D5845]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          문법 ({filteredGrammar.length})
        </button>
      </div>

      {/* 급수 필터 */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm text-gray-500 mb-2">급수 필터:</p>
        <div className="flex flex-wrap gap-2">
          {ALL_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`px-2 py-1 text-xs rounded transition-all ${
                levelFilter.includes(level)
                  ? `${LEVEL_COLORS[level]} font-semibold`
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* 품사별 서브탭 (단어 탭일 때만) */}
      {(activeTab === 'word' || activeTab === 'all') && (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-1">
            {(Object.keys(POS_LABELS) as PosTab[]).map((pos) => (
              <button
                key={pos}
                onClick={() => setPosTab(pos)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  posTab === pos
                    ? 'bg-[#6D5845] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {POS_LABELS[pos]} ({getPOSCount(pos)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {(activeTab === 'word' || activeTab === 'all') && (
          <div className="space-y-3">
            {displayedWords.map((word, idx) => (
              <div 
                key={idx} 
                className={`p-3 bg-gray-50 rounded-lg ${word.isUserAdded ? 'border border-dashed border-[#6D5845]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{word.word}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${LEVEL_COLORS[word.level]}`}>
                    {word.level}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  ({word.partOfSpeech})
                  {word.tense && <span className="ml-1 text-[#6D5845]">• {word.tense}</span>}
                  {word.gender && <span className="ml-1">• {word.gender === 'm' ? '남성' : '여성'}</span>}
                </p>
                <p className="text-sm text-gray-700 mt-1">{word.meaning}</p>
                {word.isUserAdded && (
                  <span className="inline-block mt-1 text-xs text-[#6D5845] bg-[#6D5845]/10 px-1 rounded">
                    ✨ 직접 추가
                  </span>
                )}
                {onSaveWord && (
                  <button
                    onClick={() => onSaveWord(word)}
                    className="mt-2 text-xs text-[#6D5845] hover:underline"
                  >
                    + 🧊 냉장고 보관
                  </button>
                )}
              </div>
            ))}
            {displayedWords.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                선택한 조건의 단어가 없습니다.
              </p>
            )}
          </div>
        )}

        {activeTab === 'expression' && (
          <div className="space-y-3">
            {filteredExpressions.map((expr, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{expr.expression}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${LEVEL_COLORS[expr.level]}`}>
                    {expr.level}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{expr.meaning}</p>
                <p className="text-xs text-gray-500 mt-1">{expr.usage}</p>
              </div>
            ))}
            {filteredExpressions.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                선택한 급수의 표현이 없습니다.
              </p>
            )}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="space-y-3">
            {filteredGrammar.map((gram, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{gram.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${LEVEL_COLORS[gram.level]}`}>
                    {gram.level}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{gram.nameFr}</p>
                <p className="text-sm text-gray-700 mt-1">{gram.explanation}</p>
                <p className="text-xs text-[#6D5845] mt-2 italic">"{gram.foundText}"</p>
              </div>
            ))}
            {filteredGrammar.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                선택한 급수의 문법이 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
