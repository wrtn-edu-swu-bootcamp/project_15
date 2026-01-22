import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// 기사 분석 프롬프트 - foundForm 정확성 강화
export function getAnalysisPrompt(content: string, targetLevel: string) {
  return `당신은 프랑스어 언어 분석 전문가입니다.

## 역할
다음 프랑스어 텍스트를 분석하여:
1. 단어, 표현, 문법을 CEFR 급수(A1-C2)별로 분류
2. 품사별로 체계적으로 정리
3. 텍스트의 핵심 내용과 중요 표현을 파악

## 입력 텍스트
"""
${content}
"""

## 사용자 학습 급수
${targetLevel}

## ⚠️ 매우 중요: foundForm 규칙

\`foundForm\` 필드는 **입력 텍스트에서 정확히 그대로 복사한 문자열**이어야 합니다.

### 올바른 예시:
- 입력 텍스트: "Le gouvernement a annoncé des mesures."
- foundForm: "gouvernement" ✅ (텍스트에 정확히 존재)
- foundForm: "annoncé" ✅ (텍스트에 정확히 존재)
- foundForm: "mesures" ✅ (텍스트에 정확히 존재)

### 잘못된 예시:
- foundForm: "Gouvernement" ❌ (대문자가 다름 - 텍스트에는 소문자)
- foundForm: "annoncer" ❌ (원형이 아닌 텍스트의 활용형 "annoncé"를 써야 함)
- foundForm: "mesure" ❌ (단수형이 아닌 텍스트의 복수형 "mesures"를 써야 함)

### 규칙 요약:
1. 텍스트에서 해당 단어를 **복사-붙여넣기**한다고 생각하세요
2. 대소문자, 악센트(é, è, ê, ë 등), 복수형(-s, -x), 성수 일치 모두 **텍스트 그대로**
3. 동사는 원형이 아닌 **텍스트에 나타난 활용형**을 foundForm에 씁니다
4. 절대로 형태를 수정하거나 원형으로 바꾸지 마세요

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
        "word": "단어 원형 (사전 표제어)",
        "foundForm": "텍스트에서 복사한 정확한 형태",
        "gender": "m 또는 f",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "이 단어를 사용한 간단하고 실용적인 예문 (학습자가 이해하기 쉬운 새 문장 생성)"
      }
    ],
    "verbs": [
      {
        "word": "동사 원형 (infinitif)",
        "foundForm": "텍스트에서 복사한 활용형 (예: annoncé, sont, avait)",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "tense": "사용된 시제",
        "example": "이 동사를 사용한 간단하고 실용적인 예문 (학습자가 이해하기 쉬운 새 문장 생성)"
      }
    ],
    "adjectives": [
      {
        "word": "형용사 원형",
        "foundForm": "텍스트에서 복사한 형태 (성수 일치된 형태)",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "이 형용사를 사용한 간단하고 실용적인 예문 (학습자가 이해하기 쉬운 새 문장 생성)"
      }
    ],
    "adverbs": [
      {
        "word": "부사",
        "foundForm": "텍스트에서 복사한 형태",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "이 부사를 사용한 간단하고 실용적인 예문 (학습자가 이해하기 쉬운 새 문장 생성)"
      }
    ],
    "others": [
      {
        "word": "단어",
        "foundForm": "텍스트에서 복사한 형태",
        "partOfSpeech": "품사 (전치사/접속사/대명사 등)",
        "meaning": "한국어 뜻",
        "level": "A1-C2 중 하나",
        "example": "이 단어를 사용한 간단하고 실용적인 예문 (학습자가 이해하기 쉬운 새 문장 생성)"
      }
    ]
  },
  "expressions": [
    {
      "expression": "표현 원형",
      "foundForm": "텍스트에서 복사한 표현 전체",
      "meaning": "한국어 뜻",
      "level": "A1-C2 중 하나",
      "usage": "사용 맥락 설명",
      "example": "이 표현을 사용한 간단하고 실용적인 예문 (학습자가 이해하기 쉬운 새 문장 생성)"
    }
  ],
  "grammar": [
    {
      "name": "문법 명칭 (한국어)",
      "nameFr": "문법 명칭 (프랑스어)",
      "level": "A1-C2 중 하나",
      "foundText": "텍스트에서 복사한 해당 문법이 사용된 부분",
      "explanation": "문법 설명 (한국어)",
      "rule": "규칙 요약"
    }
  ],
  "keyPoints": [
    "${targetLevel} 급수 학습자가 특히 주목해야 할 포인트 1",
    "${targetLevel} 급수 학습자가 특히 주목해야 할 포인트 2"
  ]
}

## 예문(example) 생성 지침
- example 필드는 텍스트에서 가져오지 말고, **새롭게 생성**하세요
- 학습자 급수(${targetLevel})에 맞는 난이도의 간단하고 실용적인 문장을 만드세요
- 일상생활에서 자주 쓰이는 맥락으로 작성하세요
- 해당 단어/표현의 용법을 잘 보여주는 문장이어야 합니다
- 10-20단어 내외의 짧고 명확한 문장으로 작성하세요

## 최종 점검
응답하기 전에 각 foundForm이 입력 텍스트에 **정확히 존재하는지** 확인하세요.
텍스트에서 Ctrl+F로 검색했을 때 찾아지는 형태만 사용하세요.`;
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
- foundForm은 반드시 "${selectedText}"를 그대로 사용
- 선택한 텍스트가 동사 활용형이면 원형도 함께 제공
- 표현(숙어)인 경우 전체 표현과 의미 설명
- CEFR 급수를 정확하게 판단`;
}

// JSON 파싱 헬퍼 함수
function extractJSON(text: string): string | null {
  // ```json ... ``` 형식 처리
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // ``` ... ``` 형식 처리
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // 순수 JSON 객체 추출
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return null;
}

// Gemini API 호출 함수 - 분석
export async function analyzeArticle(content: string, targetLevel: string) {
  const prompt = getAnalysisPrompt(content, targetLevel);
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('=== Gemini Raw Response ===');
    console.log(text.substring(0, 500) + '...');
    
    const jsonStr = extractJSON(text);
    if (!jsonStr) {
      console.error('JSON extraction failed. Raw text:', text);
      throw new Error('Invalid response format - no JSON found');
    }
    
    try {
      const parsed = JSON.parse(jsonStr);
      console.log('=== Parsed Analysis ===');
      console.log('Nouns count:', parsed.vocabulary?.nouns?.length || 0);
      console.log('Verbs count:', parsed.vocabulary?.verbs?.length || 0);
      console.log('Expressions count:', parsed.expressions?.length || 0);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonStr.substring(0, 500));
      throw new Error('Invalid JSON format in response');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// 퀴즈 생성
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
    
    const jsonStr = extractJSON(text);
    if (!jsonStr) {
      throw new Error('Invalid response format - no JSON found');
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// 사용자 선택 분석
export async function analyzeUserSelection(selectedText: string, context: string) {
  const prompt = getUserWordAnalysisPrompt(selectedText, context);
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = extractJSON(text);
    if (!jsonStr) {
      throw new Error('Invalid response format - no JSON found');
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
