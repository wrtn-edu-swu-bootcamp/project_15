import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* 브랜드 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-lg font-semibold text-gray-700">LangSavor</span>
          </div>
          
          {/* 슬로건 */}
          <p className="text-gray-500 text-sm">
            언어의 맛을 음미하다
          </p>

          {/* 링크 */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-[#6D5845] transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-[#6D5845] transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="hover:text-[#6D5845] transition-colors">
              문의하기
            </Link>
          </nav>

          {/* 저작권 */}
          <p className="text-gray-400 text-xs">
            © 2025 LangSavor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
