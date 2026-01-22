'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CEFRLevel, LEVEL_NAMES, LEVEL_COLORS } from '@/types';

// 샘플 큐레이션 기사 데이터
const CURATED_ARTICLES = [
  {
    id: '1',
    title: 'Le réchauffement climatique : un défi mondial',
    preview: 'Les scientifiques alertent sur les conséquences du changement climatique...',
    source: 'Le Monde',
    category: '환경',
    level: 'B2' as CEFRLevel,
    readTime: '5분',
  },
  {
    id: '2',
    title: 'La culture française à travers la gastronomie',
    preview: 'La cuisine française est inscrite au patrimoine mondial de l\'UNESCO...',
    source: 'France Culture',
    category: '문화',
    level: 'B1' as CEFRLevel,
    readTime: '4분',
  },
  {
    id: '3',
    title: 'Les Jeux Olympiques de Paris 2024',
    preview: 'Paris accueillera les Jeux Olympiques pour la troisième fois...',
    source: 'L\'Équipe',
    category: '스포츠',
    level: 'A2' as CEFRLevel,
    readTime: '3분',
  },
  {
    id: '4',
    title: "L'intelligence artificielle dans notre quotidien",
    preview: "L'IA transforme progressivement notre façon de vivre et de travailler...",
    source: 'Le Figaro',
    category: '기술',
    level: 'B2' as CEFRLevel,
    readTime: '6분',
  },
  {
    id: '5',
    title: 'Apprendre une nouvelle langue : conseils pratiques',
    preview: 'Voici quelques conseils pour améliorer votre apprentissage...',
    source: 'RFI',
    category: '교육',
    level: 'A2' as CEFRLevel,
    readTime: '3분',
  },
  {
    id: '6',
    title: 'La politique économique de l\'Union européenne',
    preview: 'L\'UE fait face à des défis économiques majeurs en cette période...',
    source: 'Les Échos',
    category: '경제',
    level: 'C1' as CEFRLevel,
    readTime: '7분',
  },
];

const CATEGORIES = ['전체', '환경', '문화', '스포츠', '기술', '교육', '경제'];

function ArticlesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const level = (searchParams.get('level') as CEFRLevel) || 'B1';
  const category = searchParams.get('category') || '전체';
  const [isLoading, setIsLoading] = useState(false);
  const [loadingArticleId, setLoadingArticleId] = useState<string | null>(null);

  const filteredArticles = CURATED_ARTICLES.filter((article) => {
    const levelMatch = true; // 모든 급수 표시, 급수는 태그로 표시
    const categoryMatch = category === '전체' || article.category === category;
    return levelMatch && categoryMatch;
  });

  const handleArticleClick = async (articleId: string) => {
    const article = CURATED_ARTICLES.find((a) => a.id === articleId);
    if (article) {
      setIsLoading(true);
      setLoadingArticleId(articleId);
      
      try {
        const sampleContent = getSampleContent(articleId);
        
        // API 분석 호출
        const response = await fetch('/api/articles/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: sampleContent, level }),
        });
        
        const data = await response.json();
        
        // 세션에 분석 결과 저장 후 학습 페이지로 이동
        sessionStorage.setItem('analysisData', JSON.stringify({
          content: sampleContent,
          level,
          analysis: data.analysis,
        }));
        
        router.push('/learn/session');
      } catch (error) {
        console.error('Analysis error:', error);
        alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
        setLoadingArticleId(null);
      }
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 현재 급수 표시 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-gray-600">현재 급수: </span>
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
          <Link
            href={`/paste?level=${level}`}
            className="px-4 py-2 bg-[#6D5845]/10 text-[#6D5845] rounded-lg text-sm hover:bg-[#6D5845]/20"
          >
            ✏️ 직접 입력하기
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">📚 재료 둘러보기</h1>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/articles?level=${level}&category=${cat}`)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                category === cat
                  ? 'bg-[#6D5845] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 기사 목록 */}
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => !isLoading && handleArticleClick(article.id)}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all ${
                isLoading 
                  ? 'cursor-wait opacity-70' 
                  : 'cursor-pointer hover:shadow-md hover:border-[#6D5845]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${LEVEL_COLORS[article.level]}`}>
                      {article.level}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.source}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{article.preview}</p>
                </div>
                <div className="text-right">
                  {loadingArticleId === article.id ? (
                    <span className="text-sm text-[#6D5845]">분석 중... 🍳</span>
                  ) : (
                    <span className="text-xs text-gray-400">⏱️ {article.readTime}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 카테고리의 기사가 없습니다.</p>
          </div>
        )}

        {/* 안내 */}
        <div className="mt-8 p-4 bg-[#FDF5ED] rounded-lg">
          <p className="text-sm text-[#6D5845]">
            💡 <strong>팁:</strong> 원하는 기사가 없다면 
            <Link href={`/paste?level=${level}`} className="underline ml-1">
              직접 텍스트를 붙여넣기
            </Link>
            하거나{' '}
            <Link href="/guide" className="underline">
              프랑스 언론사 가이드
            </Link>
            를 참고해보세요!
          </p>
        </div>
      </div>
    </div>
  );
}

// 샘플 기사 내용 (실제로는 DB/API에서 가져옴)
function getSampleContent(articleId: string): string {
  const contents: Record<string, string> = {
    '1': `Le réchauffement climatique est l'un des défis les plus importants de notre époque. Les scientifiques du monde entier alertent sur les conséquences dramatiques du changement climatique.

La température moyenne de la planète a augmenté de 1,1°C depuis l'ère préindustrielle. Cette hausse peut sembler faible, mais elle a des effets considérables sur notre environnement.

Les glaciers fondent à une vitesse alarmante. Le niveau des mers monte progressivement. Les événements météorologiques extrêmes deviennent plus fréquents et plus intenses.

Il est essentiel que nous agissions maintenant. Chaque geste compte : réduire notre consommation d'énergie, privilégier les transports en commun, et adopter une alimentation plus durable.`,
    '2': `La gastronomie française est reconnue dans le monde entier. En 2010, le "repas gastronomique des Français" a été inscrit au patrimoine culturel immatériel de l'UNESCO.

La cuisine française se caractérise par sa diversité régionale. Chaque région possède ses spécialités : la bouillabaisse à Marseille, la choucroute en Alsace, le cassoulet dans le Sud-Ouest.

Les repas en France sont un moment de partage et de convivialité. On prend le temps de savourer chaque plat, de discuter en famille ou entre amis.

Les chefs français sont des artistes qui perpétuent cette tradition tout en innovant. La nouvelle cuisine a révolutionné les pratiques culinaires dans les années 1970.`,
    '3': `Paris accueillera les Jeux Olympiques en 2024. C'est la troisième fois que la capitale française organise cet événement mondial, après 1900 et 1924.

Les compétitions auront lieu dans des sites emblématiques. Le beach-volley se jouera au pied de la Tour Eiffel. L'escrime et le taekwondo seront au Grand Palais.

Les organisateurs veulent des Jeux durables et responsables. La plupart des installations sont déjà existantes ou temporaires.

Les athlètes du monde entier viendront à Paris pour réaliser leurs rêves. Ce sera une grande fête du sport et de la fraternité.`,
    '4': `L'intelligence artificielle transforme notre quotidien. Des assistants vocaux aux voitures autonomes, l'IA est partout.

Les entreprises utilisent l'IA pour améliorer leurs services. Les médecins s'en servent pour diagnostiquer des maladies. Les chercheurs l'emploient pour accélérer leurs découvertes.

Cependant, l'IA soulève des questions éthiques importantes. Comment protéger la vie privée ? Comment éviter les biais algorithmiques ? Quel sera l'impact sur l'emploi ?

Il est crucial de développer une IA responsable et transparente. Les régulateurs travaillent sur des cadres juridiques adaptés à ces nouvelles technologies.`,
    '5': `Apprendre une nouvelle langue demande de la patience et de la pratique. Voici quelques conseils pour progresser efficacement.

Premièrement, immergez-vous dans la langue. Écoutez des podcasts, regardez des films en version originale, lisez des articles.

Deuxièmement, pratiquez régulièrement. Il vaut mieux étudier 15 minutes chaque jour qu'une heure une fois par semaine.

Troisièmement, n'ayez pas peur de faire des erreurs. Les erreurs font partie de l'apprentissage. Parlez avec des natifs dès que possible.

Enfin, amusez-vous ! Choisissez des sujets qui vous intéressent. La motivation est la clé du succès.`,
    '6': `La politique économique de l'Union européenne fait face à des défis majeurs. L'inflation, la crise énergétique et les tensions géopolitiques compliquent la situation.

La Banque centrale européenne a relevé ses taux d'intérêt pour lutter contre l'inflation. Cette décision a des répercussions sur les emprunts et les investissements.

Le plan de relance européen, doté de 750 milliards d'euros, vise à soutenir la reprise économique. Les États membres doivent soumettre des projets de réformes pour bénéficier de ces fonds.

La transition écologique est au cœur des priorités. Le Pacte vert européen ambitionne de faire de l'Europe le premier continent neutre en carbone d'ici 2050.`,
  };

  return contents[articleId] || contents['1'];
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}
