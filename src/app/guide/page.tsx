import Link from 'next/link';

const MEDIA_OUTLETS = [
  {
    name: 'Le Monde',
    level: 'B2-C2',
    type: '일간지',
    style: '중도좌파',
    characteristics: '심층 분석, 국제 뉴스, 문화 섹션이 강함',
    accessibility: '부분 유료',
    url: 'https://www.lemonde.fr',
  },
  {
    name: 'Le Figaro',
    level: 'B2-C2',
    type: '일간지',
    style: '중도우파',
    characteristics: '정치, 경제, 문화 등 종합 보도',
    accessibility: '부분 유료',
    url: 'https://www.lefigaro.fr',
  },
  {
    name: 'Libération',
    level: 'B2-C2',
    type: '일간지',
    style: '진보',
    characteristics: '사회 이슈, 문화, 예술에 강점',
    accessibility: '부분 유료',
    url: 'https://www.liberation.fr',
  },
  {
    name: "L'Express",
    level: 'B1-C1',
    type: '주간지',
    characteristics: '정치, 경제 심층 분석',
    accessibility: '부분 유료',
    url: 'https://www.lexpress.fr',
  },
  {
    name: 'France 24',
    level: 'B1-B2',
    type: '뉴스 채널',
    characteristics: '국제 뉴스 전문, 다국어 제공',
    accessibility: '무료',
    url: 'https://www.france24.com/fr',
  },
  {
    name: 'RFI',
    level: 'A2-B2',
    type: '라디오/뉴스',
    characteristics: '쉬운 프랑스어 섹션 제공, 학습자 친화적',
    accessibility: '무료',
    url: 'https://www.rfi.fr',
  },
  {
    name: 'TV5Monde',
    level: 'A2-B2',
    type: '방송/교육',
    characteristics: '프랑스어 학습 자료, 자막 있는 영상',
    accessibility: '무료',
    url: 'https://www.tv5monde.com',
  },
  {
    name: '1jour1actu',
    level: 'A1-B1',
    type: '어린이/청소년',
    characteristics: '쉬운 문장, 시사 주제를 아이들 눈높이로 설명',
    accessibility: '무료',
    url: 'https://www.1jour1actu.com',
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📰 프랑스 언론사 가이드</h1>
        <p className="text-gray-600 mb-8">
          급수와 목적에 맞는 언론사에서 신선한 재료를 구해보세요!
        </p>

        {/* 언론사 카드 목록 */}
        <div className="space-y-4">
          {MEDIA_OUTLETS.map((media, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">{media.name}</h2>
                    <span className="px-2 py-1 bg-[#6D5845]/10 text-[#6D5845] text-xs rounded">
                      {media.level}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {media.type}
                    </span>
                    {media.style && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                        {media.style}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{media.characteristics}</p>
                  <p className="text-sm">
                    <span className="text-gray-500">접근성: </span>
                    <span className={`font-medium ${
                      media.accessibility === '무료' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {media.accessibility}
                    </span>
                  </p>
                </div>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#6D5845] text-[#6D5845] rounded-lg text-sm hover:bg-[#6D5845]/10 transition-colors whitespace-nowrap"
                >
                  방문하기 →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 활용 팁 */}
        <div className="mt-12 bg-[#FDF5ED] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">💡 재료 선택 팁</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span>🥗</span>
              <span><strong>입문자 (A1-A2):</strong> 1jour1actu, RFI 쉬운 프랑스어로 시작하세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🥘</span>
              <span><strong>중급자 (B1-B2):</strong> France 24, L'Express로 다양한 주제에 도전!</span>
            </li>
            <li className="flex items-start gap-2">
              <span>🍽️</span>
              <span><strong>고급자 (C1-C2):</strong> Le Monde, Le Figaro의 심층 분석으로 실력을 다듬으세요.</span>
            </li>
          </ul>
        </div>

        {/* 사용 안내 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>저작권 안내:</strong> 기사 복사 시 개인 학습 목적으로만 사용해 주세요. 
            영리 목적 사용은 금지되어 있으며, 저작권 관련 책임은 사용자에게 있습니다.
          </p>
        </div>

        {/* 돌아가기 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[#6D5845] hover:underline"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
