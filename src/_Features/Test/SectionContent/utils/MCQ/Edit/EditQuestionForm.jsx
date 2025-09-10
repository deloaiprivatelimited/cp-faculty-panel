import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2, Plus, X } from 'lucide-react';
// import { privateAxios } from '../../../utils/axios';
// import { privateAxios } from '../../../../utils/axios';
// import { showError, showSuccess } from '../../../utils/toast';
// import { showError,showSuccess } from '../../../../utils/toast';
import { privateAxios } from '../../../../../../utils/axios';
import { showError,showSuccess } from '../../../../../../utils/toast';
// Small UUID helper using browser crypto
const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());

export default function EditQuestionForm({ formData, setFormData, setSaveRef, setSaving }) {
  const [dropdownStates, setDropdownStates] = useState({ topic: false, subtopic: false, difficulty: false });
  const [Loading, setLoading] = useState(false);

  const topics = [
  "Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "Programming",
  "Data Structures",
  "Algorithms",
  "Software Engineering",
  "System Design",
  "HR & Behavioral"
];

const subtopics = {
  Aptitude: [
    "Quantitative Aptitude",
    "Number System",
    "Percentages",
    "Ratios & Proportions",
    "Time & Work",
    "Speed, Time & Distance",
    "Probability",
    "Permutations & Combinations",
    "Mensuration",
    "Data Interpretation"
  ],
  "Logical Reasoning": [
    "Puzzles",
    "Seating Arrangement",
    "Blood Relations",
    "Coding-Decoding",
    "Syllogisms",
    "Direction Sense",
    "Series (Number/Alphabet)",
    "Clocks & Calendars"
  ],
  "Verbal Ability": [
    "Reading Comprehension",
    "Sentence Correction",
    "Fill in the Blanks",
    "Synonyms & Antonyms",
    "Paragraph Jumbles",
    "Critical Reasoning"
  ],
  "Operating Systems": [
    "Process Management",
    "CPU Scheduling",
    "Memory Management",
    "Deadlocks",
    "File Systems",
    "Concurrency & Synchronization"
  ],
  DBMS: [
    "ER Model",
    "Normalization",
    "SQL Queries",
    "Transactions",
    "Indexing",
    "Joins & Keys"
  ],
  "Computer Networks": [
    "OSI & TCP/IP Models",
    "IP Addressing",
    "Routing",
    "Switching",
    "Congestion Control",
    "Application Layer Protocols (HTTP, DNS, FTP)"
  ],
  Programming: [
    "C/C++ Basics",
    "Java Basics",
    "Python Basics",
    "OOP Concepts",
    "Exception Handling",
    "Standard Libraries"
  ],
  "Data Structures": [
    "Arrays",
    "Strings",
    "Linked List",
    "Stacks & Queues",
    "Trees",
    "Graphs",
    "Hashing",
    "Heaps"
  ],
  Algorithms: [
    "Sorting",
    "Searching",
    "Recursion & Backtracking",
    "Greedy Algorithms",
    "Dynamic Programming",
    "Graph Algorithms",
    "Divide & Conquer"
  ],
  "Software Engineering": [
    "SDLC Models",
    "Agile & Scrum",
    "Testing & Debugging",
    "Version Control (Git)"
  ],
  "System Design": [
    "Scalability Basics",
    "Load Balancing",
    "Caching",
    "Databases in Design",
    "High-Level Design Questions"
  ],
  "HR & Behavioral": [
    "Tell me about yourself",
    "Strengths & Weaknesses",
    "Teamwork",
    "Leadership",
    "Conflict Resolution",
    "Why should we hire you?"
  ]
};
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const toggleDropdown = (k) => setDropdownStates(s => ({ ...s, [k]: !s[k] }));
  const selectDropdownValue = (k, val) => {
    setFormData(prev => ({ ...prev, [k]: val, ...(k === 'topic' ? { subtopic: '' } : {}) }));
    setDropdownStates(s => ({ ...s, [k]: false }));
  };

  // ---------------- validators -----------------
  const validateForm = () => {
    if (!formData.topic) return showError('Topic is required'), false;
    if (!formData.subtopic) return showError('Subtopic is required'), false;
    if (!formData.title?.trim()) return showError('Title is required'), false;
    if (!formData.questionText?.trim()) return showError('Question text is required'), false;
    if (formData.options.length < 2) return showError('At least 2 options are required'), false;
    if (formData.options.some(o => !o.value?.trim())) return showError('Options cannot be empty'), false;
    if ((formData.correctAnswers || []).length === 0) return showError('Select at least one correct answer'), false;
    // ensure all selected correct ids actually exist in options
    const ids = new Set(formData.options.map(o => o.option_id));
    if (!formData.correctAnswers.every(id => ids.has(id))) return showError('Correct answers are invalid'), false;
    if (!formData.marks || Number(formData.marks) < 0) return showError('Marks must be >= 0'), false;
    if (Number(formData.negativeMarks) < 0) return showError('Negative marks cannot be negative'), false;
    if (!formData.timeLimit || Number(formData.timeLimit) <= 0) return showError('Time limit must be > 0'), false;
    return true;
  };

  const timeInSeconds = useMemo(() => {
    const n = Number(formData.timeLimit);
    return formData.timeUnit === 'minutes' ? n * 60 : formData.timeUnit === 'hours' ? n * 3600 : n;
  }, [formData.timeLimit, formData.timeUnit]);

  // ---------------- option helpers -----------------
  const addOption = () => setFormData(prev => ({
    ...prev,
    options: [...prev.options, { option_id: uuid(), value: '' }],
  }));

  const removeOption = (index) => {
    setFormData(prev => {
      if (prev.options.length <= 2) return prev; // require at least 2
      const removed = prev.options[index];
      const nextOptions = prev.options.filter((_, i) => i !== index);
      const nextCorrect = prev.correctAnswers.filter(id => id !== removed.option_id);
      return { ...prev, options: nextOptions, correctAnswers: nextCorrect };
    });
  };

  const handleOptionChange = (index, value) => setFormData(prev => {
    const next = [...prev.options];
    next[index] = { ...next[index], value };
    return { ...prev, options: next };
  });

  const toggleCorrect = (option_id) => setFormData(prev => {
    const exists = prev.correctAnswers.includes(option_id);
    if (prev.isMultipleCorrect) {
      return { ...prev, correctAnswers: exists ? prev.correctAnswers.filter(id => id !== option_id) : [...prev.correctAnswers, option_id] };
    }
    return { ...prev, correctAnswers: exists ? [] : [option_id] };
  });

  const toggleMultiple = () => setFormData(prev => ({ ...prev, isMultipleCorrect: !prev.isMultipleCorrect, correctAnswers: [] }));

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // expose save to parent header
  useEffect(() => {
    if (!setSaveRef) return;
    setSaveRef(async () => {
      if (!validateForm()) return;
      const payload = {
        title: formData.title,
        question_text: formData.questionText,
        // send options with stable ids;
        options: formData.options.map(o => ({ option_id: o.option_id, value: o.value })),
        correct_options: formData.correctAnswers, // option_id list
        is_multiple: formData.isMultipleCorrect,
        marks: Number(formData.marks),
        negative_marks: Number(formData.negativeMarks),
        difficulty_level: formData.difficulty,
        explanation: formData.explanation,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        time_limit: timeInSeconds,
        topic: formData.topic,
        subtopic: formData.subtopic,
      };
      try {
        setSaving?.(true); setLoading(true);
        const res = await privateAxios.put(`/tests/mcq/edit/${formData.id}`, payload);
        if (res.data?.success) {
          showSuccess(res.data.message || 'MCQ updated');
        } else {
          showError(res.data?.message || 'Failed to update');
        }
      } catch (e) {
        console.error(e);
        showError('Something went wrong while updating');
      } finally {
        setLoading(false); setSaving?.(false);
      }
    });
  }, [formData]);

  const SearchableDropdown = ({ label, value, options, placeholder, dropdownKey }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <button type="button" onClick={() => toggleDropdown(dropdownKey)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors bg-white text-left flex items-center justify-between">
          <span className={value ? 'text-gray-800' : 'text-gray-500'}>{value || placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownStates[dropdownKey] ? 'rotate-180' : ''}`} />
        </button>
        {dropdownStates[dropdownKey] && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option, idx) => (
              <button key={idx} type="button" onClick={() => selectDropdownValue(dropdownKey, option)} className="w-full px-4 py-2 text-left hover:bg-[#4CA466]/10 transition-colors text-gray-800">{option}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const getTagsArray = () => formData.tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="relative">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit MCQ</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableDropdown label="Topic" value={formData.topic} options={topics} placeholder="Select topic" dropdownKey="topic" />
            <SearchableDropdown label="Subtopic" value={formData.subtopic} options={formData.topic ? (subtopics[formData.topic] || []) : []} placeholder="Select subtopic" dropdownKey="subtopic" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
            <textarea value={formData.questionText} onChange={(e) => handleInputChange('questionText', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
          </div>

          {/* Options (with stable IDs) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Answer Options</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="multipleCorrect" checked={formData.isMultipleCorrect} onChange={toggleMultiple} className="w-4 h-4 text-[#4CA466] border-gray-300 rounded focus:ring-[#4CA466]" />
                  <label htmlFor="multipleCorrect" className="text-sm text-gray-700">Multiple correct</label>
                </div>
                <button type="button" onClick={addOption} className="flex items-center space-x-1 px-3 py-1 bg-[#4CA466] text-white rounded-md hover:bg-[#3d8a54] transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {formData.options.map((opt, index) => (
                <div key={opt.option_id} className="flex items-center space-x-3 group">
                  <input type={formData.isMultipleCorrect ? 'checkbox' : 'radio'} name="correctAnswer" checked={formData.correctAnswers.includes(opt.option_id)} onChange={() => toggleCorrect(opt.option_id)} className="w-4 h-4 text-[#4CA466] border-gray-300 focus:ring-[#4CA466] flex-shrink-0" />
                  <input type="text" value={opt.value} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
                  {formData.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
              <input type="number" value={formData.marks} onChange={(e) => handleInputChange('marks', e.target.value)} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marks</label>
              <input type="number" value={formData.negativeMarks} onChange={(e) => handleInputChange('negativeMarks', e.target.value)} min="0" step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            </div>
            <SearchableDropdown label="Difficulty Level" value={formData.difficulty} options={difficulties} placeholder="Select difficulty" dropdownKey="difficulty" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
            <div className="flex space-x-3">
              <input type="number" value={formData.timeLimit} onChange={(e) => handleInputChange('timeLimit', e.target.value)} min="1" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
              <select value={formData.timeUnit} onChange={(e) => handleInputChange('timeUnit', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
            <textarea value={formData.explanation} onChange={(e) => handleInputChange('explanation', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input type="text" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} placeholder="comma,separated,tags" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            {getTagsArray().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {getTagsArray().map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium border border-[#4CA466]/20">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {Loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <span className="text-white text-lg font-medium">Saving...</span>
          </div>
        </div>
      )}
    </div>
  );
}
