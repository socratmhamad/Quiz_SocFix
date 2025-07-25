import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const stats = useQuery(api.quizzes.getStats);
  const submissions = useQuery(api.quizzes.getSubmissions);

  if (!stats || !submissions) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-1">عدد الاختبارات</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalQuizzes}</p>
        </div>
        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-1">مجموع المحاولات</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalSubmissions}</p>
        </div>
        <div className="stats-card">
          <h3 className="text-lg font-semibold mb-1">متوسط الدرجات</h3>
          <p className="text-3xl font-bold text-pink-600">
            {stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : "لا يوجد"}
          </p>
        </div>
      </div>

      {/* تفاصيل الاختبارات */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">تفاصيل الاختبارات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-right py-2">عنوان الاختبار</th>
                <th className="text-center py-2">عدد المحاولات</th>
                <th className="text-center py-2">متوسط الدرجات</th>
                <th className="text-center py-2">أعلى درجة</th>
                <th className="text-center py-2">أدنى درجة</th>
              </tr>
            </thead>
            <tbody>
              {stats.quizStats.map((quiz) => (
                <tr key={quiz._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{quiz.title}</td>
                  <td className="text-center">{quiz.submissionCount}</td>
                  <td className="text-center">{quiz.averageScore ? `${quiz.averageScore.toFixed(1)}%` : "-"}</td>
                  <td className="text-center">{quiz.highestScore ? `${quiz.highestScore}%` : "-"}</td>
                  <td className="text-center">{quiz.lowestScore ? `${quiz.lowestScore}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* آخر المحاولات */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">آخر المحاولات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="text-right py-2">الطالب</th>
                <th className="text-right py-2">الاختبار</th>
                <th className="text-center py-2">الدرجة</th>
                <th className="text-center py-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{submission.studentEmail}</td>
                  <td>{submission.quizTitle}</td>
                  <td className="text-center">{submission.score}/{submission.total}</td>
                  <td className="text-center">
                    {new Date(submission.submittedAt).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
