import { NextRequest, NextResponse } from 'next/server';
import { analyzeArticle } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { content, level } = await request.json();

    if (!content || !level) {
      return NextResponse.json(
        { error: '텍스트와 급수를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Gemini API로 분석
    const analysis = await analyzeArticle(content, level);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    
    // API 키가 없는 경우 Mock 데이터 반환
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        analysis: getMockAnalysis(),
      });
    }

    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Mock 데이터 (개발/테스트용)
function getMockAnalysis() {
  return {
    words: [
      {
        word: 'gouvernement',
        foundForm: 'gouvernement',
        partOfSpeech: 'n.m.',
        level: 'B1',
        meaningKo: '정부',
        meaningFr: 'Organe qui détient le pouvoir exécutif dans un État',
        example: 'Le gouvernement a annoncé de nouvelles mesures.',
        position: { start: 3, end: 15 },
      },
      {
        word: 'annoncer',
        foundForm: 'annoncé',
        partOfSpeech: 'v.',
        level: 'A2',
        meaningKo: '발표하다, 알리다',
        meaningFr: 'Faire savoir, communiquer une nouvelle',
        example: "Il a annoncé son départ.",
        position: { start: 18, end: 26 },
      },
      {
        word: 'mesure',
        foundForm: 'mesures',
        partOfSpeech: 'n.f.',
        level: 'B1',
        meaningKo: '조치, 방안',
        meaningFr: 'Disposition prise pour atteindre un but',
        example: 'Des mesures urgentes ont été prises.',
        position: { start: 45, end: 52 },
      },
      {
        word: 'climatique',
        foundForm: 'climatique',
        partOfSpeech: 'adj.',
        level: 'B2',
        meaningKo: '기후의',
        meaningFr: 'Relatif au climat',
        example: 'Le changement climatique est un défi mondial.',
        position: { start: 78, end: 88 },
      },
      {
        word: 'réduction',
        foundForm: 'réduction',
        partOfSpeech: 'n.f.',
        level: 'B2',
        meaningKo: '감소, 축소',
        meaningFr: 'Action de réduire, de diminuer',
        example: 'La réduction des émissions est nécessaire.',
        position: { start: 120, end: 129 },
      },
    ],
    expressions: [
      {
        expression: 'changement climatique',
        level: 'B2',
        meaningKo: '기후 변화',
        usage: '환경 관련 주제에서 자주 사용되는 표현',
        example: 'Le changement climatique affecte notre planète.',
        position: { start: 65, end: 88 },
      },
      {
        expression: 'prendre des mesures',
        level: 'B1',
        meaningKo: '조치를 취하다',
        usage: '공식적인 결정이나 행동을 취할 때 사용',
        example: 'Il faut prendre des mesures contre la pollution.',
        position: { start: 35, end: 55 },
      },
    ],
    grammar: [
      {
        name: '복합과거 (Passé composé)',
        nameFr: 'Passé composé',
        level: 'A2',
        foundText: 'a annoncé',
        explanation: '과거에 완료된 동작을 나타내는 시제입니다.',
        rule: 'avoir/être + 과거분사',
        position: { start: 16, end: 26 },
      },
      {
        name: '접속법 현재 (Subjonctif présent)',
        nameFr: 'Subjonctif présent',
        level: 'B1',
        foundText: 'que nous agissions',
        explanation: '필요성, 감정, 의심 등을 표현하는 종속절에서 사용됩니다.',
        rule: "Il faut que + 주어 + 동사(접속법)",
        position: { start: 150, end: 168 },
      },
    ],
  };
}
