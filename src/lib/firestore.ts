import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Article, UserWord, AnalysisResult, CEFRLevel } from '@/types';

// ============ Users ============

export async function getUser(userId: string): Promise<User | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email,
      displayName: data.displayName,
      currentLevel: data.currentLevel,
      createdAt: data.createdAt?.toDate(),
    } as User;
  }
  return null;
}

export async function createUser(userId: string, data: Omit<User, 'id' | 'createdAt'>) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
  }).catch(() => {
    // 문서가 없으면 새로 생성
    return addDoc(collection(db, 'users'), {
      ...data,
      createdAt: Timestamp.now(),
    });
  });
}

export async function updateUserLevel(userId: string, level: CEFRLevel) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { currentLevel: level });
}

// ============ Articles ============

export async function getArticle(articleId: string): Promise<Article | null> {
  const docRef = doc(db, 'articles', articleId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      content: data.content,
      source: data.source,
      category: data.category,
      level: data.level,
      isCurated: data.isCurated,
      createdAt: data.createdAt?.toDate(),
    } as Article;
  }
  return null;
}

export async function getCuratedArticles(level?: CEFRLevel, category?: string) {
  let q = query(
    collection(db, 'articles'),
    where('isCurated', '==', true),
    orderBy('createdAt', 'desc')
  );

  if (level) {
    q = query(q, where('level', '==', level));
  }
  
  if (category) {
    q = query(q, where('category', '==', category));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Article[];
}

export async function saveArticle(article: Omit<Article, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'articles'), {
    ...article,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// ============ Analysis Results ============

export async function saveAnalysisResult(articleId: string, level: CEFRLevel, result: AnalysisResult) {
  const analysisRef = collection(db, 'articles', articleId, 'analysisResults');
  const docRef = await addDoc(analysisRef, {
    level,
    words: result.words,
    expressions: result.expressions,
    grammar: result.grammar,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getAnalysisResult(articleId: string, level: CEFRLevel): Promise<AnalysisResult | null> {
  const q = query(
    collection(db, 'articles', articleId, 'analysisResults'),
    where('level', '==', level),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  const data = querySnapshot.docs[0].data();
  return {
    words: data.words,
    expressions: data.expressions,
    grammar: data.grammar,
  };
}

// ============ User Words (냉장고) ============

export async function getUserWords(userId: string, level?: CEFRLevel) {
  let q = query(
    collection(db, 'userWords'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (level) {
    q = query(q, where('level', '==', level));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as UserWord[];
}

export async function saveUserWord(data: Omit<UserWord, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'userWords'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function deleteUserWord(wordId: string) {
  await deleteDoc(doc(db, 'userWords', wordId));
}

// ============ Quiz Results ============

export async function saveQuizResult(
  userId: string,
  articleId: string,
  result: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    details: DocumentData[];
  }
) {
  const docRef = await addDoc(collection(db, 'quizResults'), {
    userId,
    articleId,
    ...result,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getUserQuizHistory(userId: string, limitCount = 10) {
  const q = query(
    collection(db, 'quizResults'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  }));
}
