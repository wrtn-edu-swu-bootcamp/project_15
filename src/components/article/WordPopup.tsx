'use client';

import { HighlightWord, AnalyzedExpression, AnalyzedGrammar, LEVEL_COLORS } from '@/types';

interface HighlightItem {
  type: 'word' | 'expression' | 'grammar';
  data: HighlightWord | AnalyzedExpression | AnalyzedGrammar;
  start: number;
  end: number;
}

interface WordPopupProps {
  item: HighlightItem;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function WordPopup({ item, position, onClose }: WordPopupProps) {
  const data = item.data;
  const level = 'level' in data ? data.level : 'B1';

  const renderWordContent = () => {
    const word = data as HighlightWord;
    return (
      <>
        <div className="font-bold text-lg mb-2">
          {word.word}
          <span className="text-sm text-gray-500 ml-2">({word.partOfSpeech})</span>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">🇰🇷</span> {word.meaning}
          </div>
          {word.tense && (
            <div>
              <span className="text-gray-500">⏱️ 시제:</span> {word.tense}
            </div>
          )}
          {word.gender && (
            <div>
              <span className="text-gray-500">⚧️ 성:</span> {word.gender === 'm' ? '남성' : '여성'}
            </div>
          )}
          {word.example && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-500">📝 예문:</span>
              <p className="italic text-gray-700 mt-1">{word.example}</p>
            </div>
          )}
        </div>
        {word.isUserAdded && (
          <div className="mt-2 text-xs text-[#6D5845] bg-[#6D5845]/10 px-2 py-1 rounded">
            ✨ 직접 추가한 단어
          </div>
        )}
      </>
    );
  };

  const renderExpressionContent = () => {
    const expression = data as AnalyzedExpression;
    return (
      <>
        <div className="font-bold text-lg mb-2">{expression.expression}</div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">🇰🇷</span> {expression.meaning}
          </div>
          <div>
            <span className="text-gray-500">💡</span> {expression.usage}
          </div>
          {expression.example && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-500">📝 예문:</span>
              <p className="italic text-gray-700 mt-1">{expression.example}</p>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderGrammarContent = () => {
    const grammar = data as AnalyzedGrammar;
    return (
      <>
        <div className="font-bold text-lg mb-1">{grammar.name}</div>
        <div className="text-sm text-gray-500 mb-2">{grammar.nameFr}</div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">📖</span> {grammar.explanation}
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">규칙:</span> {grammar.rule}
          </div>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-gray-500">본문:</span>
            <p className="italic text-[#6D5845] mt-1">"{grammar.foundText}"</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72"
      style={{
        left: Math.min(position.x - 144, window.innerWidth - 300),
        top: position.y,
      }}
    >
      {/* 급수 태그 */}
      <div className="flex justify-between items-center mb-3">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${LEVEL_COLORS[level]}`}>
          {level}
        </span>
        <span className="text-xs text-gray-400">
          {item.type === 'word' && '단어'}
          {item.type === 'expression' && '표현'}
          {item.type === 'grammar' && '문법'}
        </span>
      </div>

      {/* 콘텐츠 */}
      {item.type === 'word' && renderWordContent()}
      {item.type === 'expression' && renderExpressionContent()}
      {item.type === 'grammar' && renderGrammarContent()}

      {/* 더블클릭 안내 (단어인 경우) */}
      {item.type === 'word' && (
        <div className="mt-3 pt-2 border-t border-gray-100 text-center">
          <span className="text-xs text-gray-400">💡 더블클릭하여 냉장고에 저장</span>
        </div>
      )}
    </div>
  );
}
