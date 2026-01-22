'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getUserWords, deleteUserWord, getUserQuizHistory } from '@/lib/firestore';
import { CEFRLevel, LEVEL_COLORS, LEVEL_NAMES, UserWord, SCORE_MESSAGES } from '@/types';

interface QuizHistoryItem {
  id: string;
  articleId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  createdAt: Date;
}

const ALL_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function MyPage() {
  const router = useRouter();
  const { user, userProfile, loading, updateUserLevel } = useAuth();
  const [activeTab, setActiveTab] = useState<'fridge' | 'quiz' | 'stats'>('fridge');
  const [savedWords, setSavedWords] = useState<UserWord[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [isChangingLevel, setIsChangingLevel] = useState(false);

  // 데이터 로드
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, loading, router]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // 저장된 단어와 퀴즈 기록 병렬 로드
      const [words, history] = await Promise.all([
        getUserWords(user.uid),
        getUserQuizHistory(user.uid, 10),
      ]);
      
      setSavedWords(words as UserWord[]);
      setQuizHistory(history as QuizHistoryItem[]);
    } catch (error) {
      console.error('데이터 로드 에러:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 단어 삭제
  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('이 단어를 냉장고에서 삭제하시겠습니까?')) return;
    
    try {
      await deleteUserWord(wordId);
      setSavedWords(prev => prev.filter(w => w.id !== wordId));
    } catch (error) {
      console.error('단어 삭제 에러:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 급수 변경
  const handleLevelChange = async (newLevel: CEFRLevel) => {
    if (!user || newLevel === userProfile?.currentLevel) return;
    
    setIsChangingLevel(true);
    try {
      await updateUserLevel(newLevel);
      alert(`학습 급수가 ${newLevel}(으)로 변경되었습니다.`);
    } catch (error) {
      console.error('급수 변경 에러:', error);
      alert('급수 변경에 실패했습니다.');
    } finally {
      setIsChangingLevel(false);
    }
  };

  // 필터링된 단어
  const filteredWords = selectedLevel === 'all' 
    ? savedWords 
    : savedWords.filter(w => w.level === selectedLevel);

  // 통계 계산
  const stats = {
    totalWords: savedWords.length,
    wordsByLevel: ALL_LEVELS.reduce((acc, level) => {
      acc[level] = savedWords.filter(w => w.level === level).length;
      return acc;
    }, {} as Record<CEFRLevel, number>),
    totalQuizzes: quizHistory.length,
    averageScore: quizHistory.length > 0
      ? Math.round(quizHistory.reduce((sum, q) => sum + q.score, 0) / quizHistory.length)
      : 0,
  };

  // 점수에 따른 메시지
  const getScoreMessage = (score: number) => {
    return SCORE_MESSAGES.find(m => score >= m.min && score <= m.max) || SCORE_MESSAGES[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🍳</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            {userProfile?.photoURL ? (
              <Image
                src={userProfile.photoURL}
                alt="프로필"
                width={80}
                height={80}
                className="rounded-full border-4 border-[#6D5845]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#6D5845] text-white flex items-center justify-center text-3xl font-bold">
                {userProfile?.displayName?.charAt(0) || '?'}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {userProfile?.displayName || '사용자'}
              </h1>
              <p className="text-gray-500">{userProfile?.email}</p>
              
              {/* 급수 변경 */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-600">현재 학습 급수:</span>
                <select
                  value={userProfile?.currentLevel || 'B1'}
                  onChange={(e) => handleLevelChange(e.target.value as CEFRLevel)}
                  disabled={isChangingLevel}
                  className={`px-3 py-1 rounded-lg border-2 font-semibold ${LEVEL_COLORS[userProfile?.currentLevel || 'B1']} border-transparent focus:outline-none focus:ring-2 focus:ring-[#6D5845]`}
                >
                  {ALL_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level} {LEVEL_NAMES[level]}
                    </option>
                  ))}
                </select>
                {isChangingLevel && (
                  <div className="w-4 h-4 border-2 border-[#6D5845] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('fridge')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'fridge'
                ? 'bg-[#6D5845] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🧊 냉장고 ({savedWords.length})
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'quiz'
                ? 'bg-[#6D5845] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🍳 퀴즈 기록 ({quizHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-[#6D5845] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            📊 학습 통계
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin text-4xl">🍳</div>
            </div>
          ) : (
            <>
              {/* 냉장고 탭 */}
              {activeTab === 'fridge' && (
                <div id="fridge">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">🧊 내 냉장고</h2>
                    
                    {/* 급수 필터 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedLevel('all')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedLevel === 'all'
                            ? 'bg-[#6D5845] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        전체
                      </button>
                      {ALL_LEVELS.map(level => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            selectedLevel === level
                              ? `${LEVEL_COLORS[level]}`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredWords.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-4xl mb-4">🧊</p>
                      <p>냉장고가 비어있어요.</p>
                      <p className="text-sm mt-2">학습 중 마음에 드는 단어를 저장해보세요!</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {filteredWords.map(word => (
                        <div
                          key={word.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{word.word}</span>
                              <span className={`px-2 py-0.5 text-xs rounded ${LEVEL_COLORS[word.level]}`}>
                                {word.level}
                              </span>
                              {word.partOfSpeech && (
                                <span className="text-xs text-gray-500">({word.partOfSpeech})</span>
                              )}
                              {word.isUserAdded && (
                                <span className="text-xs text-[#6D5845] bg-[#6D5845]/10 px-1 rounded">
                                  ✨ 직접 추가
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{word.meaning}</p>
                            {word.example && (
                              <p className="text-gray-400 text-xs mt-1 italic">{word.example}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteWord(word.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 퀴즈 기록 탭 */}
              {activeTab === 'quiz' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">🍳 퀴즈 기록</h2>
                  
                  {quizHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-4xl mb-4">🍳</p>
                      <p>아직 퀴즈 기록이 없어요.</p>
                      <p className="text-sm mt-2">기사를 분석하고 퀴즈를 풀어보세요!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizHistory.map((quiz, idx) => {
                        const message = getScoreMessage(quiz.score);
                        return (
                          <div
                            key={quiz.id}
                            className="p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {quiz.createdAt?.toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                <p className="text-gray-700 mt-1">
                                  {quiz.correctAnswers} / {quiz.totalQuestions} 문제 정답
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl">{message.icon}</div>
                                <div className="text-2xl font-bold text-[#6D5845]">
                                  {quiz.score}%
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{message.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 학습 통계 탭 */}
              {activeTab === 'stats' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">📊 학습 통계</h2>
                  
                  {/* 요약 카드 */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#FDF5ED] rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#6D5845]">{stats.totalWords}</p>
                      <p className="text-sm text-gray-600 mt-1">저장된 단어</p>
                    </div>
                    <div className="bg-[#FDF5ED] rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#6D5845]">{stats.totalQuizzes}</p>
                      <p className="text-sm text-gray-600 mt-1">완료한 퀴즈</p>
                    </div>
                    <div className="bg-[#FDF5ED] rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#6D5845]">{stats.averageScore}%</p>
                      <p className="text-sm text-gray-600 mt-1">평균 완성도</p>
                    </div>
                  </div>

                  {/* 급수별 단어 분포 */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">급수별 저장 단어</h3>
                    <div className="space-y-2">
                      {ALL_LEVELS.map(level => {
                        const count = stats.wordsByLevel[level];
                        const percentage = stats.totalWords > 0
                          ? (count / stats.totalWords) * 100
                          : 0;
                        
                        return (
                          <div key={level} className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs rounded font-semibold w-12 text-center ${LEVEL_COLORS[level]}`}>
                              {level}
                            </span>
                            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${LEVEL_COLORS[level].split(' ')[0]} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {count}개
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 요리 완성도 */}
                  {stats.averageScore > 0 && (
                    <div className="bg-[#6D5845]/10 rounded-xl p-4">
                      <p className="text-center">
                        <span className="text-4xl">{getScoreMessage(stats.averageScore).icon}</span>
                      </p>
                      <p className="text-center text-[#6D5845] font-medium mt-2">
                        {getScoreMessage(stats.averageScore).message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
