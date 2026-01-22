import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// 기사 분석 프롬프트
export function getAnalysisPrompt(content: string, targetLevel: string) {
  return `당신은 프랑스어 언어 분석 전문가입니다.

## 역할
다음 프랑스어 텍스트를 분석하여:
1. 단어, 표현, 문법을 CEFR 급수(A1-C2)별로 분류
2. 품사별로 체계적으로 정리
3. 텍스트의 핵심 내용과 중요 표현을 파악

## 입력 텍스트
${content}

## 사용자 학습 급수
${targetLevel}

## 분석 지침
1. **단어 분석**: 텍스트에 등장하는 주요 단어를 품사별(명사/동사/형용사/부사/기타)로 분류
2. **표현 분석**: 숙어, 관용구, 연어(collocation)를 찾아 설명
3. **문법 분석**: 텍스트에서 발견되는 문법 구조를 설명
4. **핵심 요약**: 텍스트의 주제와 핵심 메시지를 한국어로 요약

## 출력 형식 (JSON만 출력, 다른 텍스트 없이)
{
  "summary": {
    "topic": "텍스트 주제 (한국어)",
    "keyMessage": "핵심 메시지 (한국어, 2-3문장)"
  },
  "vocabulary": {
    "nouns": [
      {
        "word": "단어 원형",
        "foundForm": "텍스트에서 발견된 정확한 형태",
        "gender": "m 또는 f (명사인 경우)",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "텍스트에서 사용된 문장"
      }
    ],
    "verbs": [
      {
        "word": "동사 원형 (infinitif)",
        "foundForm": "텍스트에서 발견된 활용형",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "tense": "사용된 시제 (présent, passé composé, imparfait 등)",
        "example": "텍스트에서 사용된 문장"
      }
    ],
    "adjectives": [
      {
        "word": "형용사 원형",
        "foundForm": "텍스트에서 발견된 형태",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "텍스트에서 사용된 문장"
      }
    ],
    "adverbs": [
      {
        "word": "부사",
        "foundForm": "텍스트에서 발견된 형태",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "텍스트에서 사용된 문장"
      }
    ],
    "others": [
      {
        "word": "단어",
        "foundForm": "텍스트에서 발견된 형태",
        "partOfSpeech": "품사 (전치사/접속사/대명사 등)",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "텍스트에서 사용된 문장"
      }
    ]
  },
  "expressions": [
    {
      "expression": "표현 전체",
      "foundForm": "텍스트에서 발견된 정확한 형태",
      "meaning": "한국어 뜻",
      "level": "A1-C2 중 하나",
      "usage": "사용 맥락 설명",
      "example": "텍스트에서 사용된 문장"
    }
  ],
  "grammar": [
    {
      "name": "문법 명칭 (한국어)",
      "nameFr": "문법 명칭 (프랑스어)",
      "level": "A1-C2 중 하나",
      "foundText": "텍스트에서 발견된 부분",
      "explanation": "문법 설명 (한국어)",
      "rule": "규칙 요약"
    }
  ],
  "keyPoints": [
    "${targetLevel} 급수 학습자가 특히 주목해야 할 포인트 1",
    "${targetLevel} 급수 학습자가 특히 주목해야 할 포인트 2",
    "${targetLevel} 급수 학습자가 특히 주목해야 할 포인트 3"
  ]
}

## 중요 주의사항
- foundForm은 반드시 입력 텍스트에서 **정확히 그대로** 발견되는 형태여야 합니다
- 대소문자, 악센트를 정확히 유지하세요 (예: "été"를 "ete"로 쓰지 마세요)
- ${targetLevel} 급수 학습자 관점에서 분석하되, 상위 급수 단어도 포함
- 각 품사별로 최소 2개 이상 분석 (해당 품사가 텍스트에 있는 경우)
- example은 반드시 입력 텍스트에서 직접 발췌`;
}

// 퀴즈 생성 프롬프트
export function getQuizPrompt(
  content: string,
  analysisResult: string,
  questionCount: number,
  levelRange: string
) {
  return `다음 프랑스어 기사와 분석 결과를 바탕으로 빈칸 채우기 퀴즈를 생성해주세요.

[기사 내용]
${content}

[분석된 단어/표현/문법]
${analysisResult}

[퀴즈 설정]
- 문제 수: ${questionCount}
- 급수 범위: ${levelRange}
- 유형: 객관식 ${Math.ceil(questionCount * 0.6)}개, 주관식 ${Math.floor(questionCount * 0.4)}개

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이 JSON만):

{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "category": "word",
      "level": "B1",
      "sentence": "빈칸이 포함된 문장 (빈칸은 _____ 로 표시)",
      "blank": "정답",
      "hint": "힌트 (주관식용)",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "explanation": "해설"
    }
  ]
}

주의사항:
- 객관식(multiple_choice)은 options 배열 필수, 주관식(subjective)은 hint 필수
- 문장은 기사의 실제 문장을 활용하되, 정답 부분을 _____ 로 대체
- category는 "word", "expression", "grammar" 중 하나
- 해설은 한국어로 상세하게 작성`;
}

// 사용자 추가 단어 분석 프롬프트
export function getUserWordAnalysisPrompt(selectedText: string, context: string) {
  return `사용자가 프랑스어 텍스트에서 다음 부분을 선택했습니다.

[선택한 텍스트]
${selectedText}

[문맥]
${context}

이 텍스트를 분석하여 다음 JSON 형식으로 응답해주세요:

{
  "word": "단어/표현 원형",
  "foundForm": "${selectedText}",
  "partOfSpeech": "품사",
  "level": "A1-C2 중 하나",
  "meaningKo": "한국어 뜻",
  "meaningFr": "프랑스어 정의",
  "example": "예문"
}

주의사항:
- 선택한 텍스트가 동사 활용형이면 원형도 함께 제공
- 표현(숙어)인 경우 전체 표현과 의미 설명
- CEFR 급수를 정확하게 판단`;
}

// Gemini API 호출 함수
export async function analyzeArticle(content: string, targetLevel: string) {
  const prompt = getAnalysisPrompt(content, targetLevel);
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱 (```json ... ``` 형식 처리)
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function generateQuiz(
  content: string,
  analysisResult: string,
  questionCount: number,
  levelRange: string
) {
  const prompt = getQuizPrompt(content, analysisResult, questionCount, levelRange);
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function analyzeUserSelection(selectedText: string, context: string) {
  const prompt = getUserWordAnalysisPrompt(selectedText, context);
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
