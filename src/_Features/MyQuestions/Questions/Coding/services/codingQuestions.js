// src/services/codingQuestions.js
// import { privateAxios } from "../../../../utils/axios";
import { privateAxios } from "../../../../../utils/axios";
// Add minimal coding question
export const addMinimalCodingQuestion = async (payload) => {
  // payload: { title: string, short_description?: string, topic?: string }
  const { data } = await privateAxios.post(`/college-coding-questions/minimal`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to create coding question");
  return data.data; // { id, title }
};

// Fetch minimal questions (list) with filters + pagination
export const fetchMinimalQuestions = async ({
  search = "",
  topic = "",
  tags = [], // array of tag strings
  page = 1,
  per_page = 6,
  sort = "new" // "new" | "old" | "title"
} = {}) => {
  const params = {
    search,
    topic,
    page,
    per_page,
    sort
  };

  // Backend accepts either multiple tags query params or comma separated
  if (Array.isArray(tags) && tags.length > 0) {
    params.tags = tags.join(',');
  }

  const { data } = await privateAxios.get(`/college-coding-questions/minimal`, { params });
  if (!data?.success) throw new Error(data?.message || "Failed to fetch questions");
  return data.data; // { items: [...], meta: { page, per_page, total, total_pages, available_tags, all_tags } }
};

// Fetch single minimal question
export const getMinimalQuestion = async (id) => {
  const { data } = await privateAxios.get(`/college-coding-questions/minimal/${id}`);
  if (!data?.success) throw new Error(data?.message || "Failed to fetch question");
  return data.data; // question object
};


// Fetch full form values for a question (form-only; no testcases)
export const getQuestionForm = async (questionId) => {
  if (!questionId) throw new Error("questionId is required");
  const { data } = await privateAxios.get(`/college-coding-questions/form/${questionId}`);
  if (!data?.success) throw new Error(data?.message || "Failed to fetch question form");
  return data.data; // returns the payload built by backend
};

// Save/update form values for a question (form-only; does NOT create testcases)
export const saveQuestionForm = async (questionId, payload = {}) => {
  if (!questionId) throw new Error("questionId is required");

  // Example payload shape:
  // {
  //   title: "Two Sum",
  //   topic: "arrays",
  //   subtopic: "hashing",            // optional (not persisted by model unless added)
  //   tags: ["array","hashmap"] OR "array,hashmap",
  //   timeLimit: 2,                  // seconds
  //   memoryLimit: 64,               // MB
  //   shortDescription: "Short desc",
  //   fullDescription: "Full markdown",
  //   sampleIO: [{ input: "1 2", output: "3", explanation: "" }],
  //   allowedLanguages: ["python","cpp"],
  // }
  const { data } = await privateAxios.post(`/college-coding-questions/form/${questionId}`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to save question form");
  return data.data; // usually { id: "<questionId>" }
};


// 1. Fetch testcase groups for a question
export const fetchTestcaseGroups = async (questionId) => {
  if (!questionId) throw new Error("questionId is required");
  const { data } = await privateAxios.get(`/college-coding-questions/${questionId}/testcase-groups`);
  if (!data?.success) throw new Error(data?.message || "Failed to fetch testcase groups");
  return data.data; // { items: [...] }
};

// 2. Create a new testcase group (no groupId in payload)
export const createTestcaseGroup = async (questionId, payload = {}) => {
  if (!questionId) throw new Error("questionId is required");
  const { data } = await privateAxios.post(`/college-coding-questions/${questionId}/testcase-groups`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to create testcase group");
  return data.data; // { id }
};

// 3. Update an existing testcase group (must include groupId in payload)
export const updateTestcaseGroup = async (questionId, payload = {}) => {
  if (!questionId) throw new Error("questionId is required");
  if (!payload.groupId) throw new Error("groupId is required to update a testcase group");
  const { data } = await privateAxios.put(`/college-coding-questions/${questionId}/testcase-groups`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to update testcase group");
  return data.data; // { id }
};
// 4. Delete a testcase group by ID
export const deleteTestcaseGroup = async (groupId) => {
  if (!groupId) throw new Error("groupId is required");
  const { data } = await privateAxios.delete(`/college-coding-questions/testcase-group/${groupId}`);
  if (!data?.success) throw new Error(data?.message || "Failed to delete testcase group");
  return data.data; // optional: could be { id } or {}
};

/**
 * Fetch predefined boilerplates for a question.
 * GET /college-coding-questions/form/:questionId/boilerplates
 * Returns: { id: "<questionId>", predefined_boilerplates: { python: "...", cpp: "..." } }
 */
export const getPredefinedBoilerplates = async (questionId) => {
  if (!questionId) throw new Error("questionId is required");
  const { data } = await privateAxios.get(`/college-coding-questions/form/${questionId}/boilerplates`);
  if (!data?.success) throw new Error(data?.message || "Failed to fetch boilerplates");
  return data.data;
};

/**
 * Upsert boilerplates (full object merge or single language update).
 * POST /college-coding-questions/form/:questionId/boilerplates
 *
 * Usage:
 * 1) Full object: { predefined_boilerplates: { python: "...", cpp: "..." } }
 * 2) Single language: { language: "python", code: "def solve(): ..." }
 *
 * The backend merges keys and will remove a language if code is empty/null.
 */
export const upsertPredefinedBoilerplates = async (questionId, payload = {}) => {
  if (!questionId) throw new Error("questionId is required");
  if (!payload || typeof payload !== "object") throw new Error("payload is required");
  const { data } = await privateAxios.post(`/college-coding-questions/form/${questionId}/boilerplates`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to save boilerplates");
  return data.data; // { id, predefined_boilerplates }
};

/**
 * Fetch stored solution code for a question.
 * GET /college-coding-questions/form/:questionId/solution
 * Returns: { id: "<questionId>", solution_code: { python: "...", cpp: "..." } }
 */
export const getSolutionCode = async (questionId) => {
  if (!questionId) throw new Error("questionId is required");
  const { data } = await privateAxios.get(`/college-coding-questions/form/${questionId}/solution`);
  if (!data?.success) throw new Error(data?.message || "Failed to fetch solution code");
  return data.data; // { id, solution_code }
};

/**
 * Upsert solution code (full-object merge or single-language update).
 * POST /college-coding-questions/form/:questionId/solution
 *
 * Usage:
 * 1) Full object: { solution_code: { python: "def solve(): ...", cpp: "..." } }
 * 2) Single language: { language: "python", code: "def solve(): ..." }
 *
 * Backend merges keys and will remove a language if code is empty/null.
 */
export const upsertSolutionCode = async (questionId, payload = {}) => {
  if (!questionId) throw new Error("questionId is required");
  if (!payload || typeof payload !== "object") throw new Error("payload is required");
  const { data } = await privateAxios.post(`/college-coding-questions/form/${questionId}/solution`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to save solution code");
  return data.data; // { id, solution_code }
};


/**
 * Delete a coding question and all its references.
 * DELETE /college-coding-questions/:questionId
 *
 * Returns backend response `data.data` if successful.
 */
export const deleteCodingQuestion = async (questionId) => {
  if (!questionId) throw new Error("questionId is required");
  const { data } = await privateAxios.delete(`/college-coding-questions/${questionId}`);
  if (!data?.success) throw new Error(data?.message || "Failed to delete coding question");
  return data.data; // usually { } or a message
};
