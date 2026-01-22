# LangSavor 개발 지시서

> 이 문서는 LangSavor 서비스의 백엔드/프론트엔드 통합 개발을 위한 지시서입니다.
> 상세 기획은 `service-planning.md`, UI 구조는 `wireframe.md`를 참조하세요.

---

## 1. 프로젝트 개요

### 서비스 정보
- **서비스명**: LangSavor (랭세이버)
- **브랜드 컨셉**: Language(언어) + Savor(음미하다)
- **슬로건**: "기사 속 언어를 음미하며 프랑스어를 마스터하세요"

### 핵심 기능 요약
1. **기사 텍스트 분석**: 프랑스어 기사를 LLM으로 분석하여 단어/표현/문법 추출
2. **급수별 하이라이팅**: CEFR 급수(A1-C2)에 따라 색상으로 구분 표시
3. **사용자 하이라이팅**: 직접 텍스트 드래그로 학습 항목 추가
4. **퀴즈 시스템**: 객관식/주관식 빈칸 채우기 자동 생성
5. **냉장고(단어장)**: 학습 항목 저장 및 관리
6. **회원/비회원 모드**: 선택적 회원가입

### 요리 컨셉 용어 매핑
| 일반 용어 | 서비스 내 용어 |
|----------|---------------|
| 단어장 | 냉장고 |
| 저장 | 냉장고에 보관 |
| 기사 | 재료 |
| 학습 | 요리 |
| 점수 | 완성도 |
| 학습 기록 | 맛본 기사 |

---

## 2. 기술 스택 (추천)

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 14+ | React 프레임워크 (App Router 사용) |
| TypeScript | 5+ | 타입 안정성 |
| Tailwind CSS | 3+ | 스타일링 |
| Zustand | 4+ | 클라이언트 상태 관리 |
| React Query | 5+ | 서버 상태 관리 |

### 백엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js API Routes | - | API 엔드포인트 |
| Prisma | 5+ | ORM |
| PostgreSQL | 15+ | 데이터베이스 |
| NextAuth.js | 5+ | 인증 |

### 외부 서비스
| 서비스 | 용도 |
|--------|------|
| Claude API / Gemini API | LLM 기반 언어 분석 |
| Vercel | 배포 (권장) |

---

## 3. 데이터 모델

### ERD 개요

```
User ──┬── UserWord (냉장고)
       │
       └── LearningHistory ── Article
                                  │
                              AnalysisResult ──┬── Word
                                               ├── Expression
                                               └── Grammar
                                                      │
                                                   Quiz ── QuizResult
```

### 스키마 정의

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  image         String?
  currentLevel  String    @default("B1") // A1, A2, B1, B2, C1, C2
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  userWords        UserWord[]
  learningHistory  LearningHistory[]
  quizResults      QuizResult[]
}

model Article {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  source      String?
  category    String?  // 시사, 문화, 스포츠, 과학, 라이프스타일
  level       String   // A1-C2
  isCurated   Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  analysisResults  AnalysisResult[]
  learningHistory  LearningHistory[]
}

model AnalysisResult {
  id         String   @id @default(cuid())
  articleId  String
  level      String   // 분석 기준 급수
  words      Json     // 분석된 단어 목록
  expressions Json    // 분석된 표현 목록
  grammar    Json     // 분석된 문법 목록
  createdAt  DateTime @default(now())
  
  article    Article  @relation(fields: [articleId], references: [id])
}

model UserWord {
  id           String   @id @default(cuid())
  userId       String
  word         String
  meaning      String
  level        String   // A1-C2
  partOfSpeech String?  // 품사
  example      String?
  isUserAdded  Boolean  @default(false) // 사용자가 직접 추가한 경우
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

model LearningHistory {
  id         String   @id @default(cuid())
  userId     String
  articleId  String
  quizScore  Int?     // 완성도 (0-100)
  completedAt DateTime @default(now())
  
  user       User     @relation(fields: [userId], references: [id])
  article    Article  @relation(fields: [articleId], references: [id])
  
  @@index([userId])
}

model QuizResult {
  id           String   @id @default(cuid())
  userId       String
  articleId    String
  totalQuestions Int
  correctAnswers Int
  score        Int      // 완성도 (0-100)
  details      Json     // 각 문제별 정답/오답 상세
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
}
```

---

## 4. API 엔드포인트

### 인증 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/[...nextauth]` | NextAuth 인증 처리 |

### 기사 분석 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/articles/analyze` | 텍스트 분석 요청 |
| GET | `/api/articles/curated` | 큐레이션 기사 목록 |
| GET | `/api/articles/curated/[id]` | 큐레이션 기사 상세 |

### 냉장고(단어장) API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/user/words` | 저장된 단어 목록 |
| POST | `/api/user/words` | 단어 저장 |
| DELETE | `/api/user/words/[id]` | 단어 삭제 |

### 퀴즈 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/quiz/generate` | 퀴즈 생성 |
| POST | `/api/quiz/submit` | 퀴즈 제출 및 채점 |
| GET | `/api/quiz/history` | 퀴즈 기록 조회 |

### 사용자 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/user/profile` | 프로필 조회 |
| PATCH | `/api/user/level` | 학습 급수 변경 |
| GET | `/api/user/stats` | 학습 통계 |

---

## 5. LLM 분석 프롬프트

### 기사 분석 요청 프롬프트

```
당신은 프랑스어 언어 분석 전문가입니다. 
다음 프랑스어 텍스트를 분석하여 단어, 표현, 문법을 CEFR 급수(A1-C2)별로 분류해주세요.

[텍스트]
{article_content}

[분석 기준 급수]
{target_level}

다음 JSON 형식으로 응답해주세요:

{
  "words": [
    {
      "word": "단어 원형",
      "foundForm": "텍스트에서 발견된 형태",
      "partOfSpeech": "품사 (n.m./n.f./v./adj./adv. 등)",
      "level": "A1-C2",
      "meaningKo": "한국어 뜻",
      "meaningFr": "프랑스어 정의",
      "example": "예문",
      "position": { "start": 시작인덱스, "end": 끝인덱스 }
    }
  ],
  "expressions": [
    {
      "expression": "표현",
      "level": "A1-C2",
      "meaningKo": "한국어 뜻",
      "usage": "사용법 설명",
      "example": "예문",
      "position": { "start": 시작인덱스, "end": 끝인덱스 }
    }
  ],
  "grammar": [
    {
      "name": "문법 명칭 (한국어)",
      "nameFr": "문법 명칭 (프랑스어)",
      "level": "A1-C2",
      "foundText": "텍스트에서 발견된 부분",
      "explanation": "설명",
      "rule": "문법 규칙",
      "position": { "start": 시작인덱스, "end": 끝인덱스 }
    }
  ]
}
```

### 퀴즈 생성 프롬프트

```
다음 프랑스어 기사와 분석 결과를 바탕으로 빈칸 채우기 퀴즈를 생성해주세요.

[기사 내용]
{article_content}

[분석된 단어/표현/문법]
{analysis_result}

[퀴즈 설정]
- 문제 수: {question_count}
- 급수 범위: {level_range}
- 유형: 객관식 {multiple_choice_count}개, 주관식 {subjective_count}개

다음 JSON 형식으로 응답해주세요:

{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "subjective",
      "category": "word" | "expression" | "grammar",
      "level": "A1-C2",
      "sentence": "빈칸이 포함된 문장",
      "blank": "정답",
      "hint": "힌트 (주관식용)",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"], // 객관식만
      "explanation": "해설"
    }
  ]
}
```

---

## 6. 화면별 구현 가이드

### 6.1 홈 페이지 (`/`)
- 급수 선택 카드 6개 (A1-C2)
- 각 카드 호버 시 급수 설명 툴팁 표시
- 급수 선택 시 학습 방식 선택 페이지로 이동

**호버 툴팁 내용**:
| 급수 | 설명 (50자 이내) |
|------|-----------------|
| A1 | 기본 인사, 자기소개 등 간단한 일상 표현 가능 |
| A2 | 일상적 정보 교환, 간단한 묘사와 대화 가능 |
| B1 | 익숙한 주제에 대해 의견을 표현하고 대처 가능 |
| B2 | 복잡한 텍스트 이해, 원어민과 유창한 대화 가능 |
| C1 | 학술적, 전문적 상황에서 유창하게 소통 가능 |
| C2 | 원어민에 준하는 완벽한 언어 구사력 보유 |

### 6.2 학습 방식 선택 (`/learn`)
- 두 가지 선택지 카드:
  - **엄선된 레시피로**: 큐레이션 기사 선택 → `/articles`
  - **직접 레시피 만들기**: 텍스트 붙여넣기 → `/paste`

### 6.3 기사 선택 페이지 (`/articles`)
- 필터: 카테고리, 급수, 정렬
- 기사 카드 그리드 레이아웃
- 카드 정보: 제목, 요약, 카테고리 태그, 급수, 예상 시간

### 6.4 텍스트 붙여넣기 (`/paste`)
- 큰 텍스트 영역
- 저작권 안내 문구 표시
- "🔪 재료 손질 시작" 버튼
- 프랑스 언론사 가이드 링크

### 6.5 기사 학습 페이지 (`/learn/[id]`)
**핵심 기능 구현 포인트**:

1. **하이라이팅 렌더링**
   - 분석 결과의 position 정보로 텍스트에 span 태그 삽입
   - 급수별 배경색 적용 (CSS 변수 활용)
   - 사용자 추가 항목은 점선 테두리로 구분

2. **호버 팝업**
   - 하이라이팅된 텍스트 호버 시 상세 정보 팝업
   - 팝업 내 "🧊 냉장고에 보관" 버튼

3. **재료 손질하기 토글**
   - OFF 상태: 일반 읽기 모드
   - ON 상태: 드래그로 텍스트 선택 가능
   - 선택 시 LLM 분석 후 저장 확인 팝업

4. **사이드바**
   - 탭: 단어 / 표현 / 문법
   - 급수 필터 체크박스
   - 각 항목에 저장 버튼

**급수별 색상 (Tailwind)**:
```css
:root {
  --level-a1: #FEF08A; /* yellow-200 */
  --level-a2: #FDBA74; /* orange-300 */
  --level-b1: #86EFAC; /* green-300 */
  --level-b2: #93C5FD; /* blue-300 */
  --level-c1: #FCA5A5; /* red-300 */
  --level-c2: #C4B5FD; /* violet-300 */
}
```

### 6.6 퀴즈 페이지 (`/quiz/[articleId]`)
- 진행 바 표시 (문제 번호 / 전체)
- 객관식: 4지선다 버튼
- 주관식: 입력 필드 + 힌트
- [이전] [다음] 버튼
- ⚠️ "[이전]은 퀴즈당 1회만 사용 가능" 안내

### 6.7 퀴즈 결과 페이지 (`/quiz/[articleId]/result`)
**요리 컨셉 적용**:
- 제목: "🍽️ 오늘의 학습 요리 완성!"
- 점수를 완성도로 표시 (예: 80%)
- 완성도별 메시지:
  | 완성도 | 아이콘 | 메시지 |
  |--------|--------|--------|
  | 0-30% | 🥚 | "재료를 다듬는 중이에요. 조금 더 연습해봐요!" |
  | 31-50% | 🍳 | "요리가 익기 시작했어요. 계속 저어주세요!" |
  | 51-70% | 🥘 | "풍미가 살아나고 있어요. 거의 다 왔어요!" |
  | 71-90% | 🍲 | "풍미가 잘 살아난 요리! 훌륭해요!" |
  | 91-100% | 🍽️ | "완벽한 요리 완성! 당신은 언어 미식가!" |

- 카테고리별 결과: "잘 익힌 재료", "더 익혀야 할 재료"
- 버튼: [덜 익은 재료 다시 굽기] [다시 요리하기] [새로운 재료 맛보기]

### 6.8 마이페이지 (`/mypage`)
- 프로필 영역: 이름, 현재 급수 (변경 가능 드롭다운)
- 탭: 학습 기록 / 🧊 냉장고 / 통계
- 학습 기록: "최근 맛본 기사" 목록 (완성도 아이콘 표시)
- 냉장고: 저장된 단어 목록 (필터, 정렬, 삭제)
- 통계: "이번 주 요리 현황" (맛본 기사, 보관 재료, 평균 완성도)

---

## 7. 이용약관 동의 처리

### 첫 이용 시 모달 표시
사용자가 처음 서비스를 이용할 때 (텍스트 붙여넣기 시도 시) 이용약관 동의 모달 표시

**동의 항목**:
1. 본 서비스에 입력하는 텍스트는 개인 학습 목적으로만 사용합니다.
2. 입력한 텍스트의 저작권 관련 법적 책임은 사용자 본인에게 있습니다.
3. 영리적 목적의 사용을 금지합니다.
4. 부적절한 활동 발견 시 계정이 정지될 수 있습니다.

동의 여부를 로컬스토리지 또는 DB에 저장

---

## 8. 프로젝트 구조 (권장)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── page.tsx              # 홈
│   │   ├── learn/
│   │   │   ├── page.tsx          # 학습 방식 선택
│   │   │   └── [id]/page.tsx     # 기사 학습
│   │   ├── articles/page.tsx     # 기사 선택
│   │   ├── paste/page.tsx        # 텍스트 붙여넣기
│   │   ├── quiz/
│   │   │   └── [articleId]/
│   │   │       ├── page.tsx      # 퀴즈 진행
│   │   │       └── result/page.tsx # 퀴즈 결과
│   │   ├── mypage/page.tsx       # 마이페이지
│   │   └── guide/page.tsx        # 언론사 가이드
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── articles/
│   │   ├── quiz/
│   │   └── user/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # 기본 UI 컴포넌트
│   ├── article/
│   │   ├── HighlightedText.tsx   # 하이라이팅 텍스트
│   │   ├── WordPopup.tsx         # 단어 호버 팝업
│   │   └── Sidebar.tsx           # 사이드바
│   ├── quiz/
│   │   ├── MultipleChoice.tsx
│   │   └── Subjective.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── llm.ts                    # LLM API 호출
├── hooks/
│   ├── useAnalysis.ts
│   └── useQuiz.ts
├── stores/
│   └── useAppStore.ts            # Zustand 스토어
├── types/
│   └── index.ts
└── utils/
    └── constants.ts              # 급수별 색상 등
```

---

## 9. 개발 우선순위 (MVP)

### Phase 1: 핵심 기능
1. ✅ 기사 텍스트 분석 (LLM 연동)
2. ✅ 하이라이팅 렌더링
3. ✅ 단어/표현/문법 목록 표시
4. ✅ 퀴즈 생성 및 채점

### Phase 2: 사용자 기능
1. ✅ 회원가입/로그인
2. ✅ 냉장고(단어장) 저장
3. ✅ 학습 기록 저장
4. ✅ 마이페이지

### Phase 3: 부가 기능
1. ✅ 큐레이션 기사 라이브러리
2. ✅ 사용자 하이라이팅 추가
3. ✅ 언론사 가이드
4. ✅ 통계 대시보드

---

## 10. 참고 문서

- 서비스 기획서: `docs/service-planning.md`
- UI 와이어프레임: `docs/wireframe.md`

---

*이 문서는 LangSavor MVP 개발을 위한 지시서입니다. 개발 진행 중 기획 변경 시 업데이트됩니다.*
