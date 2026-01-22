'use client';

import { useRouter } from 'next/navigation';
import LevelCard from '@/components/LevelCard';
import { CEFRLevel } from '@/types';

const LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Home() {
  const router = useRouter();

  const handleLevelSelect = (level: CEFRLevel) => {
    router.push(`/paste?level=${level}`);
  };

  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-[#FDF5ED] to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🍽️ LangSavor
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            "기사 속 언어를 음미하며 프랑스어를 마스터하세요"
          </p>

          {/* 급수 선택 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">
              학습할 급수를 선택하세요
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {LEVELS.map((level) => (
                <LevelCard
                  key={level}
                  level={level}
                  onClick={handleLevelSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 추천 대상 섹션 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            📚 이런 분들께 추천합니다
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-[#FDF5ED] rounded-xl text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-800">DELF/DALF 시험 준비생</h3>
              <p className="text-sm text-gray-600 mt-2">
                급수별 맞춤 학습으로 시험 대비
              </p>
            </div>
            <div className="p-6 bg-[#FDF5ED] rounded-xl text-center">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-800">프랑스어 전공 학생</h3>
              <p className="text-sm text-gray-600 mt-2">
                실제 기사로 어휘력 향상
              </p>
            </div>
            <div className="p-6 bg-[#FDF5ED] rounded-xl text-center">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="font-semibold text-gray-800">유학/취업 준비생</h3>
              <p className="text-sm text-gray-600 mt-2">
                실용적인 프랑스어 학습
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            ✨ LangSavor의 특별함
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl mb-3">📰</div>
              <h3 className="font-semibold text-gray-800">신선한 재료</h3>
              <p className="text-sm text-gray-600 mt-2">
                실제 프랑스어 기사로 살아있는 언어 학습
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl mb-3">🔪</div>
              <h3 className="font-semibold text-gray-800">급수별 손질</h3>
              <p className="text-sm text-gray-600 mt-2">
                AI가 단어/표현/문법을 급수별로 분류
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl mb-3">🍳</div>
              <h3 className="font-semibold text-gray-800">실력 테스트</h3>
              <p className="text-sm text-gray-600 mt-2">
                퀴즈로 학습 내용을 바로 점검
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
