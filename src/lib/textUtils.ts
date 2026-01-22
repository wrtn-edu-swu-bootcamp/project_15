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
 * 텍스트 정규화: 연속 공백을 단일 공백으로, 줄바꿈 유지
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')           // Windows 줄바꿈 정규화
    .replace(/\r/g, '\n')             // Mac 줄바꿈 정규화
    .replace(/[ \t]+/g, ' ')          // 연속 공백/탭을 단일 공백으로
    .replace(/\u00A0/g, ' ')          // non-breaking space를 일반 공백으로
    .replace(/\u200B/g, '')           // zero-width space 제거
    .trim();
}

/**
 * 악센트 제거 (검색용)
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * 텍스트에서 특정 문자열의 위치를 찾습니다.
 * 1차: 정확한 매칭
 * 2차: 대소문자 무시 매칭
 * 3차: 악센트 제거 후 매칭
 */
export function findPositionFlexible(
  content: string,
  searchText: string,
  usedPositions?: Set<string>
): { position: Position | null; matchType: 'exact' | 'case-insensitive' | 'accent-insensitive' | 'not-found' } {
  if (!searchText || searchText.length === 0) {
    return { position: null, matchType: 'not-found' };
  }

  // 1차: 정확한 매칭
  let index = content.indexOf(searchText);
  if (index !== -1) {
    const position = { start: index, end: index + searchText.length };
    const posKey = `${position.start}-${position.end}`;
    
    // 중복 체크
    if (usedPositions && usedPositions.has(posKey)) {
      // 다음 위치 찾기
      index = content.indexOf(searchText, index + 1);
      if (index !== -1) {
        return {
          position: { start: index, end: index + searchText.length },
          matchType: 'exact'
        };
      }
    } else {
      return { position, matchType: 'exact' };
    }
  }

  // 2차: 대소문자 무시 매칭
  const lowerContent = content.toLowerCase();
  const lowerSearch = searchText.toLowerCase();
  index = lowerContent.indexOf(lowerSearch);
  if (index !== -1) {
    const position = { start: index, end: index + searchText.length };
    console.log(`[Flexible Match] "${searchText}" found via case-insensitive at ${index}`);
    return { position, matchType: 'case-insensitive' };
  }

  // 3차: 악센트 제거 후 매칭
  const normalizedContent = removeAccents(content.toLowerCase());
  const normalizedSearch = removeAccents(searchText.toLowerCase());
  index = normalizedContent.indexOf(normalizedSearch);
  if (index !== -1) {
    const position = { start: index, end: index + searchText.length };
    console.log(`[Flexible Match] "${searchText}" found via accent-insensitive at ${index}`);
    return { position, matchType: 'accent-insensitive' };
  }

  console.log(`[Match Failed] "${searchText}" not found in content`);
  return { position: null, matchType: 'not-found' };
}

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

    startIndex = index + 1;
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
 * 매칭 통계 타입
 */
export interface MatchStats {
  total: number;
  exact: number;
  caseInsensitive: number;
  accentInsensitive: number;
  notFound: number;
  notFoundItems: string[];
}

/**
 * 품사별 어휘를 하이라이팅용 통합 배열로 변환합니다.
 * 각 항목에 position을 계산하여 추가합니다.
 * 유연한 매칭 적용
 */
export function convertVocabularyToHighlightWords(
  vocabulary: VocabularyByPOS,
  content: string
): { words: HighlightWord[]; stats: MatchStats } {
  const result: HighlightWord[] = [];
  const usedPositions: Set<string> = new Set();
  const stats: MatchStats = {
    total: 0,
    exact: 0,
    caseInsensitive: 0,
    accentInsensitive: 0,
    notFound: 0,
    notFoundItems: [],
  };

  // 명사 변환
  vocabulary.nouns?.forEach((noun: NounItem) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, noun.foundForm, usedPositions);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`noun: ${noun.foundForm}`);
    }
    
    if (position) {
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
  vocabulary.verbs?.forEach((verb: VerbItem) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, verb.foundForm, usedPositions);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`verb: ${verb.foundForm}`);
    }
    
    if (position) {
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
  vocabulary.adjectives?.forEach((adj: AdjectiveItem) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, adj.foundForm, usedPositions);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`adj: ${adj.foundForm}`);
    }
    
    if (position) {
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
  vocabulary.adverbs?.forEach((adv: AdverbItem) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, adv.foundForm, usedPositions);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`adv: ${adv.foundForm}`);
    }
    
    if (position) {
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
  vocabulary.others?.forEach((other: OtherItem) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, other.foundForm, usedPositions);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`other: ${other.foundForm}`);
    }
    
    if (position) {
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

  // 위치 순으로 정렬
  result.sort((a, b) => a.position.start - b.position.start);

  console.log('=== Vocabulary Match Stats ===');
  console.log(`Total: ${stats.total}, Exact: ${stats.exact}, Case-insensitive: ${stats.caseInsensitive}, Accent-insensitive: ${stats.accentInsensitive}, Not found: ${stats.notFound}`);
  if (stats.notFoundItems.length > 0) {
    console.log('Not found items:', stats.notFoundItems);
  }

  return { words: result, stats };
}

/**
 * 표현에 position을 계산하여 추가합니다.
 */
export function addPositionsToExpressions(
  expressions: AnalyzedExpression[],
  content: string
): { expressions: AnalyzedExpression[]; stats: MatchStats } {
  const stats: MatchStats = {
    total: 0,
    exact: 0,
    caseInsensitive: 0,
    accentInsensitive: 0,
    notFound: 0,
    notFoundItems: [],
  };

  const result = expressions?.map((expr) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, expr.foundForm);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`expr: ${expr.foundForm}`);
    }
    
    return {
      ...expr,
      position: position || undefined,
    };
  }) || [];

  console.log('=== Expression Match Stats ===');
  console.log(`Total: ${stats.total}, Not found: ${stats.notFound}`);

  return { expressions: result, stats };
}

/**
 * 문법에 position을 계산하여 추가합니다.
 */
export function addPositionsToGrammar(
  grammar: AnalyzedGrammar[],
  content: string
): { grammar: AnalyzedGrammar[]; stats: MatchStats } {
  const stats: MatchStats = {
    total: 0,
    exact: 0,
    caseInsensitive: 0,
    accentInsensitive: 0,
    notFound: 0,
    notFoundItems: [],
  };

  const result = grammar?.map((gram) => {
    stats.total++;
    const { position, matchType } = findPositionFlexible(content, gram.foundText);
    
    if (matchType === 'exact') stats.exact++;
    else if (matchType === 'case-insensitive') stats.caseInsensitive++;
    else if (matchType === 'accent-insensitive') stats.accentInsensitive++;
    else {
      stats.notFound++;
      stats.notFoundItems.push(`grammar: ${gram.foundText}`);
    }
    
    return {
      ...gram,
      position: position || undefined,
    };
  }) || [];

  console.log('=== Grammar Match Stats ===');
  console.log(`Total: ${stats.total}, Not found: ${stats.notFound}`);

  return { grammar: result, stats };
}

/**
 * 전체 매칭 통계
 */
export interface TotalMatchStats {
  vocabulary: MatchStats;
  expressions: MatchStats;
  grammar: MatchStats;
  totalItems: number;
  totalMatched: number;
  matchRate: number;
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
  stats: TotalMatchStats;
} {
  const normalizedContent = normalizeText(content);
  
  const { words, stats: vocabStats } = convertVocabularyToHighlightWords(
    analysis.vocabulary || { nouns: [], verbs: [], adjectives: [], adverbs: [], others: [] },
    normalizedContent
  );
  const { expressions, stats: exprStats } = addPositionsToExpressions(
    analysis.expressions || [],
    normalizedContent
  );
  const { grammar, stats: grammarStats } = addPositionsToGrammar(
    analysis.grammar || [],
    normalizedContent
  );

  const totalItems = vocabStats.total + exprStats.total + grammarStats.total;
  const totalMatched = 
    (vocabStats.exact + vocabStats.caseInsensitive + vocabStats.accentInsensitive) +
    (exprStats.exact + exprStats.caseInsensitive + exprStats.accentInsensitive) +
    (grammarStats.exact + grammarStats.caseInsensitive + grammarStats.accentInsensitive);
  
  const stats: TotalMatchStats = {
    vocabulary: vocabStats,
    expressions: exprStats,
    grammar: grammarStats,
    totalItems,
    totalMatched,
    matchRate: totalItems > 0 ? Math.round((totalMatched / totalItems) * 100) : 0,
  };

  console.log('=== Total Match Stats ===');
  console.log(`Total items: ${totalItems}, Matched: ${totalMatched}, Rate: ${stats.matchRate}%`);

  return {
    words,
    expressions,
    grammar,
    summary: analysis.summary || { topic: '', keyMessage: '' },
    keyPoints: analysis.keyPoints || [],
    vocabulary: analysis.vocabulary || { nouns: [], verbs: [], adjectives: [], adverbs: [], others: [] },
    stats,
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
  const { position } = findPositionFlexible(content, foundForm);
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
