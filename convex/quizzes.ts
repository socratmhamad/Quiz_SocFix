import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const AUTHORIZED_TEACHER_EMAIL = "teacher@example.com";

export const list = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    const quizzes = await ctx.db.query("quizzes").collect();
    
    return quizzes.map(quiz => ({
      ...quiz,
      canCreate: user?.email === AUTHORIZED_TEACHER_EMAIL,
      isTeacher: user?.email === AUTHORIZED_TEACHER_EMAIL
    }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctOption: v.number(),
      })
    ),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول لإنشاء اختبار");
    
    const user = await ctx.db.get(userId);
    if (!user || user.email !== AUTHORIZED_TEACHER_EMAIL) {
      throw new Error("غير مصرح لك بإنشاء اختبارات");
    }
    
    return await ctx.db.insert("quizzes", {
      title: args.title,
      description: args.description,
      questions: args.questions,
      authorId: userId,
      isTeacher: true,
    });
  },
});

export const update = mutation({
  args: {
    quizId: v.id("quizzes"),
    title: v.string(),
    description: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctOption: v.number(),
      })
    ),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول لتحديث الاختبار");
    
    const user = await ctx.db.get(userId);
    if (!user || user.email !== AUTHORIZED_TEACHER_EMAIL) {
      throw new Error("غير مصرح لك بتحديث الاختبارات");
    }

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("الاختبار غير موجود");
    
    await ctx.db.patch(args.quizId, {
      title: args.title,
      description: args.description,
      questions: args.questions,
    });
  },
});

export const deleteQuiz = mutation({
  args: { quizId: v.id("quizzes") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");
    
    const user = await ctx.db.get(userId);
    if (!user || user.email !== AUTHORIZED_TEACHER_EMAIL) {
      throw new Error("غير مصرح لك بحذف الاختبارات");
    }

    await ctx.db.delete(args.quizId);
  },
});

export const get = query({
  args: { id: v.id("quizzes") },
  async handler(ctx, args) {
    return await ctx.db.get(args.id);
  },
});

export const submit = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(v.number()),
    studentEmail: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول لتقديم الاختبار");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("المستخدم غير موجود");

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("الاختبار غير موجود");

    let score = 0;
    for (let i = 0; i < args.answers.length; i++) {
      if (args.answers[i] === quiz.questions[i].correctOption) {
        score++;
      }
    }

    await ctx.db.insert("submissions", {
      quizId: args.quizId,
      studentId: userId,
      studentEmail: user.email || "مستخدم مجهول",
      answers: args.answers,
      score: score,
      total: quiz.questions.length,
      submittedAt: Date.now(),
    });

    return { score, total: quiz.questions.length };
  },
});

export const getStats = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");

    const user = await ctx.db.get(userId);
    if (!user || user.email !== AUTHORIZED_TEACHER_EMAIL) {
      throw new Error("غير مصرح لك بعرض الإحصائيات");
    }

    const quizzes = await ctx.db.query("quizzes").collect();
    const submissions = await ctx.db.query("submissions").collect();

    const totalQuizzes = quizzes.length;
    const totalSubmissions = submissions.length;

    let totalScore = 0;
    let validSubmissions = 0;
    submissions.forEach(sub => {
      if (typeof sub.total === 'number') {
        totalScore += (sub.score / sub.total) * 100;
        validSubmissions++;
      }
    });
    const averageScore = validSubmissions > 0 ? totalScore / validSubmissions : null;

    const quizStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizSubmissions = submissions.filter(s => s.quizId === quiz._id);
        const submissionCount = quizSubmissions.length;
        
        if (submissionCount === 0) {
          return {
            _id: quiz._id,
            title: quiz.title,
            submissionCount: 0,
            averageScore: null,
            highestScore: null,
            lowestScore: null,
          };
        }

        const scores = quizSubmissions
          .filter(s => typeof s.total === 'number')
          .map(s => (s.score / s.total!) * 100);

        if (scores.length === 0) {
          return {
            _id: quiz._id,
            title: quiz.title,
            submissionCount,
            averageScore: null,
            highestScore: null,
            lowestScore: null,
          };
        }

        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);

        return {
          _id: quiz._id,
          title: quiz.title,
          submissionCount,
          averageScore,
          highestScore,
          lowestScore,
        };
      })
    );

    return {
      totalQuizzes,
      totalSubmissions,
      averageScore,
      quizStats,
    };
  },
});

export const getSubmissions = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");

    const user = await ctx.db.get(userId);
    if (!user || user.email !== AUTHORIZED_TEACHER_EMAIL) {
      throw new Error("غير مصرح لك بعرض المحاولات");
    }

    const submissions = await ctx.db.query("submissions")
      .order("desc")
      .take(10);

    const submissionsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        const quiz = await ctx.db.get(submission.quizId);
        return {
          ...submission,
          quizTitle: quiz?.title || "اختبار محذوف",
        };
      })
    );

    return submissionsWithDetails;
  },
});
