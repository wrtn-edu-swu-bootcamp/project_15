'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CEFRLevel, LEVEL_NAMES, LEVEL_COLORS } from '@/types';

function PasteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = (searchParams.get('level') as CEFRLevel) || 'B1';
  
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    if (!agreedToTerms) {
      setShowTermsModal(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/articles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, level }),
      });

      if (!response.ok) throw new Error('분석 실패');

      const data = await response.json();
      
      // 세션 스토리지에 분석 결과 저장 후 학습 페이지로 이동
      sessionStorage.setItem('analysisData', JSON.stringify({
        content: text,
        level,
        analysis: data.analysis,
      }));
      
      router.push(`/learn/session`);
    } catch (error) {
      console.error(error);
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgreeAndContinue = () => {
    setAgreedToTerms(true);
    setShowTermsModal(false);
    handleAnalyze();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 현재 급수 표시 */}
        <div className="mb-8 text-center">
          <span className="text-gray-600">현재 급수: </span>
          <span className={`inline-block px-3 py-1 rounded-lg font-semibold ${LEVEL_COLORS[level]}`}>
            {level} {LEVEL_NAMES[level]}
          </span>
        </div>

        {/* 텍스트 입력 영역 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">
            📋 오늘의 재료(기사 텍스트)를 넣어주세요
          </h1>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기에 프랑스어 기사 텍스트를 붙여넣으세요..."
            className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#6D5845] focus:border-transparent"
          />

          {/* 저작권 안내 */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>주의:</strong> 입력하신 텍스트는 개인 학습 목적으로만 사용해 주세요.
              저작권 관련 책임은 사용자 본인에게 있습니다.
            </p>
          </div>

          {/* 분석 버튼 */}
          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !text.trim()}
              className="px-8 py-3 bg-[#6D5845] text-white rounded-xl font-semibold hover:bg-[#5A4839] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '분석 중...' : '🔪 재료 손질 시작'}
            </button>
          </div>

          {/* 언론사 가이드 링크 */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              💡 어디서 재료를 구해야 할지 모르겠다면?
            </p>
            <Link
              href="/guide"
              className="text-[#6D5845] hover:underline text-sm font-medium"
            >
              프랑스 언론사 가이드 보기 →
            </Link>
          </div>
        </div>
      </div>

      {/* 이용약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📋 이용약관 동의
            </h2>
            <p className="text-gray-600 mb-4">
              LangSavor 서비스 이용을 위해 아래 내용에 동의해 주세요.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-700 space-y-2">
              <p>1. 본 서비스에 입력하는 텍스트는 개인 학습 목적으로만 사용합니다.</p>
              <p>2. 입력한 텍스트의 저작권 관련 법적 책임은 사용자 본인에게 있습니다.</p>
              <p>3. 영리적 목적의 사용을 금지합니다.</p>
              <p>4. 부적절한 활동 발견 시 계정이 정지될 수 있습니다.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAgreeAndContinue}
                className="flex-1 px-4 py-2 bg-[#6D5845] text-white rounded-lg hover:bg-[#5A4839]"
              >
                동의하고 시작하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PastePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <PasteContent />
    </Suspense>
  );
}
