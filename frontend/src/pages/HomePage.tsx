import { useState, useEffect } from "react";
import { Plus, Search, Trash, Edit } from "lucide-react";
import { getAllTexts, deleteText, Text } from "../services/textService";
import TextCreateModal from "../components/TextCreateModal";
import TextEditModal from "../components/TextEditModal";
import TextDetailModal from "../components/TextDetailModal";
import { useAuth } from "../contexts/AuthContext";

function HomePage() {
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentText, setCurrentText] = useState<Text | null>(null);

  // Load texts on component mount
  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTexts();
      console.log("🚀 ~ fetchTexts ~ data:", data);
      setTexts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load texts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteText = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this text?")) return;

    try {
      await deleteText(id);
      setTexts(texts.filter((text) => text.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete text");
    }
  };

  const openEditModal = (text: Text) => {
    setCurrentText(text);
    setIsEditModalOpen(true);
  };

  const openDetailModal = (text: Text) => {
    setCurrentText(text);
    setIsDetailModalOpen(true);
  };

  const filteredTexts = texts.filter((text) =>
    text.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">All Texts</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search texts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Text</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={fetchTexts}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      ) : filteredTexts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "No texts matching your search"
              : "You don't have any texts yet"}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create your first text</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTexts.map((text) => (
            <div
              key={text.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => openDetailModal(text)}
                style={{ height: "180px" }} // Set a fixed height
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {text.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {text.content}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(text.createdAt)}
                </p>
              </div>

              <div
                className="flex justify-end border-t border-gray-100 px-4 py-2 bg-gray-50"
                style={{ height: "50px" }} // Set a fixed height
              >
                {text.creatorId === user?.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(text);
                      }}
                      className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteText(text.id);
                      }}
                      className="p-1.5 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Text Modal */}
      {isCreateModalOpen && (
        <TextCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchTexts();
          }}
        />
      )}

      {/* Edit Text Modal */}
      {isEditModalOpen && currentText && (
        <TextEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          text={currentText}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchTexts();
          }}
        />
      )}

      {/* Text Detail Modal */}
      {isDetailModalOpen && currentText && (
        <TextDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          text={currentText}
          onEdit={() => {
            setIsDetailModalOpen(false);
            openEditModal(currentText);
          }}
          onDelete={() => {
            setIsDetailModalOpen(false);
            handleDeleteText(currentText.id);
          }}
        />
      )}
    </div>
  );
}

export default HomePage;
