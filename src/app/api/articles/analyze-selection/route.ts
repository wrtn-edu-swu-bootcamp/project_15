import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserSelection } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { selectedText, context } = await request.json();

    if (!selectedText) {
      return NextResponse.json(
        { error: '선택된 텍스트가 없습니다.' },
        { status: 400 }
      );
    }

    // Gemini API로 분석
    const word = await analyzeUserSelection(selectedText, context);

    return NextResponse.json({
      success: true,
      word,
    });
  } catch (error) {
    console.error('Selection analysis error:', error);
    
    // API 키가 없는 경우 Mock 데이터 반환
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        word: {
          word: 'exemple',
          foundForm: 'exemple',
          partOfSpeech: 'n.m.',
          level: 'A2',
          meaningKo: '예시, 본보기',
          meaningFr: 'Ce qui peut servir de modèle',
          example: "C'est un bon exemple.",
        },
      });
    }

    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
