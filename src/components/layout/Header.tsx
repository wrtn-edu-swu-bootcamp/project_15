'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold" style={{ color: '#6D5845' }}>LangSavor</span>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-[#6D5845] transition-colors"
            >
              홈
            </Link>
            <Link 
              href="/articles" 
              className="text-gray-600 hover:text-[#6D5845] transition-colors"
            >
              재료 둘러보기
            </Link>
            <Link 
              href="/guide" 
              className="text-gray-600 hover:text-[#6D5845] transition-colors"
            >
              언론사 가이드
            </Link>
          </nav>

          {/* 로그인/마이페이지 */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/mypage"
                className="text-gray-600 hover:text-[#6D5845] transition-colors"
              >
                마이페이지
              </Link>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="px-4 py-2 text-[#6D5845] border border-[#6D5845] rounded-lg hover:bg-[#6D5845]/10 transition-colors"
              >
                로그인
              </button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
