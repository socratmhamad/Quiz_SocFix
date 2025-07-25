import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSystemTitle = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "system_title"))
      .unique();
    
    return setting?.value || "نظام الاختبارات الالكتروني";
  },
});

export const updateSystemTitle = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("غير مصرح لك");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.email !== "teacher@example.com") {
      throw new Error("غير مصرح لك بتعديل إعدادات النظام");
    }

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "system_title"))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.title });
    } else {
      await ctx.db.insert("settings", {
        key: "system_title",
        value: args.title,
      });
    }
  },
});
