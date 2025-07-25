import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, FormEvent } from "react";
import { useToast } from "../hooks/use-toast";

interface CreateQuizProps {
  onDone: () => void;
}

export function CreateQuiz({ onDone }: CreateQuizProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctOption: 0 },
  ]);
  const create = useMutation(api.quizzes.create);
  const { toast } = useToast();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctOption: 0 },
    ]);
  };

  const removeQuestion = (indexToRemove: number) => {
    if (questions.length > 1) { // لا تسمح بحذف السؤال الأخير
      setQuestions(questions.filter((_, index) => index !== indexToRemove));
    } else {
      toast({
        title: "لا يمكن حذف السؤال",
        description: "يجب أن يحتوي الاختبار على سؤال واحد على الأقل",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create({ title, description, questions });
      toast({
        title: "تم إنشاء الاختبار بنجاح",
        description: "يمكن للطلاب الآن رؤية الاختبار وحله",
      });
      onDone();
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إنشاء الاختبار. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          عنوان الاختبار
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          وصف الاختبار
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="p-4 border rounded-lg relative">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                السؤال {qIndex + 1}
              </label>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  حذف السؤال
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={q.question}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[qIndex].question = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctOption === oIndex}
                    onChange={() => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].correctOption = oIndex;
                      setQuestions(newQuestions);
                    }}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].options[oIndex] = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder={`الخيار ${oIndex + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={addQuestion}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          إضافة سؤال
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          إنشاء الاختبار
        </button>
      </div>
    </form>
  );
}
