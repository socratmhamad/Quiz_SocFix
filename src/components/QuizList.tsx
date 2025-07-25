import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { TakeQuiz } from "./TakeQuiz";
import { EditQuiz } from "./EditQuiz";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useToast } from "../hooks/use-toast";
import { SignOutButton } from "../SignOutButton";

export function QuizList() {
  const quizzes = useQuery(api.quizzes.list) || [];
  const [selectedQuiz, setSelectedQuiz] = useState<Doc<"quizzes"> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const deleteQuiz = useMutation(api.quizzes.deleteQuiz);
  const { toast } = useToast();

  const handleDelete = async (quizId: Id<"quizzes">) => {
    try {
      await deleteQuiz({ quizId });
      toast({
        title: "تم حذف الاختبار بنجاح",
        description: "تم حذف الاختبار وجميع بياناته",
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حذف الاختبار",
        variant: "destructive",
      });
    }
  };

  if (selectedQuiz && isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => {
              setSelectedQuiz(null);
              setIsEditing(false);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
          >
            رجوع للقائمة
          </button>
        </div>
        <EditQuiz 
          quiz={selectedQuiz} 
          onDone={() => {
            setSelectedQuiz(null);
            setIsEditing(false);
          }} 
        />
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setSelectedQuiz(null)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
          >
            رجوع للقائمة
          </button>
          <SignOutButton />
        </div>
        <TakeQuiz quizId={selectedQuiz._id} onBack={() => setSelectedQuiz(null)} />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="quiz-card p-6"
        >
          <h3 className="text-xl font-semibold mb-2 text-indigo-700">{quiz.title}</h3>
          <p className="text-slate-600 mb-4">{quiz.description}</p>
          <p className="text-sm text-slate-500 mb-4">
            عدد الأسئلة: {quiz.questions.length}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedQuiz(quiz)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              بدء الاختبار
            </button>
            {quiz.isTeacher && (
              <>
                <button
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setIsEditing(true);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  حذف
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
