// CEFR 급수 타입
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 급수별 색상
export const LEVEL_COLORS: Record<CEFRLevel, string> = {
  A1: 'bg-[#D4CAA1] text-[#FFFAF5]',
  A2: 'bg-[#D1BAA5] text-[#FFFAF5]',
  B1: 'bg-[#A4BFAA] text-[#FFFAF5]',
  B2: 'bg-[#7B8C8F] text-[#FFFAF5]',
  C1: 'bg-[#CFABAB] text-[#FFFAF5]',
  C2: 'bg-[#9B93A3] text-[#FFFAF5]',
};

// 급수별 한글 이름
export const LEVEL_NAMES: Record<CEFRLevel, string> = {
  A1: '입문',
  A2: '초급',
  B1: '중급1',
  B2: '중급2',
  C1: '고급1',
  C2: '고급2',
};

// 급수별 설명 (호버 툴팁용)
export const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A1: '기본 인사, 자기소개 등 간단한 일상 표현 가능',
  A2: '일상적 정보 교환, 간단한 묘사와 대화 가능',
  B1: '익숙한 주제에 대해 의견을 표현하고 대처 가능',
  B2: '복잡한 텍스트 이해, 원어민과 유창한 대화 가능',
  C1: '학술적, 전문적 상황에서 유창하게 소통 가능',
  C2: '원어민에 준하는 완벽한 언어 구사력 보유',
};

// Position 타입 (하이라이팅용)
export interface Position {
  start: number;
  end: number;
}

// 기본 단어 항목 타입 (품사별 공통)
export interface VocabItemBase {
  word: string;
  foundForm: string;
  meaning: string;
  level: CEFRLevel;
  example: string;
  position?: Position; // 프론트엔드에서 계산
  isUserAdded?: boolean;
}

// 명사 타입
export interface NounItem extends VocabItemBase {
  gender?: 'm' | 'f';
}

// 동사 타입
export interface VerbItem extends VocabItemBase {
  tense?: string;
}

// 형용사/부사 타입 (VocabItemBase와 동일)
export type AdjectiveItem = VocabItemBase;
export type AdverbItem = VocabItemBase;

// 기타 품사 타입
export interface OtherItem extends VocabItemBase {
  partOfSpeech: string;
}

// 표현 분석 결과 타입
export interface AnalyzedExpression {
  expression: string;
  foundForm: string;
  meaning: string;
  level: CEFRLevel;
  usage: string;
  example: string;
  position?: Position; // 프론트엔드에서 계산
}

// 문법 분석 결과 타입
export interface AnalyzedGrammar {
  name: string;
  nameFr: string;
  level: CEFRLevel;
  foundText: string;
  explanation: string;
  rule: string;
  position?: Position; // 프론트엔드에서 계산
}

// 품사별 어휘 타입
export interface VocabularyByPOS {
  nouns: NounItem[];
  verbs: VerbItem[];
  adjectives: AdjectiveItem[];
  adverbs: AdverbItem[];
  others: OtherItem[];
}

// 요약 타입
export interface Summary {
  topic: string;
  keyMessage: string;
}

// 분석 결과 전체 타입 (새 구조)
export interface AnalysisResult {
  summary: Summary;
  vocabulary: VocabularyByPOS;
  expressions: AnalyzedExpression[];
  grammar: AnalyzedGrammar[];
  keyPoints: string[];
}

// 하이라이팅용 통합 단어 타입 (모든 품사를 하나로)
export interface HighlightWord {
  word: string;
  foundForm: string;
  partOfSpeech: string;
  meaning: string;
  level: CEFRLevel;
  example: string;
  position: Position;
  isUserAdded?: boolean;
  gender?: string;
  tense?: string;
}

// 기사 타입
export interface Article {
  id: string;
  title: string;
  content: string;
  source?: string;
  category?: string;
  level: CEFRLevel;
  isCurated: boolean;
  createdAt: Date;
}

// 퀴즈 문제 타입
export interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'subjective';
  category: 'word' | 'expression' | 'grammar';
  level: CEFRLevel;
  sentence: string;
  blank: string;
  hint?: string;
  options?: string[];
  explanation: string;
}

// 퀴즈 결과 타입
export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  details: {
    questionId: number;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  }[];
}

// 완성도별 메시지 타입
export const SCORE_MESSAGES: { min: number; max: number; icon: string; message: string }[] = [
  { min: 0, max: 30, icon: '🥚', message: '재료를 다듬는 중이에요. 조금 더 연습해봐요!' },
  { min: 31, max: 50, icon: '🍳', message: '요리가 익기 시작했어요. 계속 저어주세요!' },
  { min: 51, max: 70, icon: '🥘', message: '풍미가 살아나고 있어요. 거의 다 왔어요!' },
  { min: 71, max: 90, icon: '🍲', message: '풍미가 잘 살아난 요리! 훌륭해요!' },
  { min: 91, max: 100, icon: '🍽️', message: '완벽한 요리 완성! 당신은 언어 미식가!' },
];

// 사용자 타입
export interface User {
  id: string;
  email: string;
  displayName: string;
  currentLevel: CEFRLevel;
  createdAt: Date;
}

// 저장된 단어 (냉장고) 타입
export interface UserWord {
  id: string;
  userId: string;
  word: string;
  meaning: string;
  level: CEFRLevel;
  partOfSpeech?: string;
  example?: string;
  isUserAdded: boolean;
  createdAt: Date;
}
