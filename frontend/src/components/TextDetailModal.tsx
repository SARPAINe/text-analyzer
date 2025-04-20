import { useState, useEffect } from "react";
import { X, Edit, Trash, AlertCircle } from "lucide-react";
import { Text, getTextStats, TextStats } from "../services/textService";

interface TextDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: Text;
  onEdit: () => void;
  onDelete: () => void;
}

function TextDetailModal({
  isOpen,
  onClose,
  text,
  onEdit,
  onDelete,
}: TextDetailModalProps) {
  const [stats, setStats] = useState<TextStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const textStats = await getTextStats(text.id);
        console.log("🚀 ~ fetchStats ~ textStats:", textStats);
        setStats(textStats);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load text statistics");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, text.id]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="px-6 pt-5 pb-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold leading-6 text-gray-900">
                {text.content}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Created: {formatDate(text.createdAt)}
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {formatDate(text.updatedAt)}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Text Statistics</h4>

              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                  <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md text-center">
                    <p className="text-sm text-blue-700 mb-1">Words</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats?.wordCount || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md text-center">
                    <p className="text-sm text-green-700 mb-1">Characters</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats?.characterCount || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md text-center">
                    <p className="text-sm text-purple-700 mb-1">Sentences</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats?.sentenceCount || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-md text-center">
                    <p className="text-sm text-amber-700 mb-1">Paragraphs</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {stats?.paragraphCount || 0}
                    </p>
                  </div>
                </div>
              )}

              {stats?.longestWord && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Longest word</p>
                  <p className="font-medium">{stats.longestWord}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextDetailModal;
