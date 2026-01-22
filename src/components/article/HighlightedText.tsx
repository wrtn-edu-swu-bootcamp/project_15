'use client';

import { useState, useMemo } from 'react';
import { HighlightWord, AnalyzedExpression, AnalyzedGrammar, CEFRLevel, Position } from '@/types';
import WordPopup from './WordPopup';

interface HighlightItem {
  type: 'word' | 'expression' | 'grammar';
  data: HighlightWord | AnalyzedExpression | AnalyzedGrammar;
  start: number;
  end: number;
}

interface HighlightedTextProps {
  content: string;
  words: HighlightWord[];
  expressions: AnalyzedExpression[];
  grammar: AnalyzedGrammar[];
  levelFilter: CEFRLevel[];
  activeTab: 'all' | 'word' | 'expression' | 'grammar';
  onSaveWord?: (word: HighlightWord) => void;
}

const LEVEL_HIGHLIGHT_CLASSES: Record<CEFRLevel, string> = {
  A1: 'highlight-a1',
  A2: 'highlight-a2',
  B1: 'highlight-b1',
  B2: 'highlight-b2',
  C1: 'highlight-c1',
  C2: 'highlight-c2',
};

export default function HighlightedText({
  content,
  words,
  expressions,
  grammar,
  levelFilter,
  activeTab,
  onSaveWord,
}: HighlightedTextProps) {
  const [hoveredItem, setHoveredItem] = useState<HighlightItem | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // 현재 탭과 레벨 필터에 따라 하이라이트할 항목들을 정렬
  const highlights = useMemo(() => {
    const items: HighlightItem[] = [];

    // 단어 (activeTab이 'all' 또는 'word'인 경우)
    if (activeTab === 'all' || activeTab === 'word') {
      words
        .filter((w) => levelFilter.includes(w.level) && w.position)
        .forEach((w) => {
          items.push({
            type: 'word',
            data: w,
            start: w.position.start,
            end: w.position.end,
          });
        });
    }

    // 표현 (activeTab이 'all' 또는 'expression'인 경우)
    if (activeTab === 'all' || activeTab === 'expression') {
      expressions
        .filter((e) => levelFilter.includes(e.level) && e.position)
        .forEach((e) => {
          items.push({
            type: 'expression',
            data: e,
            start: e.position!.start,
            end: e.position!.end,
          });
        });
    }

    // 문법 (activeTab이 'all' 또는 'grammar'인 경우)
    if (activeTab === 'all' || activeTab === 'grammar') {
      grammar
        .filter((g) => levelFilter.includes(g.level) && g.position)
        .forEach((g) => {
          items.push({
            type: 'grammar',
            data: g,
            start: g.position!.start,
            end: g.position!.end,
          });
        });
    }

    // 위치순 정렬
    items.sort((a, b) => a.start - b.start);

    // 겹치는 항목 필터링 (먼저 오는 것 우선)
    const filtered: HighlightItem[] = [];
    let lastEnd = 0;
    for (const item of items) {
      if (item.start >= lastEnd) {
        filtered.push(item);
        lastEnd = item.end;
      }
    }

    return filtered;
  }, [words, expressions, grammar, levelFilter, activeTab]);

  const handleMouseEnter = (item: HighlightItem, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // 텍스트를 하이라이트된 부분으로 분할
  const renderContent = () => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((item, idx) => {
      // 하이라이트 전 텍스트
      if (item.start > lastIndex) {
        result.push(
          <span key={`text-${idx}`}>
            {content.substring(lastIndex, item.start)}
          </span>
        );
      }

      // 하이라이트된 텍스트
      const level = 'level' in item.data ? item.data.level : 'B1';
      const isUserAdded = 'isUserAdded' in item.data && item.data.isUserAdded;

      result.push(
        <span
          key={`highlight-${idx}`}
          className={`highlight-word cursor-pointer px-0.5 rounded ${LEVEL_HIGHLIGHT_CLASSES[level as CEFRLevel]} ${
            isUserAdded ? 'highlight-user-added' : ''
          }`}
          onMouseEnter={(e) => handleMouseEnter(item, e)}
          onMouseLeave={handleMouseLeave}
        >
          {content.substring(item.start, item.end)}
        </span>
      );

      lastIndex = item.end;
    });

    // 마지막 텍스트
    if (lastIndex < content.length) {
      result.push(
        <span key="text-last">{content.substring(lastIndex)}</span>
      );
    }

    return result;
  };

  return (
    <div className="relative">
      <div className="text-lg leading-relaxed whitespace-pre-wrap">
        {renderContent()}
      </div>

      {/* 팝업 */}
      {hoveredItem && (
        <WordPopup
          item={hoveredItem}
          position={popupPosition}
          onSave={onSaveWord}
          onClose={() => setHoveredItem(null)}
        />
      )}
    </div>
  );
}
