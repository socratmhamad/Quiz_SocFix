import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useToast } from "../hooks/use-toast";
import confetti from "canvas-confetti";

interface TakeQuizProps {
  quizId: Id<"quizzes">;
  onBack: () => void;
}

export function TakeQuiz({ quizId, onBack }: TakeQuizProps) {
  const { toast } = useToast();
  const quiz = useQuery(api.quizzes.get, { id: quizId });
  const submitQuiz = useMutation(api.quizzes.submit);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);


  useEffect(() => {
    if (quiz) {
      setAnswers(new Array(quiz.questions.length).fill(-1));
    }
  }, [quiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    // Check if answer is correct and show confetti
    if (quiz && quiz.questions[currentQuestion].correctOption === answerIndex) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !loggedInUser) return;

    const unansweredQuestions = answers.filter(answer => answer === -1);
    if (unansweredQuestions.length > 0) {
      toast({
        title: "تنبيه",
        description: "يرجى الإجابة على جميع الأسئلة قبل التسليم",
        variant: "destructive",
      });
      return;
    }

    try {
      const calculatedScore = answers.reduce((score, answer, index) => {
        return answer === quiz.questions[index].correctOption ? score + 1 : score;
      }, 0);

      await submitQuiz({
        quizId,
        answers,
        studentEmail: loggedInUser.email,
      });

      setScore(calculatedScore);
      setIsSubmitted(true);
      
      toast({
        title: "تم التسليم بنجاح",
        description: `درجتك: ${calculatedScore}/${quiz.questions.length}`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسليم الاختبار",
        variant: "destructive",
      });
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  if (!quiz) {
    return <div className="text-center">جاري التحميل...</div>;
  }

  if (isSubmitted && !showResults) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-600">تم تسليم الاختبار بنجاح!</h2>
          <div className="mb-6">
            <p className="text-xl mb-2">درجتك النهائية:</p>
            <p className="text-3xl font-bold text-indigo-600">
              {score}/{quiz.questions.length}
            </p>
            <p className="text-lg text-gray-600 mt-2">
              النسبة المئوية: {Math.round((score / quiz.questions.length) * 100)}%
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={toggleResults}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              عرض الحل الخاص بي
            </button>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold accent-gradient">مراجعة إجاباتك</h2>
            <div className="text-lg font-semibold">
              الدرجة: {score}/{quiz.questions.length}
            </div>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((question: any, index: number) => {
              const userAnswer = answers[index];
              const correctAnswer = question.correctOption;
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <h3 className="font-semibold mb-3">
                    السؤال {index + 1}: {question.question}
                  </h3>
                  
                  <div className="space-y-2">
                    {question.options.map((option: string, optionIndex: number) => {
                      let optionClass = "p-2 rounded border ";
                      
                      if (optionIndex === correctAnswer) {
                        optionClass += "bg-green-200 border-green-500 font-semibold";
                      } else if (optionIndex === userAnswer && !isCorrect) {
                        optionClass += "bg-red-200 border-red-500";
                      } else {
                        optionClass += "bg-gray-100 border-gray-300";
                      }

                      return (
                        <div key={optionIndex} className={optionClass}>
                          <span className="mr-2">
                            {optionIndex === correctAnswer && "✓ "}
                            {optionIndex === userAnswer && optionIndex !== correctAnswer && "✗ "}
                          </span>
                          {option}
                          {optionIndex === correctAnswer && (
                            <span className="text-green-600 font-semibold mr-2">(الإجابة الصحيحة)</span>
                          )}
                          {optionIndex === userAnswer && optionIndex !== correctAnswer && (
                            <span className="text-red-600 font-semibold mr-2">(إجابتك)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-2 text-sm">
                    {isCorrect ? (
                      <span className="text-green-600 font-semibold">✓ إجابة صحيحة</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ إجابة خاطئة</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto relative">

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold accent-gradient">{quiz.title}</h2>
            <span className="text-lg font-semibold">
              {currentQuestion + 1} من {quiz.questions.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">
            السؤال {currentQuestion + 1}: {question.question}
          </h3>
          
          <div className="space-y-3">
            {question.options.map((option: string, index: number) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion] === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="w-5 h-5 text-indigo-600 mr-3"
                />
                <span className="text-lg">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>

          <div className="flex gap-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                تسليم الاختبار
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion] === -1}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            )}
          </div>

          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>

      <style>{`
        .fireworks-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .firework {
          position: absolute;
          font-size: 2rem;
          animation: firework 2s ease-out;
        }
        
        .firework-1 { top: 20%; left: 20%; animation-delay: 0s; }
        .firework-2 { top: 30%; right: 20%; animation-delay: 0.2s; }
        .firework-3 { top: 50%; left: 10%; animation-delay: 0.4s; }
        .firework-4 { top: 40%; right: 10%; animation-delay: 0.6s; }
        .firework-5 { top: 60%; left: 30%; animation-delay: 0.8s; }
        .firework-6 { top: 70%; right: 30%; animation-delay: 1s; }
        
        @keyframes firework {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
