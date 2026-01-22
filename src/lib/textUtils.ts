import {
  AnalysisResult,
  VocabularyByPOS,
  NounItem,
  VerbItem,
  AdjectiveItem,
  AdverbItem,
  OtherItem,
  AnalyzedExpression,
  AnalyzedGrammar,
  HighlightWord,
  Position,
  CEFRLevel,
} from '@/types';

/**
 * 텍스트에서 특정 문자열의 모든 위치를 찾습니다.
 * 대소문자와 악센트를 정확히 구분합니다.
 */
export function findAllPositions(content: string, searchText: string): Position[] {
  const positions: Position[] = [];
  let startIndex = 0;

  while (startIndex < content.length) {
    const index = content.indexOf(searchText, startIndex);
    if (index === -1) break;

    positions.push({
      start: index,
      end: index + searchText.length,
    });

    startIndex = index + 1; // 다음 위치부터 검색 (중복 허용)
  }

  return positions;
}

/**
 * 텍스트에서 특정 문자열의 첫 번째 위치를 찾습니다.
 * 찾지 못하면 null을 반환합니다.
 */
export function findFirstPosition(content: string, searchText: string): Position | null {
  const index = content.indexOf(searchText);
  if (index === -1) return null;

  return {
    start: index,
    end: index + searchText.length,
  };
}

/**
 * 품사별 어휘를 하이라이팅용 통합 배열로 변환합니다.
 * 각 항목에 position을 계산하여 추가합니다.
 */
export function convertVocabularyToHighlightWords(
  vocabulary: VocabularyByPOS,
  content: string
): HighlightWord[] {
  const result: HighlightWord[] = [];
  const usedPositions: Set<string> = new Set(); // 중복 방지

  // 명사 변환
  vocabulary.nouns.forEach((noun: NounItem) => {
    const position = findFirstPosition(content, noun.foundForm);
    if (position && !usedPositions.has(`${position.start}-${position.end}`)) {
      usedPositions.add(`${position.start}-${position.end}`);
      result.push({
        word: noun.word,
        foundForm: noun.foundForm,
        partOfSpeech: noun.gender ? `n.${noun.gender}.` : 'n.',
        meaning: noun.meaning,
        level: noun.level,
        example: noun.example,
        position,
        isUserAdded: noun.isUserAdded,
        gender: noun.gender,
      });
    }
  });

  // 동사 변환
  vocabulary.verbs.forEach((verb: VerbItem) => {
    const position = findFirstPosition(content, verb.foundForm);
    if (position && !usedPositions.has(`${position.start}-${position.end}`)) {
      usedPositions.add(`${position.start}-${position.end}`);
      result.push({
        word: verb.word,
        foundForm: verb.foundForm,
        partOfSpeech: 'v.',
        meaning: verb.meaning,
        level: verb.level,
        example: verb.example,
        position,
        isUserAdded: verb.isUserAdded,
        tense: verb.tense,
      });
    }
  });

  // 형용사 변환
  vocabulary.adjectives.forEach((adj: AdjectiveItem) => {
    const position = findFirstPosition(content, adj.foundForm);
    if (position && !usedPositions.has(`${position.start}-${position.end}`)) {
      usedPositions.add(`${position.start}-${position.end}`);
      result.push({
        word: adj.word,
        foundForm: adj.foundForm,
        partOfSpeech: 'adj.',
        meaning: adj.meaning,
        level: adj.level,
        example: adj.example,
        position,
        isUserAdded: adj.isUserAdded,
      });
    }
  });

  // 부사 변환
  vocabulary.adverbs.forEach((adv: AdverbItem) => {
    const position = findFirstPosition(content, adv.foundForm);
    if (position && !usedPositions.has(`${position.start}-${position.end}`)) {
      usedPositions.add(`${position.start}-${position.end}`);
      result.push({
        word: adv.word,
        foundForm: adv.foundForm,
        partOfSpeech: 'adv.',
        meaning: adv.meaning,
        level: adv.level,
        example: adv.example,
        position,
        isUserAdded: adv.isUserAdded,
      });
    }
  });

  // 기타 품사 변환
  vocabulary.others.forEach((other: OtherItem) => {
    const position = findFirstPosition(content, other.foundForm);
    if (position && !usedPositions.has(`${position.start}-${position.end}`)) {
      usedPositions.add(`${position.start}-${position.end}`);
      result.push({
        word: other.word,
        foundForm: other.foundForm,
        partOfSpeech: other.partOfSpeech,
        meaning: other.meaning,
        level: other.level,
        example: other.example,
        position,
        isUserAdded: other.isUserAdded,
      });
    }
  });

  return result;
}

/**
 * 표현에 position을 계산하여 추가합니다.
 */
export function addPositionsToExpressions(
  expressions: AnalyzedExpression[],
  content: string
): AnalyzedExpression[] {
  return expressions.map((expr) => {
    const position = findFirstPosition(content, expr.foundForm);
    return {
      ...expr,
      position: position || undefined,
    };
  });
}

/**
 * 문법에 position을 계산하여 추가합니다.
 */
export function addPositionsToGrammar(
  grammar: AnalyzedGrammar[],
  content: string
): AnalyzedGrammar[] {
  return grammar.map((gram) => {
    const position = findFirstPosition(content, gram.foundText);
    return {
      ...gram,
      position: position || undefined,
    };
  });
}

/**
 * 분석 결과 전체에 position을 계산하여 추가합니다.
 */
export function processAnalysisResult(
  analysis: AnalysisResult,
  content: string
): {
  words: HighlightWord[];
  expressions: AnalyzedExpression[];
  grammar: AnalyzedGrammar[];
  summary: AnalysisResult['summary'];
  keyPoints: string[];
  vocabulary: VocabularyByPOS;
} {
  const words = convertVocabularyToHighlightWords(analysis.vocabulary, content);
  const expressions = addPositionsToExpressions(analysis.expressions, content);
  const grammar = addPositionsToGrammar(analysis.grammar, content);

  return {
    words,
    expressions,
    grammar,
    summary: analysis.summary,
    keyPoints: analysis.keyPoints,
    vocabulary: analysis.vocabulary,
  };
}

/**
 * 사용자가 추가한 단어를 HighlightWord 형식으로 변환합니다.
 */
export function createUserHighlightWord(
  word: string,
  foundForm: string,
  meaning: string,
  level: CEFRLevel,
  partOfSpeech: string,
  example: string,
  content: string
): HighlightWord | null {
  const position = findFirstPosition(content, foundForm);
  if (!position) return null;

  return {
    word,
    foundForm,
    partOfSpeech,
    meaning,
    level,
    example,
    position,
    isUserAdded: true,
  };
}
