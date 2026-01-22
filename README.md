# 🍽️ LangSavor

> **Language + Savor** = 언어를 음미하다

미식가가 요리를 음미하듯, 프랑스어 기사 속 언어를 천천히 맛보며 학습하는 서비스입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

---

## 🥘 이런 분께 추천해요

- 🎯 DELF/DALF 시험을 준비하는 분
- 📰 실제 프랑스어 기사로 공부하고 싶은 분
- 📚 교과서 너머의 살아있는 표현을 배우고 싶은 분
- 🇫🇷 프랑스 유학/취업을 준비하는 분

---

## 🍳 주요 기능 (오늘의 메뉴)

### 📝 재료 준비
프랑스어 기사 텍스트를 붙여넣고 CEFR 급수(A1~C2)를 선택하세요.

### 🔍 재료 손질
AI가 텍스트를 분석하여 급수별로 **단어**, **표현**, **문법**을 자동 분류합니다.
- 하이라이트된 단어 위에 마우스를 올리면 뜻과 예문이 나타나요!

### 🧊 냉장고 보관
중요한 단어는 더블클릭하여 **냉장고(단어장)**에 저장하세요.
나중에 마이페이지에서 언제든 꺼내볼 수 있어요.

### 🍳 요리 실습 (퀴즈)
학습한 내용으로 빈칸 채우기 퀴즈를 풀어보세요.
점수에 따라 요리 완성도가 표시됩니다!

| 점수 | 완성도 |
|------|--------|
| 0-30% | 🥚 재료 다듬는 중 |
| 31-50% | 🍳 요리가 익기 시작 |
| 51-70% | 🥘 풍미가 살아나는 중 |
| 71-90% | 🍲 훌륭한 요리! |
| 91-100% | 🍽️ 완벽한 미식가! |

### 👨‍🍳 마이페이지
- 프로필 및 급수 설정
- 냉장고(단어장) 관리
- 퀴즈 기록 및 학습 통계

---

## 🔧 주방 도구 (Tech Stack)

| 도구 | 용도 |
|------|------|
| **Next.js 16** | 프레임워크 |
| **TypeScript** | 타입 안전성 |
| **Tailwind CSS** | 스타일링 |
| **Firebase** | 인증 & 데이터베이스 |
| **Google Gemini** | AI 텍스트 분석 |

---

## 🚀 요리 시작하기 (Getting Started)

### 1️⃣ 재료 준비 (Clone)

```bash
git clone https://github.com/your-username/langsavor.git
cd langsavor
```

### 2️⃣ 도구 설치 (Install)

```bash
npm install
```

### 3️⃣ 비밀 레시피 설정 (Environment Variables)

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 4️⃣ 조리 시작 (Run)

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 맛보세요! 🍴

---

## 📁 주방 구조 (Project Structure)

```
src/
├── app/                    # 페이지들
│   ├── page.tsx           # 🏠 홈
│   ├── paste/             # 📝 텍스트 붙여넣기
│   ├── learn/session/     # 📖 학습 세션
│   ├── quiz/session/      # 🍳 퀴즈
│   ├── mypage/            # 👨‍🍳 마이페이지
│   └── api/               # 🔌 API 라우트
├── components/            # 재사용 컴포넌트
├── contexts/              # 전역 상태 (Auth)
├── lib/                   # 유틸리티
│   ├── firebase.ts        # Firebase 설정
│   ├── firestore.ts       # DB 함수들
│   └── gemini.ts          # AI 분석
└── types/                 # TypeScript 타입
```

---

## 📜 License

MIT License

---

<div align="center">

**🍽️ Bon appétit! 맛있는 프랑스어 학습 되세요! 🇫🇷**

Made with ❤️ by LangSavor Team

</div>
