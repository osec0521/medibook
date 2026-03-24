import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect, // 추가
  getRedirectResult,   // 추가
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface FirebaseContextType {
  user: User | null;
  role: 'admin' | 'client' | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'client' | null>(null);
  const [loading, setLoading] = useState(true);

  // 리다이렉트 로그인 결과 처리 및 권한 확인
  useEffect(() => {
    const handleAuthChange = async () => {
      try {
        // 1. 리다이렉트 후 돌아온 결과가 있는지 먼저 확인 (모바일 대응)
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("리다이렉트 로그인 성공");
        }

        // 2. 인증 상태 변경 감지
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              setRole(userDoc.data().role);
            } else {
              const newRole = currentUser.email === 'osec0521@gmail.com' ? 'admin' : 'client';
              await setDoc(userDocRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                role: newRole,
                createdAt: new Date().toISOString()
              });
              setRole(newRole);
            }
          } else {
            setRole(null);
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Auth process error:", error);
        setLoading(false);
      }
    };

    const unsubPromise = handleAuthChange();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    // 가급적 계정 선택창이 뜨도록 설정
    provider.setCustomParameters({ prompt: 'select_account' });

    const userAgent = window.navigator.userAgent.toLowerCase();
    // 모바일 기기 또는 인앱 브라우저 여부 확인
    const isMobile = /iphone|ipad|ipod|android/i.test(userAgent);
    const isInApp = /kakaotalk|instagram|line|fbav|fb_iab|messenger|naver/i.test(userAgent);

    try {
      if (isMobile || isInApp) {
        // 모바일/인앱 브라우저에서는 팝업 대신 리다이렉트 사용 (필수)
        await signInWithRedirect(auth, provider);
      } else {
        // PC 브라우저에서는 기존처럼 팝업 사용
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      console.error("로그인 중 에러 발생:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};