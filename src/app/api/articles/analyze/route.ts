import { NextRequest, NextResponse } from 'next/server';
import { analyzeArticle } from '@/lib/gemini';
import { normalizeText, processAnalysisResult } from '@/lib/textUtils';
import { AnalysisResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { content, level } = await request.json();

    if (!content || !level) {
      return NextResponse.json(
        { error: '텍스트와 급수를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 텍스트 정규화
    const normalizedContent = normalizeText(content);
    
    console.log('=== Analysis Request ===');
    console.log('Level:', level);
    console.log('Content length:', normalizedContent.length);
    console.log('Content preview:', normalizedContent.substring(0, 200) + '...');

    // API 키 체크
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    // Gemini API로 분석
    const rawAnalysis = await analyzeArticle(normalizedContent, level);
    
    // 응답 구조 검증
    if (!rawAnalysis || typeof rawAnalysis !== 'object') {
      console.error('Invalid analysis response: not an object');
      return NextResponse.json(
        { error: 'AI 분석 결과가 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    // 필수 필드 검증 및 기본값 설정
    const validatedAnalysis: AnalysisResult = {
      summary: rawAnalysis.summary || { topic: '주제 분석 중', keyMessage: '' },
      vocabulary: {
        nouns: Array.isArray(rawAnalysis.vocabulary?.nouns) ? rawAnalysis.vocabulary.nouns : [],
        verbs: Array.isArray(rawAnalysis.vocabulary?.verbs) ? rawAnalysis.vocabulary.verbs : [],
        adjectives: Array.isArray(rawAnalysis.vocabulary?.adjectives) ? rawAnalysis.vocabulary.adjectives : [],
        adverbs: Array.isArray(rawAnalysis.vocabulary?.adverbs) ? rawAnalysis.vocabulary.adverbs : [],
        others: Array.isArray(rawAnalysis.vocabulary?.others) ? rawAnalysis.vocabulary.others : [],
      },
      expressions: Array.isArray(rawAnalysis.expressions) ? rawAnalysis.expressions : [],
      grammar: Array.isArray(rawAnalysis.grammar) ? rawAnalysis.grammar : [],
      keyPoints: Array.isArray(rawAnalysis.keyPoints) ? rawAnalysis.keyPoints : [],
    };

    // Position 계산 및 통계
    const processed = processAnalysisResult(validatedAnalysis, normalizedContent);

    console.log('=== Analysis Complete ===');
    console.log('Words found:', processed.words.length);
    console.log('Expressions found:', processed.expressions.filter(e => e.position).length);
    console.log('Grammar found:', processed.grammar.filter(g => g.position).length);
    console.log('Match rate:', processed.stats.matchRate + '%');

    return NextResponse.json({
      success: true,
      analysis: validatedAnalysis,
      processed: {
        words: processed.words,
        expressions: processed.expressions,
        grammar: processed.grammar,
        summary: processed.summary,
        keyPoints: processed.keyPoints,
      },
      stats: processed.stats,
      normalizedContent,
    });
  } catch (error: any) {
    console.error('=== Analysis Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // 에러 유형별 메시지
    let errorMessage = '분석 중 오류가 발생했습니다.';
    let statusCode = 500;

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.';
      statusCode = 429;
    } else if (error.message?.includes('API key') || error.message?.includes('401')) {
      errorMessage = 'API 인증에 실패했습니다. 관리자에게 문의하세요.';
      statusCode = 401;
    } else if (error.message?.includes('Invalid') || error.message?.includes('JSON')) {
      errorMessage = 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.';
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}
