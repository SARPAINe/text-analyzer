import axios from "axios";
import { apiClient } from "./apiClient";

export interface Text {
  id: string;
  title: string;
  content: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextStats {
  wordCount?: number;
  characterCount?: number;
  sentenceCount?: number;
  paragraphCount?: number;
  longestWord?: string;
}

// Get all texts
export const getAllTexts = async (): Promise<Text[]> => {
  try {
    const response = await apiClient.get("/api/v1/texts");
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch texts");
    }
    throw new Error("Network error when fetching texts");
  }
};

// Get text by ID
export const getTextById = async (id: string): Promise<Text> => {
  try {
    const response = await apiClient.get(`/api/v1/texts/${id}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch text");
    }
    throw new Error("Network error when fetching text");
  }
};

// Create new text
export const createText = async (textData: {
  title: string;
  content: string;
}): Promise<Text> => {
  try {
    const response = await apiClient.post("/api/v1/texts", textData);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to create text");
    }
    throw new Error("Network error when creating text");
  }
};

// Update text
export const updateText = async (
  id: string,
  textData: Partial<Text>
): Promise<Text> => {
  try {
    const response = await apiClient.patch(`/api/v1/texts/${id}`, textData);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to update text");
    }
    throw new Error("Network error when updating text");
  }
};

// Delete text
export const deleteText = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/v1/texts/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to delete text");
    }
    throw new Error("Network error when deleting text");
  }
};

// Get word count
export const getWordCount = async (id: string): Promise<number> => {
  try {
    const response = await apiClient.get(`/api/v1/texts/word-count/${id}`);
    return response.data.data.wordCount;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch word count"
      );
    }
    throw new Error("Network error when fetching word count");
  }
};

// Get character count
export const getCharacterCount = async (id: string): Promise<number> => {
  try {
    const response = await apiClient.get(`/api/v1/texts/character-count/${id}`);
    return response.data.data.characterCount;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch character count"
      );
    }
    throw new Error("Network error when fetching character count");
  }
};
// Get sentence count
export const getSentenceCount = async (id: string): Promise<number> => {
  try {
    const response = await apiClient.get(`/api/v1/texts/sentence-count/${id}`);
    return response.data.data.sentenceCount;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch sentence count"
      );
    }
    throw new Error("Network error when fetching sentence count");
  }
};
// Get paragraph count
export const getParagraphCount = async (id: string): Promise<number> => {
  try {
    const response = await apiClient.get(`/api/v1/texts/paragraph-count/${id}`);
    return response.data.data.paragraphCount;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch paragraph count"
      );
    }
    throw new Error("Network error when fetching paragraph count");
  }
};
// Get longest word
export const getLongestWord = async (id: string): Promise<string> => {
  try {
    const response = await apiClient.get(`/api/v1/texts/longest-word/${id}`);
    return response.data.data.longestWord;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch longest word"
      );
    }
    throw new Error("Network error when fetching longest word");
  }
};

// Get text statistics
export const getTextStats = async (id: string): Promise<any> => {
  try {
    const stats = await apiClient.get(`/api/v1/texts/${id}`);
    // const statsPromise = apiClient.get(`/api/v1/texts/${id}`);
    // const wordCountPromise = apiClient.get(`/api/v1/texts/word-count/${id}`);
    // const charCountPromise = apiClient.get(
    //   `/api/v1/texts/character-count/${id}`
    // );
    // const sentenceCountPromise = apiClient.get(
    //   `/api/v1/texts/sentence-count/${id}`
    // );
    // const paragraphCountPromise = apiClient.get(
    //   `/api/v1/texts/paragraph-count/${id}`
    // );
    // const longestWordPromise = apiClient.get(
    //   `/api/v1/texts/longest-word/${id}`
    // );

    // const [
    //   stats,
    //   wordCount,
    //   charCount,
    //   sentenceCount,
    //   paragraphCount,
    //   longestWord,
    // ] = await Promise.all([
    //   statsPromise,
    //   wordCountPromise,
    //   charCountPromise,
    //   sentenceCountPromise,
    //   paragraphCountPromise,
    //   longestWordPromise,
    // ]);

    // return {
    //   stats: stats.data.data,
    //   wordCount: wordCount.data.data.wordCount,
    //   characterCount: charCount.data.data.characterCount,
    //   sentenceCount: sentenceCount.data.data.sentenceCount,
    //   paragraphCount: paragraphCount.data.data.paragraphCount,
    //   longestWord: longestWord.data.data.longestWord,
    // };
    return stats.data.data as TextStats;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch text statistics"
      );
    }
    throw new Error("Network error when fetching text statistics");
  }
};
