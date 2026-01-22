import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { content, analysis, questionCount = 10, level } = await request.json();

    if (!content || !analysis) {
      return NextResponse.json(
        { error: '기사 내용과 분석 결과가 필요합니다.' },
        { status: 400 }
      );
    }

    // Gemini API로 퀴즈 생성
    const quiz = await generateQuiz(
      content,
      JSON.stringify(analysis),
      questionCount,
      level || 'B1'
    );

    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // API 키가 없는 경우 Mock 데이터 반환
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        quiz: getMockQuiz(),
      });
    }

    return NextResponse.json(
      { error: '퀴즈 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Mock 퀴즈 데이터
function getMockQuiz() {
  return {
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        category: 'word',
        level: 'B1',
        sentence: 'Le _____ a annoncé de nouvelles mesures.',
        blank: 'gouvernement',
        options: ['gouvernement', 'président', 'ministre', 'parlement'],
        explanation: 'gouvernement(정부)는 국가의 행정부를 가리키는 명사입니다.',
      },
      {
        id: 2,
        type: 'multiple_choice',
        category: 'word',
        level: 'A2',
        sentence: 'Il a _____ son départ pour demain.',
        blank: 'annoncé',
        options: ['annoncé', 'dit', 'parlé', 'écrit'],
        explanation: 'annoncer(발표하다)는 공식적으로 알리는 것을 의미합니다.',
      },
      {
        id: 3,
        type: 'multiple_choice',
        category: 'expression',
        level: 'B2',
        sentence: 'Le _____ est un problème mondial.',
        blank: 'changement climatique',
        options: ['changement climatique', 'temps chaud', 'climat variable', 'météo difficile'],
        explanation: 'changement climatique(기후 변화)는 지구 온난화와 관련된 표현입니다.',
      },
      {
        id: 4,
        type: 'subjective',
        category: 'grammar',
        level: 'A2',
        sentence: 'Le gouvernement _____ de nouvelles mesures. (annoncer, passé composé)',
        blank: 'a annoncé',
        hint: 'avoir + 과거분사',
        explanation: '복합과거는 avoir/être + 과거분사로 만듭니다. annoncer의 과거분사는 annoncé입니다.',
      },
      {
        id: 5,
        type: 'multiple_choice',
        category: 'word',
        level: 'B2',
        sentence: 'La _____ des émissions de CO2 est nécessaire.',
        blank: 'réduction',
        options: ['réduction', 'diminution', 'baisse', 'chute'],
        explanation: 'réduction(감소)은 공식적인 맥락에서 자주 사용되는 단어입니다.',
      },
      {
        id: 6,
        type: 'subjective',
        category: 'word',
        level: 'B1',
        sentence: 'Des _____ urgentes ont été prises. (조치)',
        blank: 'mesures',
        hint: 'm으로 시작하는 여성 명사',
        explanation: 'mesure(조치)는 여성 명사로, 복수형은 mesures입니다.',
      },
      {
        id: 7,
        type: 'multiple_choice',
        category: 'expression',
        level: 'B1',
        sentence: 'Il faut _____ contre la pollution.',
        blank: 'prendre des mesures',
        options: ['prendre des mesures', 'faire des actions', 'mettre des règles', 'donner des ordres'],
        explanation: 'prendre des mesures(조치를 취하다)는 공식적인 행동을 취할 때 사용하는 표현입니다.',
      },
      {
        id: 8,
        type: 'multiple_choice',
        category: 'grammar',
        level: 'B1',
        sentence: "Il est essentiel que nous _____ maintenant. (agir)",
        blank: 'agissions',
        options: ['agissions', 'agissons', 'agir', 'agirons'],
        explanation: '접속법 현재는 "Il faut que", "Il est essentiel que" 등의 표현 뒤에 사용됩니다.',
      },
      {
        id: 9,
        type: 'subjective',
        category: 'word',
        level: 'B2',
        sentence: "Le réchauffement _____ affecte notre planète. (기후의)",
        blank: 'climatique',
        hint: 'climat에서 파생된 형용사',
        explanation: 'climatique(기후의)는 climat(기후)에서 파생된 형용사입니다.',
      },
      {
        id: 10,
        type: 'multiple_choice',
        category: 'word',
        level: 'A2',
        sentence: "Aujourd'hui, le président a fait une _____.",
        blank: 'annonce',
        options: ['annonce', 'annoncé', 'annoncer', 'annonceur'],
        explanation: 'annonce(발표)는 annoncer(발표하다)에서 파생된 여성 명사입니다.',
      },
    ],
  };
}
