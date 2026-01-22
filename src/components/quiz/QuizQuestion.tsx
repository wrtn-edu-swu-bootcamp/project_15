'use client';

import { useState } from 'react';
import { QuizQuestion as QuizQuestionType, LEVEL_COLORS } from '@/types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  userAnswer?: string;
  isReviewing?: boolean;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  userAnswer,
  isReviewing = false,
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState(userAnswer || '');
  const [subjectiveAnswer, setSubjectiveAnswer] = useState(userAnswer || '');

  const handleOptionSelect = (option: string) => {
    if (isReviewing) return;
    setSelectedOption(option);
    onAnswer(option);
  };

  const handleSubjectiveSubmit = () => {
    if (isReviewing) return;
    onAnswer(subjectiveAnswer.trim());
  };

  const getCategoryLabel = () => {
    switch (question.category) {
      case 'word': return '단어';
      case 'expression': return '표현';
      case 'grammar': return '문법';
      default: return '';
    }
  };

  const isCorrect = userAnswer?.toLowerCase() === question.blank.toLowerCase();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* 문제 번호 및 정보 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-800">
            Q{questionNumber} / {totalQuestions}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${LEVEL_COLORS[question.level]}`}>
            {question.level}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">
            {getCategoryLabel()}
          </span>
          <span className="px-2 py-1 text-xs bg-violet-100 rounded text-violet-600">
            {question.type === 'multiple_choice' ? '객관식' : '주관식'}
          </span>
        </div>
      </div>

      {/* 문제 */}
      <div className="mb-8">
        <p className="text-xl text-gray-800 leading-relaxed">
          {question.sentence.split('_____').map((part, idx, arr) => (
            <span key={idx}>
              {part}
              {idx < arr.length - 1 && (
                <span className="inline-block mx-1 px-4 py-1 bg-[#6D5845]/10 rounded border-2 border-[#6D5845]/30 text-[#6D5845] font-bold">
                  {isReviewing ? question.blank : '?????'}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* 객관식 선택지 */}
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isAnswer = option === question.blank;
            
            let optionClass = 'border-gray-200 hover:border-[#6D5845]';
            if (isReviewing) {
              if (isAnswer) {
                optionClass = 'border-green-500 bg-green-50';
              } else if (isSelected && !isAnswer) {
                optionClass = 'border-red-500 bg-red-50';
              }
            } else if (isSelected) {
              optionClass = 'border-[#6D5845] bg-[#6D5845]/10';
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                disabled={isReviewing}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${optionClass}`}
              >
                <span className="font-medium text-gray-600 mr-3">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span className="text-gray-800">{option}</span>
                {isReviewing && isAnswer && (
                  <span className="ml-2 text-green-600">✓ 정답</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 주관식 입력 */}
      {question.type === 'subjective' && (
        <div className="space-y-4">
          {question.hint && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-700 text-sm">💡 힌트: {question.hint}</span>
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              value={subjectiveAnswer}
              onChange={(e) => setSubjectiveAnswer(e.target.value)}
              disabled={isReviewing}
              placeholder="답을 입력하세요..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#6D5845]"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSubjectiveSubmit();
              }}
            />
            {!isReviewing && (
              <button
                onClick={handleSubjectiveSubmit}
                className="px-6 py-3 bg-[#6D5845] text-white rounded-lg font-medium hover:bg-[#5A4839]"
              >
                제출
              </button>
            )}
          </div>

          {isReviewing && (
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✓ 정답입니다!' : `✗ 오답입니다. 정답: ${question.blank}`}
              </p>
              {userAnswer && !isCorrect && (
                <p className="text-gray-600 text-sm mt-1">내 답: {userAnswer}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 해설 (리뷰 모드) */}
      {isReviewing && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-700 mb-2">📖 해설</p>
          <p className="text-gray-600">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
