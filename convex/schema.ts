import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  quizzes: defineTable({
    title: v.string(),
    description: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctOption: v.number(),
      })
    ),
    authorId: v.string(),
    isTeacher: v.optional(v.boolean()),
  }),
  submissions: defineTable({
    quizId: v.id("quizzes"),
    studentId: v.string(),
    studentEmail: v.optional(v.string()),
    answers: v.array(v.number()),
    score: v.number(),
    total: v.optional(v.number()),
    submittedAt: v.number(),
  })
    .index("by_quiz", ["quizId"])
    .index("by_student", ["studentId"])
    .index("by_date", ["submittedAt"]),
  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
