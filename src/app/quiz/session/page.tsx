'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import { QuizQuestion as QuizQuestionType, SCORE_MESSAGES, LEVEL_COLORS, LEVEL_NAMES, CEFRLevel } from '@/types';

interface SessionData {
  content: string;
  level: CEFRLevel;
  analysis: {
    words: unknown[];
    expressions: unknown[];
    grammar: unknown[];
  };
}

export default function QuizSessionPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [previousUsed, setPreviousUsed] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      const data = sessionStorage.getItem('quizSessionData');
      if (!data) {
        router.push('/');
        return;
      }

      const parsed = JSON.parse(data);
      setSessionData(parsed);

      try {
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: parsed.content,
            analysis: parsed.analysis,
            questionCount: 10,
            level: parsed.level,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setQuestions(result.quiz.questions);
        }
      } catch (error) {
        console.error('Quiz load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [router]);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: answer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!previousUsed && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setPreviousUsed(true);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.toLowerCase() === q.blank.toLowerCase()) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const getScoreMessage = (score: number) => {
    return SCORE_MESSAGES.find((m) => score >= m.min && score <= m.max) || SCORE_MESSAGES[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🍳</div>
          <p className="text-xl text-gray-600">퀴즈 요리 준비 중...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const score = calculateScore();
    const scoreMessage = getScoreMessage(score);
    const correctCount = questions.filter(
      (q) => answers[q.id]?.toLowerCase() === q.blank.toLowerCase()
    ).length;

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 결과 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
            <div className="text-6xl mb-4">{scoreMessage.icon}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">요리 완성!</h1>
            <p className="text-gray-600 mb-6">{scoreMessage.message}</p>

            {/* 점수 */}
            <div className="inline-flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-gray-500">완성도</p>
                <p className="text-3xl font-bold text-[#6D5845]">{score}%</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <p className="text-sm text-gray-500">정답</p>
                <p className="text-3xl font-bold text-green-600">
                  {correctCount}/{questions.length}
                </p>
              </div>
            </div>

            {/* 급수 태그 */}
            {sessionData && (
              <div className="mt-6">
                <span className={`px-4 py-2 rounded-lg font-semibold ${LEVEL_COLORS[sessionData.level]}`}>
                  {sessionData.level} {LEVEL_NAMES[sessionData.level]}
                </span>
              </div>
            )}
          </div>

          {/* 문제별 결과 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">📋 문제별 결과</h2>
            {questions.map((q, idx) => {
              const isCorrect = answers[q.id]?.toLowerCase() === q.blank.toLowerCase();
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
                    <span className="font-medium text-gray-700">Q{idx + 1}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${LEVEL_COLORS[q.level]}`}>
                      {q.level}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{q.sentence}</p>
                  {!isCorrect && (
                    <p className="text-sm">
                      <span className="text-red-600">내 답: {answers[q.id] || '(미응답)'}</span>
                      <span className="mx-2">|</span>
                      <span className="text-green-600">정답: {q.blank}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              홈으로
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setAnswers({});
                setIsCompleted(false);
                setPreviousUsed(false);
              }}
              className="flex-1 py-3 bg-[#6D5845] text-white rounded-xl hover:bg-[#5A4839]"
            >
              다시 도전
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">퀴즈를 불러올 수 없습니다.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>진행률</span>
            <span>{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6D5845] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 문제 */}
        <QuizQuestion
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          userAnswer={answers[currentQuestion.id]}
        />

        {/* 네비게이션 */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || previousUsed}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 이전
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!answers[currentQuestion.id]}
              className="px-8 py-2 bg-[#6D5845] text-white rounded-lg font-semibold hover:bg-[#5A4839] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🍽️ 요리 완성
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="px-6 py-2 bg-[#6D5845] text-white rounded-lg hover:bg-[#5A4839] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 →
            </button>
          )}
        </div>

        {/* 이전 버튼 안내 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            ⚠️ 정확한 학습 추이 분석을 위해 [이전]은 퀴즈당 1회만 사용 가능합니다.
            {previousUsed && <span className="text-red-500 ml-2">(사용 완료)</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
