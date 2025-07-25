import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "../hooks/use-toast";

export function SystemSettings() {
  const { toast } = useToast();
  const systemTitle = useQuery(api.settings.getSystemTitle);
  const updateSystemTitle = useMutation(api.settings.updateSystemTitle);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await updateSystemTitle({ title: title.trim() });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث عنوان النظام بنجاح",
      });
      setTitle("");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث العنوان",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center accent-gradient">
        إعدادات النظام
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">العنوان الحالي للنظام:</h3>
          <p className="text-gray-700 bg-gray-100 p-3 rounded">{systemTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              العنوان الجديد للنظام:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل العنوان الجديد..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "جاري التحديث..." : "تحديث العنوان"}
          </button>
        </form>
      </div>
    </div>
  );
}
