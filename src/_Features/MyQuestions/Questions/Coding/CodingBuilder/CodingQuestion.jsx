import React, { useEffect, useState } from "react";
import { getQuestionForm, saveQuestionForm } from "../services/codingQuestions"; // adjust path as needed
import { showError, showSuccess } from "../../../../../utils/toast";

import MarkdownRenderer from "../../../../../utils/MarkDownRender";
// import MarkdownRenderer from "../../../../../utils/MarkDownRender";
function ToggleSwitch({ checked, onChange, label, subtitle, id }) {
  // compact toggle switch styled with Tailwind
  return (
    <div className="flex items-start space-x-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 w-10 rounded-full transition-colors focus:outline-none ${
          checked ? "bg-[#4CA466]" : "bg-gray-200"
        }`}
      >
        <span
          className={`transform transition-transform inline-block h-4 w-4 rounded-full bg-white shadow ${
            checked ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>

      <div className="text-left">
        <div className="text-sm font-medium text-gray-700 leading-5">{label}</div>
        {subtitle && <div className="text-xs text-gray-500 leading-4">{subtitle}</div>}
      </div>
    </div>
  );
}

function CodingQuestionInfo({ questionId }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    subtopic: "",
    tags: "",
    timeLimit: "", // seconds
    memoryLimit: "", // MB
    shortDescription: "",
    fullDescription: "",
    sampleIO: [{ input: "", output: "", explanation: "" }],
    allowedLanguages: [], // array like ["python", "cpp"]
    showBoilerplates: true,
    showSolution: false,
    published: false,
    runCodeEnabled: true,
    submissionEnabled: true,
      difficulty: "medium" // "easy"|"medium"|"hard"

  });

  // Allowed languages to show as checkboxes (keep in sync with backend allowed set)
  const AVAILABLE_LANGUAGES = [
    { id: "python", label: "Python" },
    { id: "cpp", label: "C++" },
    { id: "java", label: "Java" },
    { id: "javascript", label: "JavaScript" },
    { id: "c", label: "C" }
  ];

  const topics = [
    { name: "Data Structures", subtopics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"] },
    { name: "Algorithms", subtopics: ["Sorting", "Searching", "Dynamic Programming", "Greedy", "Recursion"] },
    { name: "Mathematics", subtopics: ["Number Theory", "Combinatorics", "Probability", "Geometry"] },
    { name: "Strings", subtopics: ["Pattern Matching", "Parsing", "Regular Expressions"] }
  ];

  useEffect(() => {
    if (!questionId) {
      showError("No questionId provided. Create a minimal question first.");
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await getQuestionForm(questionId);
        if (cancelled) return;
        console.log("Loaded question form:", payload);
        setFormData({
          title: payload.title || "",
          topic: payload.topic || "",
          subtopic: payload.subtopic || "",
          tags: Array.isArray(payload.tags) ? payload.tags.join(", ") : (payload.tags || ""),
          timeLimit: payload.timeLimit != null ? String(payload.timeLimit) : "",
          memoryLimit: payload.memoryLimit != null ? String(payload.memoryLimit) : "",
          shortDescription: payload.shortDescription || "",
          fullDescription: payload.fullDescription || "",
          sampleIO: Array.isArray(payload.sampleIO) && payload.sampleIO.length > 0
            ? payload.sampleIO.map(s => ({
                input: s.input || "",
                output: s.output || "",
                explanation: s.explanation || ""
              }))
            : [{ input: "", output: "", explanation: "" }],
          allowedLanguages: Array.isArray(payload.allowedLanguages) ? payload.allowedLanguages : [],
          showBoilerplates: typeof payload.showBoilerplates === "boolean" ? payload.showBoilerplates : true,
          showSolution: typeof payload.showSolution === "boolean" ? payload.showSolution : false,
          published: typeof payload.published === "boolean" ? payload.published : false,
          runCodeEnabled: typeof payload.runCodeEnabled === "boolean" ? payload.runCodeEnabled : true,
          submissionEnabled: typeof payload.submissionEnabled === "boolean" ? payload.submissionEnabled : true,

  // NEW: default to medium if backend doesn't provide
  difficulty: (payload.difficulty && ["easy","medium","hard"].includes(String(payload.difficulty).toLowerCase()))
              ? String(payload.difficulty).toLowerCase()
              : "medium"
        });
        console.log("Form data set:", payload);
      } catch (err) {
        console.error(err);
        showError(err.message || "Failed to load question form");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [questionId]);

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: !!checked }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSampleIOChange = (index, field, value) => {
    const newSampleIO = [...formData.sampleIO];
    newSampleIO[index] = { ...newSampleIO[index], [field]: value };
    setFormData(prev => ({ ...prev, sampleIO: newSampleIO }));
  };

  const addSampleIO = () => {
    setFormData(prev => ({ ...prev, sampleIO: [...prev.sampleIO, { input: "", output: "", explanation: "" }] }));
  };

  const removeSampleIO = (index) => {
    const newSampleIO = formData.sampleIO.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, sampleIO: newSampleIO.length ? newSampleIO : [{ input: "", output: "", explanation: "" }] }));
  };

  const toggleLanguage = (langId) => {
    setFormData(prev => {
      const setLangs = new Set(prev.allowedLanguages || []);
      if (setLangs.has(langId)) setLangs.delete(langId);
      else setLangs.add(langId);
      return { ...prev, allowedLanguages: Array.from(setLangs) };
    });
  };

  const tagsList = (formData.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  const selectedTopic = topics.find(t => t.name === formData.topic);

  const buildPayloadForSave = () => {
    const isSampleNonEmpty = (s) => {
      return (s.input && String(s.input).trim() !== "") ||
             (s.output && String(s.output).trim() !== "") ||
             (s.explanation && String(s.explanation).trim() !== "");
    };

    const normalized = {
      title: formData.title,
      topic: formData.topic,
      subtopic: formData.subtopic,
      tags: formData.tags,
      timeLimit: formData.timeLimit ? Number(formData.timeLimit) : null,
      memoryLimit: formData.memoryLimit ? Number(formData.memoryLimit) : null,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      allowedLanguages: formData.allowedLanguages || [],
      showBoilerplates: !!formData.showBoilerplates,
      showSolution: !!formData.showSolution,
      published: !!formData.published,
      runCodeEnabled: !!formData.runCodeEnabled,
      submissionEnabled: !!formData.submissionEnabled,
        // NEW
  difficulty: (["easy","medium","hard"].includes(String(formData.difficulty).toLowerCase()))
              ? String(formData.difficulty).toLowerCase()
              : "medium"
    };

    const samples = (formData.sampleIO || [])
      .filter(isSampleNonEmpty)
      .map(s => ({
        input: s.input || "",
        output: s.output || "",
        explanation: s.explanation || ""
      }));

    if (samples.length > 0) {
      normalized.sampleIO = samples;
    }

    return normalized;
  };


  const handleSave = async () => {
    if (!questionId) {
      showError("No questionId provided. Create a minimal question first.");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayloadForSave();
      await saveQuestionForm(questionId, payload);
      showSuccess("Saved successfully");
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to save form");
      showSuccess("Save failed: " + (err.message || "unknown error"));
    } finally {
      setSaving(false);
    }
  };
  // approximate visual measurements for preview boxes
const LINE_HEIGHT_PX = 20;        // adjust if your font-size/line-height differs
const CHARS_PER_LINE = 80;       // rough chars per line before wrapping

// estimate number of wrapped lines for a text block
const estimateLines = (text = "") => {
  if (!text) return 0;
  // split on explicit newlines, then estimate wraps per logical line
  const logicalLines = String(text).split("\n");
  let total = 0;
  for (const ln of logicalLines) {
    // treat empty line as 1 visual line
    if (ln.length === 0) { total += 1; continue; }
    total += Math.max(1, Math.ceil(ln.length / CHARS_PER_LINE));
  }
  return total+1;
};

// compute a minHeight style based on number of rows
const minHeightForRows = (rows) => ({ minHeight: `${rows * LINE_HEIGHT_PX}px` });


  return (
    <div className="h-full bg-gray-50">
      {/* Fixed Save button top-right (always visible) */}
      <div className="fixed top-12 right-12 z-50">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-4 py-2 bg-[#4CA466] text-white text-sm font-medium rounded-lg hover:bg-[#3d8a54] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Form"}
        </button>
      </div>

      <div className="w-full h-full flex items-start">
        <div className="grid grid-cols-2 gap-6 w-full h-full">
          {/* Left: Form */}
          <div className="p-4 overflow-y-auto  bg-white p-6 ">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create / Edit Question</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading form...</div>
            ) : (
              <div className="space-y-4 ">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                    placeholder="Enter question title..."
                  />
                </div>

                {/* Compact Toggle switches: reduced padding and gap */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <ToggleSwitch
                    id="toggle-boilerplates"
                    checked={!!formData.showBoilerplates}
                    onChange={(v) => handleCheckboxChange('showBoilerplates', v)}
                    label="Boilerplates"
                    subtitle="Show boilerplate templates"
                  />
                  <ToggleSwitch
                    id="toggle-solution"
                    checked={!!formData.showSolution}
                    onChange={(v) => handleCheckboxChange('showSolution', v)}
                    label="Show Solution"
                    subtitle="Reveal solution in preview/submission"
                  />
                  <ToggleSwitch
                    id="toggle-published"
                    checked={!!formData.published}
                    onChange={(v) => handleCheckboxChange('published', v)}
                    label="Published"
                    subtitle="Make question visible"
                  />
                  <ToggleSwitch
                    id="toggle-run"
                    checked={!!formData.runCodeEnabled}
                    onChange={(v) => handleCheckboxChange('runCodeEnabled', v)}
                    label="Code Runner"
                    subtitle="Allow running code"
                  />
                  <ToggleSwitch
                    id="toggle-submit"
                    checked={!!formData.submissionEnabled}
                    onChange={(v) => handleCheckboxChange('submissionEnabled', v)}
                    label="Submission"
                    subtitle="Allow submissions"
                  />
                </div>

                {/* Topic & Subtopic */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => { handleInputChange('topic', e.target.value); handleInputChange('subtopic', ''); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                    >
                      <option value="">Select Topic</option>
                      {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtopic</label>
                    <select
                      value={formData.subtopic}
                      onChange={(e) => handleInputChange('subtopic', e.target.value)}
                      disabled={!selectedTopic}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Subtopic</option>
                      {selectedTopic?.subtopics.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                  <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
  <select
    value={formData.difficulty}
    onChange={(e) => handleInputChange('difficulty', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
  >
    <option value="easy">Easy</option>
    <option value="medium">Medium</option>
    <option value="hard">Hard</option>
  </select>
</div>

                </div>
                {/* Difficulty */}


                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                    placeholder="array, sorting, medium"
                  />
                </div>

                {/* Time & Memory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.timeLimit}
                      onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Memory Limit (MB)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.memoryLimit}
                      onChange={(e) => handleInputChange('memoryLimit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                      placeholder="256"
                    />
                  </div>
                </div>

                {/* Allowed Languages (checkboxes) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LANGUAGES.map(lang => {
                      const checked = (formData.allowedLanguages || []).includes(lang.id);
                      return (
                        <label key={lang.id} className="inline-flex items-center space-x-2 px-2 py-1 border rounded-md cursor-pointer select-none text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLanguage(lang.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{lang.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none"
                    placeholder="Brief summary of the problem..."
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                  <textarea
                    value={formData.fullDescription}
                    onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none"
                    placeholder="Detailed problem description..."
                  />
                </div>

                {/* Sample I/O */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Sample Input/Output</label>
                    <button
                      onClick={addSampleIO}
                      type="button"
                      className="px-3 py-1 bg-[#4CA466] text-white text-sm font-medium rounded-lg hover:bg-[#3d8a54] transition-colors"
                    >
                      Add Sample
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.sampleIO.map((sample, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">Sample {index + 1}</h4>
                          <button
                            onClick={() => removeSampleIO(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>

                 <div className="space-y-2">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {/* Input */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
      <textarea
        value={sample.input}
        onChange={(e) => handleSampleIOChange(index, 'input', e.target.value)}
        rows="6"
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none"
        placeholder="Sample input..."
      />
    </div>

    {/* Output */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Output</label>
      <textarea
        value={sample.output}
        onChange={(e) => handleSampleIOChange(index, 'output', e.target.value)}
        rows="6"
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none"
        placeholder="Expected output..."
      />
    </div>
  </div>

  {/* Explanation (full width, below Input/Output) */}
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">Explanation</label>
    <textarea
      value={sample.explanation}
      onChange={(e) => handleSampleIOChange(index, 'explanation', e.target.value)}
      rows="6"
      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none"
      placeholder="Explanation of the solution..."
    />
  </div>
</div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {error && <div className="mt-4 text-red-600">{error}</div>}
          </div>
 {/* Right: Live Preview */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)] bg-gray-50 ">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>

            <div className="space-y-4">
              <div>
                {/* Title rendered as Markdown (allows inline formatting and math) */}
                <h3 className="text-2xl font-bold text-gray-900">
                 <MarkdownRenderer text={formData.title}/>
                </h3>
              </div>

              <div>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    formData.difficulty === "easy" ? "bg-green-100 text-green-800" :
                    formData.difficulty === "hard" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>{formData.difficulty?.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.topic && <span className="px-3 py-1 bg-[#4CA466] text-white text-sm rounded-full">{formData.topic}</span>}
                {formData.subtopic && <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">{formData.subtopic}</span>}
                {tagsList.map((tag, idx) => <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{tag}</span>)}
              </div>

              {(formData.timeLimit || formData.memoryLimit) && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Constraints</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {formData.timeLimit && <p>Time Limit: {formData.timeLimit} seconds</p>}
                    {formData.memoryLimit && <p>Memory Limit: {formData.memoryLimit} MB</p>}
                  </div>
                </div>
              )}

              {formData.allowedLanguages && formData.allowedLanguages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Allowed Languages</h4>
                  <div className="flex gap-2 flex-wrap">
                    {formData.allowedLanguages.map(lang => {
                      const label = AVAILABLE_LANGUAGES.find(l => l.id === lang)?.label || lang;
                      return <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{label}</span>;
                    })}
                  </div>
                </div>
              )}

              {formData.shortDescription && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                  <div className="prose max-w-none">
                   
                   <MarkdownRenderer text=  {formData.shortDescription}/>
                  </div>
                </div>
              )}

              {formData.fullDescription && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Problem Description</h4>
                  <div className="prose max-w-none">
                   <MarkdownRenderer text=  {formData.fullDescription}/>
                  </div>
                </div>
              )}

              {formData.sampleIO.some(s => s.input || s.output || s.explanation) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Examples</h4>
                  <div className="space-y-3">
                    {formData.sampleIO.map((sample, index) => (
                      (sample.input || sample.output || sample.explanation) && (
                        <div className="bg-gray-50 rounded-lg p-3" key={index}>
                          <h5 className="text-xs font-medium text-gray-600 mb-2">Example {index + 1}</h5>

                          {/* Input + Output side by side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {sample.input && (() => {
                              const inputLines = estimateLines(sample.input);
                              const outputLines = estimateLines(sample.output);
                              const rows = Math.max(inputLines, outputLines, 3); // at least 3 rows
                              return (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Input:</p>
                                  {/* Keep input as pre/code for exact formatting. If you want markdown rendering for input,
                                      wrap it into triple backticks and render with ReactMarkdown instead. */}
                                  <pre
                                    className="text-sm text-gray-800 bg-white p-2 rounded border font-mono overflow-x-auto whitespace-pre-wrap"
                                    style={minHeightForRows(rows)}
                                  >
                                    {sample.input}
                                  </pre>
                                </div>
                              );
                            })()}

                            {sample.output && (() => {
                              const inputLines = estimateLines(sample.input);
                              const outputLines = estimateLines(sample.output);
                              const rows = Math.max(inputLines, outputLines, 3);
                              return (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Output:</p>
                                  <pre
                                    className="text-sm text-gray-800 bg-white p-2 rounded border font-mono overflow-x-auto whitespace-pre-wrap"
                                    style={minHeightForRows(rows)}
                                  >
                                    {sample.output}
                                  </pre>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Explanation (full width below) */}
                          {sample.explanation && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Explanation:</p>
                              <div className="prose max-w-none">
                            <MarkdownRenderer text=  {sample.explanation}/>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {!formData.title && !formData.shortDescription && !formData.fullDescription && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">📝</div>
                  <p className="text-gray-500 text-sm">Start filling out the form to see your question preview</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodingQuestionInfo;