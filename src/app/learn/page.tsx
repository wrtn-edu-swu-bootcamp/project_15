'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CEFRLevel, LEVEL_NAMES, LEVEL_COLORS } from '@/types';
import { Suspense } from 'react';

function LearnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = (searchParams.get('level') as CEFRLevel) || 'B1';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 현재 급수 표시 */}
        <div className="mb-8 text-center">
          <span className="text-gray-600">현재 선택된 급수: </span>
          <span className={`inline-block px-3 py-1 rounded-lg font-semibold ${LEVEL_COLORS[level]}`}>
            {level} {LEVEL_NAMES[level]}
          </span>
          <button
            onClick={() => router.push('/')}
              className="ml-2 text-sm text-[#6D5845] hover:underline"
          >
            변경
          </button>
        </div>

        {/* 학습 방식 선택 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-6 text-center">
            오늘의 요리 스타일을 선택하세요
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 큐레이션 기사 */}
            <Link
              href={`/articles?level=${level}`}
              className="block p-8 border-2 border-gray-200 rounded-xl hover:border-[#6D5845] hover:shadow-lg transition-all"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  엄선된 레시피로
                </h2>
                <p className="text-gray-600 text-sm">
                  미리 선별된 양질의 기사로<br />바로 요리 시작
                </p>
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 bg-[#6D5845]/10 text-[#6D5845] rounded-lg text-sm font-medium">
                    재료 둘러보기
                  </span>
                </div>
              </div>
            </Link>

            {/* 직접 입력 */}
            <Link
              href={`/paste?level=${level}`}
              className="block p-8 border-2 border-gray-200 rounded-xl hover:border-[#6D5845] hover:shadow-lg transition-all"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">✏️</div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  직접 레시피 만들기
                </h2>
                <p className="text-gray-600 text-sm">
                  원하는 기사를<br />복사해서 붙여넣기
                </p>
                <div className="mt-4">
                  <span className="inline-block px-4 py-2 bg-[#6D5845]/10 text-[#6D5845] rounded-lg text-sm font-medium">
                    텍스트 입력하기
                  </span>
                </div>
              </div>
            </Link>
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
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <LearnContent />
    </Suspense>
  );
}
