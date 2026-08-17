'use client';

import React, { useEffect, useState } from 'react';

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { auth, db, googleProvider } from './firebase';

import LevelSelector from './components/LevelSelector';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AiCoach from './components/AiCoach';
import Pomodoro from './components/Pomodoro';
import Settings from './components/Settings';
import Program from './components/Program';
import Agenda from './components/Agenda';
import QuickNotes from './components/QuickNotes';
import Badges from './components/Badges';
import Goal from './components/Goal';
import CalendarView from './components/CalendarView';
import QuestionBook from './components/QuestionBook';

type AppUserProfile = {
  uid: string;
  email: string | null;
  displayName: string;
  selectedLevel: string | null;
  theme: string;
};

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('anasayfa');
  const [currentTheme, setCurrentTheme] = useState('nexora-gradient');

  // MOBİL MENÜ İÇİN STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentUserName, setCurrentUserName] = useState('Öğrenci');

  // ---------------------------------------------------------
  // FIREBASE OTURUM KONTROLÜ
  // ---------------------------------------------------------
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser);

          if (!firebaseUser) {
            setSelectedLevel(null);
            setCurrentUserName('Öğrenci');
            setAuthLoading(false);
            return;
          }

          const fallbackName =
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'Öğrenci';

          setCurrentUserName(fallbackName);

          try {
            const profileRef = doc(db, 'users', firebaseUser.uid);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
              const profile =
                profileSnap.data() as Partial<AppUserProfile>;

              if (profile.selectedLevel) {
                setSelectedLevel(profile.selectedLevel);
              }

              if (profile.theme) {
                setCurrentTheme(profile.theme);
              }

              if (profile.displayName) {
                setCurrentUserName(profile.displayName);
              }

              if (!profile.selectedLevel) {
                const localLevel = localStorage.getItem(
                  `nexora_selected_level_${firebaseUser.uid}`
                );

                if (localLevel) {
                  setSelectedLevel(localLevel);
                }
              }
            } else {
              await setDoc(
                profileRef,
                {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: fallbackName,
                  selectedLevel: null,
                  theme: 'nexora-gradient',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          } catch (profileError) {
            console.error(
              'Firebase kullanıcı profili yüklenemedi:',
              profileError
            );
          }

          setAuthLoading(false);
        });
      } catch (error) {
        console.error(
          'Firebase Authentication başlatılamadı:',
          error
        );

        setAuthLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // ---------------------------------------------------------
  // FIRESTORE KULLANICI PROFİLİ KAYDETME
  // ---------------------------------------------------------
  const saveUserProfile = async (
    updates: Partial<{
      selectedLevel: string | null;
      theme: string;
      displayName: string;
    }>
  ) => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...updates,
          uid: user.uid,
          email: user.email,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error(
        'Kullanıcı profili kaydedilemedi:',
        error
      );
    }
  };

  // ---------------------------------------------------------
  // SINIF / SEVİYE SEÇİMİ
  // ---------------------------------------------------------
  const handleLevelSelect = async (level: string) => {
    setSelectedLevel(level);

    if (!user) return;

    localStorage.setItem(
      `nexora_selected_level_${user.uid}`,
      level
    );

    await saveUserProfile({
      selectedLevel: level,
    });
  };

  // ---------------------------------------------------------
  // TEMA KAYDETME
  // ---------------------------------------------------------
  useEffect(() => {
    if (!user?.uid) return;

    localStorage.setItem(
      `nexora_theme_${user.uid}`,
      currentTheme
    );

    saveUserProfile({
      theme: currentTheme,
    });
  }, [currentTheme, user?.uid]);

  // ---------------------------------------------------------
  // E-POSTA İLE GİRİŞ / KAYIT
  // ---------------------------------------------------------
  const handleEmailAuth = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setErrorMessage('Lütfen e-posta adresini gir.');
      return;
    }

    if (!password) {
      setErrorMessage('Lütfen şifreni gir.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalı.');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setErrorMessage(
        'Kayıt olmak için adını ve soyadını gir.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const credential =
          await signInWithEmailAndPassword(
            auth,
            cleanEmail,
            password
          );

        const firebaseUser = credential.user;

        const profileRef = doc(
          db,
          'users',
          firebaseUser.uid
        );

        const profileSnap =
          await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profile =
            profileSnap.data() as Partial<AppUserProfile>;

          if (profile.selectedLevel) {
            setSelectedLevel(profile.selectedLevel);

            localStorage.setItem(
              `nexora_selected_level_${firebaseUser.uid}`,
              profile.selectedLevel
            );
          }

          if (profile.theme) {
            setCurrentTheme(profile.theme);

            localStorage.setItem(
              `nexora_theme_${firebaseUser.uid}`,
              profile.theme
            );
          }

          if (profile.displayName) {
            setCurrentUserName(
              profile.displayName
            );
          }
        }

        setSuccessMessage(
          'Hoş geldin! Giriş yapıldı.'
        );
      } else {
        const credential =
          await createUserWithEmailAndPassword(
            auth,
            cleanEmail,
            password
          );

        const firebaseUser =
          credential.user;

        const cleanName =
          fullName.trim();

        await updateProfile(
          firebaseUser,
          {
            displayName: cleanName,
          }
        );

        await setDoc(
          doc(
            db,
            'users',
            firebaseUser.uid
          ),
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: cleanName,
            selectedLevel: null,
            theme: 'nexora-gradient',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        setCurrentUserName(cleanName);
        setSelectedLevel(null);

        setSuccessMessage(
          'Hesabın oluşturuldu. Hoş geldin!'
        );
      }
    } catch (error: unknown) {
      console.error(
        'E-posta işlemi başarısız:',
        error
      );

      const firebaseError =
        error as {
          code?: string;
        };

      switch (firebaseError.code) {
        case 'auth/invalid-email':
          setErrorMessage(
            'Geçerli bir e-posta adresi gir.'
          );
          break;

        case 'auth/user-not-found':
          setErrorMessage(
            'Bu e-posta ile kayıtlı bir hesap bulunamadı.'
          );
          break;

        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrorMessage(
            'E-posta veya şifre hatalı.'
          );
          break;

        case 'auth/email-already-in-use':
          setErrorMessage(
            'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.'
          );
          setIsLogin(true);
          break;

        case 'auth/weak-password':
          setErrorMessage(
            'Şifre çok zayıf. En az 6 karakter kullan.'
          );
          break;

        case 'auth/too-many-requests':
          setErrorMessage(
            'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.'
          );
          break;

        default:
          setErrorMessage(
            'İşlem sırasında bir sorun oluştu. Tekrar dene.'
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // GOOGLE İLE GİRİŞ
  // ---------------------------------------------------------
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const firebaseUser =
        result.user;

      const profileRef = doc(
        db,
        'users',
        firebaseUser.uid
      );

      const profileSnap =
        await getDoc(profileRef);

      const displayName =
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'Öğrenci';

      if (profileSnap.exists()) {
        const profile =
          profileSnap.data() as Partial<AppUserProfile>;

        if (profile.selectedLevel) {
          setSelectedLevel(
            profile.selectedLevel
          );

          localStorage.setItem(
            `nexora_selected_level_${firebaseUser.uid}`,
            profile.selectedLevel
          );
        }

        if (profile.theme) {
          setCurrentTheme(
            profile.theme
          );

          localStorage.setItem(
            `nexora_theme_${firebaseUser.uid}`,
            profile.theme
          );
        }

        if (profile.displayName) {
          setCurrentUserName(
            profile.displayName
          );
        }
      } else {
        await setDoc(
          profileRef,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName,
            selectedLevel: null,
            theme: 'nexora-gradient',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setCurrentUserName(displayName);

      setSuccessMessage(
        'Google hesabınla başarıyla giriş yaptın.'
      );
    } catch (error: unknown) {
      console.error(
        'Google giriş hatası:',
        error
      );

      const firebaseError =
        error as {
          code?: string;
        };

      switch (firebaseError.code) {
        case 'auth/popup-closed-by-user':
          setErrorMessage(
            'Google giriş penceresi kapatıldı.'
          );
          break;

        case 'auth/popup-blocked':
          setErrorMessage(
            'Tarayıcı açılır pencereyi engelledi. Popup izni verip tekrar dene.'
          );
          break;

        case 'auth/account-exists-with-different-credential':
          setErrorMessage(
            'Bu e-posta başka bir giriş yöntemiyle kayıtlı. Önce o yöntemle giriş yap.'
          );
          break;

        default:
          setErrorMessage(
            'Google ile giriş sırasında bir sorun oluştu.'
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // ÇIKIŞ
  // ---------------------------------------------------------
  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setSelectedLevel(null);
      setActiveTab('anasayfa');

      setIsLogin(true);
      setEmail('');
      setPassword('');
      setFullName('');

      setErrorMessage('');
      setSuccessMessage('');
    } catch (error) {
      console.error(
        'Çıkış yapılamadı:',
        error
      );

      setErrorMessage(
        'Çıkış yapılırken bir sorun oluştu.'
      );
    }
  };

  // ---------------------------------------------------------
  // FIREBASE YÜKLENİYOR
  // ---------------------------------------------------------
  if (authLoading) {
    return (
      <main
        className={`min-h-screen w-full ${currentTheme} flex items-center justify-center p-4`}
      >
        <div className="text-white text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-white/20 border-t-white animate-spin" />

          <p className="text-sm font-semibold">
            Nexora Study hazırlanıyor...
          </p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // GİRİŞ YAPILMADI
  // ---------------------------------------------------------
  if (!user) {
    return (
      <main
        className={`min-h-screen w-full ${currentTheme} flex items-center justify-center p-4 transition-all duration-500`}
      >
        <div className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-8 shadow-2xl text-white">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Nexora{' '}
              <span className="text-teal-200">
                Study
              </span>
            </h1>

            <p className="text-sm text-white/80 italic font-medium">
              "Hedefine Giden En Akıllı Yol."
            </p>
          </div>

          <form
            onSubmit={handleEmailAuth}
            className="space-y-4"
          >
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-white/90">
                  Ad Soyad
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Adını ve soyadını gir..."
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-white/90">
                E-posta Adresi
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="ornek@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-white/90">
                Şifre
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                autoComplete={
                  isLogin
                    ? 'current-password'
                    : 'new-password'
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-xs font-medium text-red-100">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/20 px-4 py-3 text-xs font-medium text-emerald-100">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-teal-50 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'İşleniyor...'
                : isLogin
                  ? 'Giriş Yap'
                  : 'Kayıt Ol'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/20 flex-1" />

            <span className="text-xs text-white/60">
              veya
            </span>

            <div className="h-px bg-white/20 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-white/10 border border-white/25 text-white font-bold rounded-xl hover:bg-white/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <span className="text-lg font-extrabold">
              G
            </span>

            Google ile devam et
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-white/80 hover:text-white underline transition-all cursor-pointer"
            >
              {isLogin
                ? 'Hesabın yok mu? Kayıt ol'
                : 'Zaten hesabın var mı? Giriş yap'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------
  // EĞİTİM SEVİYESİ + ANA UYGULAMA
  // ---------------------------------------------------------
  return (
    <div
      className={`min-h-screen ${currentTheme} transition-all duration-500`}
    >
      {!selectedLevel ? (
        <LevelSelector
          onSelectLevel={handleLevelSelect}
          onBackToLogin={handleLogout}
        />
      ) : (
        <div className="min-h-screen flex relative">

          {/* MOBİLDE SOL ÜST KÖŞEDEKİ ÜÇ ÇİZGİLİ (☰) MENÜ BUTONU */}
          <div className="md:hidden fixed top-4 left-4 z-20">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg active:scale-95 transition-all"
              type="button"
              aria-label="Menüyü Aç"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>

          {/* SIDEBAR BİLEŞENİ */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedLevel={selectedLevel}
            currentTheme={currentTheme}
            onLogout={handleLogout}
            currentUserName={currentUserName}
            userEmail={user.email}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />

          <main
            className={`flex-1 md:ml-64 min-h-screen ${currentTheme} transition-all duration-500 overflow-y-auto`}
          >

            {activeTab !== 'anasayfa' && (
              <div className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-xs">

                <button
                  onClick={() =>
                    setActiveTab('anasayfa')
                  }
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-all bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                >
                  <span>←</span>
                  Ana Sayfaya Dön
                </button>

                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">
                  {activeTab}
                </span>

              </div>
            )}

            {activeTab === 'anasayfa' && (
              <Dashboard
                selectedLevel={selectedLevel}
              />
            )}

            {activeTab === 'aikoç' && (
              <AiCoach />
            )}

            {activeTab === 'programım' && (
              <Program />
            )}

            {activeTab === 'dijital ajanda' && (
              <Agenda />
            )}

            {activeTab === 'yapamadığım sorular' && (
              <QuestionBook />
            )}

            {activeTab === 'hızlı notlar' && (
              <QuickNotes />
            )}

            {activeTab === 'takvim' && (
              <CalendarView />
            )}

            {activeTab === 'pomodoro' && (
              <Pomodoro />
            )}

            {activeTab === 'hedefler' && (
              <Goal />
            )}

            {activeTab === 'rozetler' && (
              <Badges />
            )}

            {activeTab === 'ayarlar' && (
              <Settings
                currentTheme={currentTheme}
                setTheme={setCurrentTheme}
              />
            )}

          </main>
        </div>
      )}
    </div>
  );
}