import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "./components/ui/toaster";
import { QuizList } from "./components/QuizList";
import { CreateQuiz } from "./components/CreateQuiz";
import { Dashboard } from "./components/Dashboard";
import { SystemSettings } from "./components/SystemSettings";
import { useState } from "react";

export default function App() {
  const [isCreating, setIsCreating] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const quizzes = useQuery(api.quizzes.list);
  const systemTitle = useQuery(api.settings.getSystemTitle);

  const isTeacher = loggedInUser?.email === "teacher@example.com";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <header className="sticky top-0 z-10 glass-container p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold accent-gradient">{systemTitle}</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="glass-container p-8 rounded-2xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 accent-gradient">{systemTitle}</h1>
              <Authenticated>
                <p className="text-xl text-indigo-700 mb-8">
                  مرحباً {loggedInUser?.email}
                  {isTeacher && " (معلم)"}
                </p>
                {isTeacher && (
                  <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setShowSettings(false);
                        setShowDashboard(!showDashboard);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {showDashboard ? "عرض الاختبارات" : "لوحة التحكم"}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setShowDashboard(false);
                        setShowSettings(!showSettings);
                      }}
                      className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {showSettings ? "إخفاء الإعدادات" : "إعدادات النظام"}
                    </button>
                    {!showDashboard && !showSettings && (
                      <button
                        onClick={() => setIsCreating(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        إنشاء اختبار جديد
                      </button>
                    )}
                  </div>
                )}
                {isCreating ? (
                  <CreateQuiz onDone={() => setIsCreating(false)} />
                ) : showSettings && isTeacher ? (
                  <SystemSettings />
                ) : showDashboard && isTeacher ? (
                  <Dashboard />
                ) : (
                  <QuizList />
                )}
              </Authenticated>
              <Unauthenticated>
                <p className="text-xl text-indigo-700 mb-6">الرجاء تسجيل الدخول للبدء</p>
                <SignInForm />
              </Unauthenticated>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
