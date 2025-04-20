import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  getWordCount,
  getCharacterCount,
  getSentenceCount,
  getParagraphCount,
  getLongestWord,
  Text,
  getTextById,
} from "../services/textService";

function TextAnalysisPage() {
  const [text, setText] = useState<Text | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ [key: string]: number | string | null }>(
    {}
  );
  const [loadingStats, setLoadingStats] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchText();
  }, [id]);

  const fetchText = async () => {
    try {
      setLoading(true);
      if (!id) throw new Error("No text ID provided");
      const data = await getTextById(id);
      setText(data);
    } catch (err: any) {
      setError(err.message || "Failed to load text");
    } finally {
      setLoading(false);
    }
  };

  const fetchStat = async (endpoint: string) => {
    if (!id) return;

    try {
      setLoadingStats((prev) => ({ ...prev, [endpoint]: true }));

      let data;
      switch (endpoint) {
        case "word-count":
          data = await getWordCount(id);
          break;
        case "character-count":
          data = await getCharacterCount(id);
          break;
        case "sentence-count":
          data = await getSentenceCount(id);
          break;
        case "paragraph-count":
          data = await getParagraphCount(id);
          break;
        case "longest-word":
          data = await getLongestWord(id);
          break;
        default:
          throw new Error("Invalid endpoint");
      }

      setStats((prev) => ({ ...prev, [endpoint]: data }));
    } catch (err) {
      setStats((prev) => ({ ...prev, [endpoint]: null }));
    } finally {
      setLoadingStats((prev) => ({ ...prev, [endpoint]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !text) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5" />
          <p className="text-sm text-red-800">
            {error || "Failed to load text"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to texts
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {text.title}
          </h1>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Created: {formatDate(text.createdAt)}
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(text.updatedAt)}
            </p>
          </div>

          <div className="prose max-w-none mb-8">
            <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
              {text.content}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Text Analysis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Word Count</h3>
                <button
                  onClick={() => fetchStat("word-count")}
                  disabled={loadingStats["word-count"]}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loadingStats["word-count"]
                    ? "Calculating..."
                    : "Calculate Word Count"}
                </button>
                {stats["word-count"] !== undefined && (
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats["word-count"]}
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Character Count
                </h3>
                <button
                  onClick={() => fetchStat("character-count")}
                  disabled={loadingStats["character-count"]}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loadingStats["character-count"]
                    ? "Calculating..."
                    : "Calculate Character Count"}
                </button>
                {stats["character-count"] !== undefined && (
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats["character-count"]}
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Sentence Count
                </h3>
                <button
                  onClick={() => fetchStat("sentence-count")}
                  disabled={loadingStats["sentence-count"]}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loadingStats["sentence-count"]
                    ? "Calculating..."
                    : "Calculate Sentence Count"}
                </button>
                {stats["sentence-count"] !== undefined && (
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats["sentence-count"]}
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Paragraph Count
                </h3>
                <button
                  onClick={() => fetchStat("paragraph-count")}
                  disabled={loadingStats["paragraph-count"]}
                  className="w-full py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loadingStats["paragraph-count"]
                    ? "Calculating..."
                    : "Calculate Paragraph Count"}
                </button>
                {stats["paragraph-count"] !== undefined && (
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats["paragraph-count"]}
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:col-span-2">
                <h3 className="font-medium text-gray-700 mb-3">Longest Word</h3>
                <button
                  onClick={() => fetchStat("longest-word")}
                  disabled={loadingStats["longest-word"]}
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loadingStats["longest-word"]
                    ? "Finding..."
                    : "Find Longest Word"}
                </button>
                {stats["longest-word"] !== undefined && (
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats["longest-word"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextAnalysisPage;
