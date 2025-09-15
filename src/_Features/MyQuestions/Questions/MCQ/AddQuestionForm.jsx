import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, X, ChevronDown, Loader2 } from 'lucide-react';
import "katex/dist/katex.min.css";
import { showSuccess,showError } from '../../../../utils/toast';
// import { showSuccess, showError } from '../../../utils/toast';
import { privateAxios } from '../../../../utils/axios';
import { uploadFile, validateFile, formatFileSize } from '../../../../utils/fileUpload';

const AddQuestionForm = ({ formData, setFormData, setSaveRef, onSavingChange, onSaveSuccess }) => {
  const [dropdownStates, setDropdownStates] = useState({
    topic: false,
    subtopic: false,
    difficulty: false
  });
  const [Loading, setLoading] = useState(false);
  const [fileUploads, setFileUploads] = useState({}); // { localId: { progress, status, url, label } }

  // track which image_id should be focused after being added
  const pendingFocus = useRef(null);
  // refs for inputs keyed by image_id
  const imageInputRefs = useRef({});

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

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // --- Normalize options early (convert strings -> objects) so keys don't change on every render ---
  useEffect(() => {
    if (!formData?.options || formData.options.length === 0) return;
    const hasStrings = formData.options.some(opt => typeof opt === 'string');
    if (hasStrings) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.map(opt => typeof opt === 'string' ? { option_id: uuid(), value: opt, images: [] } : opt)
      }));
    }
    // only watch options and setFormData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.options]);

  // helpers
  const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());

  const buildOptionsWithIds = () => {
    const opts = formData?.options || [];
    return opts.map(o => ({ option_id: o.option_id || uuid(), value: (o.value ?? o) || "", images: o.images || [] }));
  };

  // derive once per render
  const optionsWithIds = useMemo(() => buildOptionsWithIds(), [formData?.options]);

  const handleOptionChange = (index, value) => {
    setFormData(prev => {
      const options = (prev.options || []).map((opt, i) => i === index ? { ...opt, value } : opt);
      return { ...prev, options };
    });
  };

  const addOption = () => setFormData(prev => ({ ...prev, options: [...(prev.options || []), { option_id: uuid(), value: '', images: [] }] }));

  const removeOption = (index) => {
    setFormData(prev => {
      if ((prev.options || []).length <= 2) return prev;
      const newOptions = prev.options.filter((_, i) => i !== index);
      const newCorrectAnswers = prev.correctAnswers
        .filter(i => i !== index)
        .map(i => (i > index ? i - 1 : i));
      return { ...prev, options: newOptions, correctAnswers: newCorrectAnswers };
    });
  };

  const handleCorrectAnswerToggle = (index) => {
    if (formData.isMultipleCorrect) {
      const newCorrectAnswers = formData.correctAnswers.includes(index)
        ? formData.correctAnswers.filter(i => i !== index)
        : [...formData.correctAnswers, index];
      setFormData(prev => ({ ...prev, correctAnswers: newCorrectAnswers }));
    } else {
      setFormData(prev => ({ ...prev, correctAnswers: [index] }));
    }
  };
  const handleMultipleCorrectToggle = () =>
    setFormData(prev => ({ ...prev, isMultipleCorrect: !prev.isMultipleCorrect, correctAnswers: [] }));

  const toggleDropdown = (dropdown) => setDropdownStates(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
  const selectDropdownValue = (dropdown, value) => {
    setFormData(prev => ({ ...prev, [dropdown]: value, ...(dropdown === 'topic' ? { subtopic: '' } : {}) }));
    setDropdownStates(prev => ({ ...prev, [dropdown]: false }));
  };

  const SearchableDropdown = ({ label, value, options, placeholder, dropdownKey }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown(dropdownKey)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors bg-white text-left flex items-center justify-between"
        >
          <span className={value ? 'text-gray-800' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownStates[dropdownKey] ? 'rotate-180' : ''}`} />
        </button>

        {dropdownStates[dropdownKey] && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectDropdownValue(dropdownKey, option)}
                className="w-full px-4 py-2 text-left hover:bg-[#4CA466]/10 transition-colors text-gray-800"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 🔹 Form Validation (unchanged behaviour)
  const validateForm = () => {
    if (!formData.topic) { showError("Topic is required"); return false; }
    if (!formData.subtopic) { showError("Subtopic is required"); return false; }
    if (!formData.title?.trim()) { showError("Title is required"); return false; }
    if (!formData.questionText?.trim()) { showError("Question text is required"); return false; }
    if (formData.options.length < 2) { showError("At least 2 options are required"); return false; }
    if (formData.options.some(opt => (typeof opt === 'string' ? !opt.trim() : !(opt.value || '').trim()))) { showError("Options cannot be empty"); return false; }
    if (formData.correctAnswers.length === 0) { showError("Select at least one correct answer"); return false; }
    if (formData.marks === undefined || formData.marks === null || Number(formData.marks) < 0) { showError("Marks must be >= 0"); return false; }
    if (formData.negativeMarks < 0) { showError("Negative marks cannot be negative"); return false; }
    if (!formData.timeLimit || Number(formData.timeLimit) <= 0) { showError("Time limit must be greater than 0"); return false; }
    return true; // ✅
  };

  // Convert timeLimit + timeUnit into seconds
  const timeInSeconds =
    formData.timeUnit === "minutes"
      ? Number(formData.timeLimit) * 60
      : formData.timeUnit === "hours"
        ? Number(formData.timeLimit) * 3600
        : Number(formData.timeLimit); // default seconds

  // focus effect: when pendingFocus.current is set, focus that input and select its content
  useEffect(() => {
    if (!pendingFocus.current) return;
    const { image_id } = pendingFocus.current;
    const el = imageInputRefs.current[image_id];
    if (el) {
      try {
        el.focus();
        if (typeof el.select === 'function') el.select();
      } catch (err) {
        // ignore
      }
    }
    pendingFocus.current = null;
  }, [formData.questionImages, formData.explanationImages, formData.options]);

  // FILE HANDLING (unchanged logic but safe with normalized options)
  const handleLocalFileSelect = (file, purpose, optIndex = null) => {
    try {
      validateFile(file, { maxSize: 10, allowedTypes: ['image/png', 'image/jpeg', 'image/webp'] });
    } catch (err) {
      showError(err.message || "Invalid file");
      return;
    }

    const localId = uuid();
    setFileUploads(prev => ({ ...prev, [localId]: { file, progress: 0, status: 'queued', purpose, optIndex } }));

    (async () => {
      try {
        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'uploading' } }));
        const res = await uploadFile(file, (p) => {
          setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), progress: p } }));
        }, '/mcq-images');

        const imageObject = {
          image_id: uuid(),
          url: res.url,
          label: '', // default empty
          alt_text: file.name || '',
          metadata: { key: res.key, size: file.size, type: file.type }
        };

        if (purpose === 'question') {
          const qImgs = (formData.questionImages || []).concat(imageObject);
          setFormData(prev => ({ ...prev, questionImages: qImgs }));
        } else if (purpose === 'explanation') {
          const eImgs = (formData.explanationImages || []).concat(imageObject);
          setFormData(prev => ({ ...prev, explanationImages: eImgs }));
        } else if (purpose === 'option' && (optIndex !== null)) {
          setFormData(prev => {
            const options = (prev.options || []).map(o => ({ ...o }));
            while (options.length <= optIndex) options.push({ option_id: uuid(), value: "", images: [] });
            options[optIndex] = { ...options[optIndex], images: (options[optIndex].images || []).concat(imageObject) };
            return { ...prev, options };
          });
        }

        // mark this image to be auto-focused for label editing
        pendingFocus.current = { image_id: imageObject.image_id };

        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'done', progress: 100, url: res.url } }));
      } catch (err) {
        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'error' } }));
        console.error('Upload failed', err);
        showError('File upload failed');
      }
    })();
  };

  // EDIT LABEL helper - keeps labels editable in UI and persists into formData
  const updateImageLabel = (purpose, index, newLabel, optIndex = null) => {
    if (purpose === 'question') {
      setFormData(prev => {
        const arr = (prev.questionImages || []).map((img, i) => i === index ? { ...img, label: newLabel } : img);
        return { ...prev, questionImages: arr };
      });
    } else if (purpose === 'explanation') {
      setFormData(prev => {
        const arr = (prev.explanationImages || []).map((img, i) => i === index ? { ...img, label: newLabel } : img);
        return { ...prev, explanationImages: arr };
      });
    } else if (purpose === 'option' && optIndex !== null) {
      setFormData(prev => {
        const options = (prev.options || []).map(o => ({ ...o }));
        options[optIndex] = {
          ...options[optIndex],
          images: (options[optIndex].images || []).map((img, i) => i === index ? { ...img, label: newLabel } : img)
        };
        return { ...prev, options };
      });
    }
  };

  const removeImage = (purpose, index, optIndex = null) => {
    if (purpose === 'question') {
      setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).filter((_, i) => i !== index) }));
    } else if (purpose === 'explanation') {
      setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).filter((_, i) => i !== index) }));
    } else if (purpose === 'option' && optIndex !== null) {
      setFormData(prev => {
        const options = (prev.options || []).map(o => ({ ...o }));
        options[optIndex].images = (options[optIndex].images || []).filter((_, i) => i !== index);
        return { ...prev, options };
      });
    }
  };

  // SAVE handling (unchanged behaviour)
  const handleSave = async () => {
    if (!validateForm()) return;

    const uploadsInProgress = Object.values(fileUploads).some(f => f.status === 'uploading' || f.status === 'queued');
    if (uploadsInProgress) {
      showError('Please wait for image uploads to finish');
      return;
    }

    const optionsWithIds = buildOptionsWithIds();
    let correctOptionIds = [];
    if (formData.correctAnswers.length > 0) {
      const first = formData.correctAnswers[0];
      const isIdStyle = typeof first === 'string';
      if (isIdStyle) {
        correctOptionIds = formData.correctAnswers;
      } else {
        correctOptionIds = formData.correctAnswers.map(i => optionsWithIds[i]?.option_id).filter(Boolean);
      }
    }

    const payload = {
      title: formData.title,
      question_text: formData.questionText,
      question_images: (formData.questionImages || []).map(i => ({ image_id: i.image_id, label: i.label, url: i.url, alt_text: i.alt_text, metadata: i.metadata })),
      options: optionsWithIds.map(o => ({
        option_id: o.option_id,
        value: o.value,
        images: (o.images || []).map(im => ({ image_id: im.image_id, label: im.label, url: im.url, alt_text: im.alt_text, metadata: im.metadata }))
      })),
      correct_options: correctOptionIds,
      is_multiple: formData.isMultipleCorrect,
      marks: Number(formData.marks),
      negative_marks: Number(formData.negativeMarks),
      difficulty_level: formData.difficulty,
      explanation: formData.explanation,
      explanation_images: (formData.explanationImages || []).map(i => ({ image_id: i.image_id, label: i.label, url: i.url, alt_text: i.alt_text, metadata: i.metadata })),
      tags: (formData.tags || '').split(",").map(tag => tag.trim()).filter(Boolean),
      time_limit: timeInSeconds,
      topic: formData.topic,
      subtopic: formData.subtopic
    }; // choose endpoint based on unit id presence (accepting either camelCase or PascalCase)
  const unitId = formData.unitID ?? formData.unitId ?? null;
  const url = unitId
    ? `/course-mcqs/units/${encodeURIComponent(unitId)}/mcq`
    : 'college-mcqs/';


    try {
      onSavingChange?.(true);
      setLoading(true);
    const res = await privateAxios.post(url, payload);
      setLoading(false);
      onSavingChange?.(false);
      if (res.data.success) {
        showSuccess(res.data.message || "MCQ saved successfully!");
        onSaveSuccess?.();
      } else {
        showError(res.data.message || "Failed to save MCQ");
      }
    } catch (err) {
      setLoading(false);
      onSavingChange?.(false);
      console.error("Error saving MCQ:", err);
      showError("Something Went Wrong");
    }
  };

  useEffect(() => {
    if (setSaveRef) setSaveRef(handleSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSaveRef]);

  const getTagsArray = () => (formData.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

  // stable ref setter (so it's less likely to flash null then node)
  const setImageRef = (id) => (el) => {
    if (!id) return;
    if (el) imageInputRefs.current[id] = el;
    else delete imageInputRefs.current[id];
  };

  // small helper to render file upload UI
  const FileUploader = ({ purpose, optIndex = null }) => (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <label
          htmlFor={`file-upload-${purpose}-${optIndex ?? "main"}`}
          className="cursor-pointer inline-flex items-center px-3 py-2 rounded-lg text-white text-sm font-medium shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: "#4CA466" }}
        >
          {purpose === "question"
            ? "Question Images"
            : purpose === "explanation"
              ? "Explanation Images"
              : "Option Images"}
        </label>

        <input
          id={`file-upload-${purpose}-${optIndex ?? "main"}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleLocalFileSelect(f, purpose, optIndex);
            e.target.value = null;
          }}
        />

      </div>

      <div className="flex gap-2 mt-2 flex-wrap">
        {purpose === 'question' && (formData.questionImages || []).map((img, i) => (
          <div key={img.image_id} className="flex flex-col items-center w-36">
            {/* Image card */}
            <div className="border rounded p-2 flex flex-col items-start w-full">
              <img
                src={img.url}
                alt={img.alt_text || img.label}
                className="w-32 h-20 object-contain rounded"
              />
              <div className="flex items-center justify-between w-full mt-1">
                <div className="text-xs text-gray-500">{formatFileSize(img.metadata?.size || 0)}</div>
                <button
                  onClick={() => removeImage('question', i)}
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Label input outside the bordered box */}
            <input
              ref={setImageRef(img.image_id)}
              type="text"
              value={img.label || ''}
              onChange={(e) => updateImageLabel('question', i, e.target.value)}
              placeholder="Enter label..."
              className="text-xs px-2 py-1 border rounded w-full mt-2"
            />
          </div>
        ))}

        {purpose === 'explanation' && (formData.explanationImages || []).map((img, i) => (
          <div key={img.image_id} className="flex flex-col items-center w-36">
            <div className="border rounded p-2 flex flex-col items-start w-full">
              <img
                src={img.url}
                alt={img.alt_text || img.label}
                className="w-32 h-20 object-contain rounded"
              />
              <div className="flex items-center justify-between w-full mt-1">
                <div className="text-xs text-gray-500">{formatFileSize(img.metadata?.size || 0)}</div>
                <button
                  onClick={() => removeImage('explanation', i)}
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              ref={setImageRef(img.image_id)}
              type="text"
              value={img.label || ''}
              onChange={(e) => updateImageLabel('explanation', i, e.target.value)}
              placeholder="Enter label..."
              className="text-xs px-2 py-1 border rounded w-full mt-2"
            />
          </div>
        ))}

        {purpose === 'option' && optIndex !== null && ((formData.options?.[optIndex]?.images) || []).map((img, ii) => (
          <div key={img.image_id} className="flex flex-col items-center w-36">
            <div className="border rounded p-2 flex flex-col items-start w-full">
              <img
                src={img.url}
                alt={img.alt_text || img.label}
                className="w-32 h-20 object-contain rounded"
              />
              <div className="flex items-center justify-between w-full mt-1">
                <div className="text-xs text-gray-500">{formatFileSize(img.metadata?.size || 0)}</div>
                <button
                  onClick={() => removeImage('option', ii, optIndex)}
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              ref={setImageRef(img.image_id)}
              type="text"
              value={img.label || ''}
              onChange={(e) => updateImageLabel('option', ii, e.target.value, optIndex)}
              placeholder="Enter label..."
              className="text-xs px-2 py-1 border rounded w-full mt-2"
            />
          </div>
        ))}
      </div>

    </div>
  );

  return (
    <div className="relative">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New MCQ</h1>

        <div className="space-y-6">
          {/* Topic & Subtopic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableDropdown label="Topic" value={formData.topic} options={topics} placeholder="Select topic" dropdownKey="topic" />
            <SearchableDropdown label="Subtopic" value={formData.subtopic} options={formData.topic ? (subtopics[formData.topic] || []) : []} placeholder="Select subtopic" dropdownKey="subtopic" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Enter question title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
            <textarea value={formData.questionText} onChange={(e) => handleInputChange('questionText', e.target.value)} placeholder="Enter your question here..." rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
            <FileUploader purpose="question" />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Answer Options</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="multipleCorrect" checked={formData.isMultipleCorrect} onChange={handleMultipleCorrectToggle} className="w-4 h-4 text-[#4CA466] border-gray-300 rounded focus:ring-[#4CA466]" />
                  <label htmlFor="multipleCorrect" className="text-sm text-gray-700">Multiple correct</label>
                </div>
                <button type="button" onClick={addOption} className="flex items-center space-x-1 px-3 py-1 bg-[#4CA466] text-white rounded-md hover:bg-[#3d8a54] transition-colors text-sm">
                  <Plus className="w-4 h-4" /><span>Add Option</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {optionsWithIds.map((option, index) => {
                return (
                  <div key={option.option_id} className="flex flex-col space-y-2 border rounded p-3">
                    <div className="flex items-center space-x-3">
                      <input type={formData.isMultipleCorrect ? "checkbox" : "radio"} name="correctAnswer" checked={formData.correctAnswers.includes(index)} onChange={() => handleCorrectAnswerToggle(index)} className="w-4 h-4 text-[#4CA466] border-gray-300 focus:ring-[#4CA466] flex-shrink-0" />
                      <textarea
                        value={option.value}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-y"
                      />
                      {(optionsWithIds.length > 2) && (
                        <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <FileUploader purpose="option" optIndex={index} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
              <input type="number" value={formData.marks} onChange={(e) => handleInputChange('marks', e.target.value)} placeholder="Points" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marks</label>
              <input type="number" value={formData.negativeMarks} onChange={(e) => handleInputChange('negativeMarks', e.target.value)} placeholder="Penalty" min="0" step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            </div>
            <SearchableDropdown label="Difficulty Level" value={formData.difficulty} options={difficulties} placeholder="Select difficulty" dropdownKey="difficulty" />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
            <div className="flex space-x-3">
              <input type="number" value={formData.timeLimit} onChange={(e) => handleInputChange('timeLimit', e.target.value)} placeholder="Duration" min="1" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
              <select value={formData.timeUnit} onChange={(e) => handleInputChange('timeUnit', e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
            <textarea value={formData.explanation} onChange={(e) => handleInputChange('explanation', e.target.value)} placeholder="Provide detailed explanation for the correct answer..." rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
            <FileUploader purpose="explanation" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input type="text" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} placeholder="Enter tags separated by commas (e.g., algebra, equations, math)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            {getTagsArray().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {getTagsArray().map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium border border-[#4CA466]/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={handleSave} className="px-4 py-2 bg-[#4CA466] text-white rounded-md hover:bg-[#3d8a54]">
            {Loading ? <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</div> : 'Save Question'}
          </button>
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
};

export default AddQuestionForm;
