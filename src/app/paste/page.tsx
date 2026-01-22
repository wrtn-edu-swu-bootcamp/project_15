'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CEFRLevel, LEVEL_NAMES, LEVEL_COLORS } from '@/types';
import { normalizeText } from '@/lib/textUtils';

function PasteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = (searchParams.get('level') as CEFRLevel) || 'B1';
  
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // 텍스트 변경 시 자동 정규화
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }

    if (text.trim().length < 50) {
      setError('분석을 위해 최소 50자 이상의 텍스트를 입력해주세요.');
      return;
    }

    if (!agreedToTerms) {
      setShowTermsModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 텍스트 정규화
      const normalizedContent = normalizeText(text);
      
      const response = await fetch('/api/articles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: normalizedContent, level }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '분석에 실패했습니다.');
      }

      if (!data.success) {
        throw new Error(data.error || '분석 결과를 받지 못했습니다.');
      }
      
      // 세션 스토리지에 분석 결과 저장 (정규화된 텍스트 사용)
      sessionStorage.setItem('analysisData', JSON.stringify({
        content: normalizedContent,
        level,
        analysis: data.analysis,
        processed: data.processed,
        stats: data.stats,
      }));
      
      router.push(`/learn/session`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgreeAndContinue = () => {
    setAgreedToTerms(true);
    setShowTermsModal(false);
    handleAnalyze();
  };

  const handleRetry = () => {
    setError(null);
    handleAnalyze();
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#FFFBF7' }}>
      <div className="max-w-4xl mx-auto">
        {/* 현재 급수 표시 */}
        <div className="mb-8 text-center">
          <span className="text-gray-600">현재 급수: </span>
          <span className={`inline-block px-3 py-1 rounded-lg font-semibold ${LEVEL_COLORS[level]}`}>
            {level} {LEVEL_NAMES[level]}
          </span>
          <Link 
            href="/"
            className="ml-2 text-sm text-[#6D5845] hover:underline"
          >
            변경
          </Link>
        </div>

        {/* 텍스트 입력 영역 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">
            📋 오늘의 재료(기사 텍스트)를 넣어주세요
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            프랑스어 기사를 붙여넣으면 AI가 단어, 표현, 문법을 분석합니다
          </p>

          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="여기에 프랑스어 기사 텍스트를 붙여넣으세요...&#10;&#10;예시:&#10;Le gouvernement a annoncé de nouvelles mesures pour lutter contre le changement climatique. Ces mesures comprennent des investissements dans les énergies renouvelables..."
            className="w-full h-72 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#6D5845] focus:border-transparent font-sans text-gray-800"
            disabled={isLoading}
          />

          {/* 글자 수 표시 */}
          <div className="mt-2 text-right text-sm text-gray-400">
            {text.length}자 {text.length < 50 && text.length > 0 && <span className="text-orange-500">(최소 50자)</span>}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-500">❌</span>
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 text-sm text-red-600 hover:underline font-medium"
                >
                  다시 시도하기
                </button>
              </div>
            </div>
          )}

          {/* 저작권 안내 */}
          <div className="mt-4 p-4 bg-[#FDF5ED] border border-[#E5DDD4] rounded-lg">
            <p className="text-sm text-[#6D5845]">
              ⚠️ <strong>주의:</strong> 입력하신 텍스트는 개인 학습 목적으로만 사용해 주세요.
              저작권 관련 책임은 사용자 본인에게 있습니다.
            </p>
          </div>

          {/* 분석 버튼 */}
          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !text.trim()}
              className="px-8 py-3 bg-[#6D5845] text-white rounded-xl font-semibold hover:bg-[#5A4839] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[200px]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  재료 손질 중...
                </span>
              ) : (
                '🔪 재료 손질 시작'
              )}
            </button>
          </div>

          {/* 언론사 가이드 링크 */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm mb-2">
              💡 어디서 재료를 구해야 할지 모르겠다면?
            </p>
            <Link
              href="/guide"
              className="text-[#6D5845] hover:underline font-medium"
            >
              프랑스 언론사 가이드 보기 →
            </Link>
          </div>
        </div>

        {/* 사용 팁 */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">💡 분석 팁</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 뉴스 기사, 에세이, 블로그 글 등 다양한 텍스트 분석 가능</li>
            <li>• 200~1000자 정도의 텍스트가 가장 효과적입니다</li>
            <li>• 분석 후 단어를 클릭하면 뜻과 예문을 확인할 수 있어요</li>
          </ul>
        </div>
      </div>

      {/* 이용약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📋 이용약관 동의
            </h2>
            <p className="text-gray-600 mb-4">
              LangSavor 서비스 이용을 위해 아래 내용에 동의해 주세요.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 space-y-2 max-h-48 overflow-y-auto">
              <p>1. 본 서비스에 입력하는 텍스트는 개인 학습 목적으로만 사용합니다.</p>
              <p>2. 입력한 텍스트의 저작권 관련 법적 책임은 사용자 본인에게 있습니다.</p>
              <p>3. 영리적 목적의 사용을 금지합니다.</p>
              <p>4. 부적절한 활동 발견 시 계정이 정지될 수 있습니다.</p>
              <p>5. 입력된 텍스트는 AI 분석 목적으로만 사용되며, 저장되지 않습니다.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAgreeAndContinue}
                className="flex-1 px-4 py-2 bg-[#6D5845] text-white rounded-lg hover:bg-[#5A4839] transition-colors"
              >
                동의하고 시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
            <div className="text-4xl mb-4">🔪</div>
            <p className="text-lg font-semibold text-gray-800 mb-2">재료를 손질하고 있어요</p>
            <p className="text-sm text-gray-500">AI가 텍스트를 분석 중입니다...</p>
            <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#6D5845] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PastePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFBF7' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PasteContent />
    </Suspense>
  );
}
