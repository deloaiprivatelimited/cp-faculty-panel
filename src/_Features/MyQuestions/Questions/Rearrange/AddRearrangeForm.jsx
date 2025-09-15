import React, { useEffect, useState, useRef } from "react";
import { Plus, X, ChevronDown, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { privateAxios } from "../../../../utils/axios";
import { showSuccess, showError } from "../../../../utils/toast";
import "katex/dist/katex.min.css";
import { uploadFile, validateFile, formatFileSize } from "../../../../utils/fileUpload";

// Updated Rearrange form with image uploads for:
// - question_images
// - explanation_images
// - per-item images

const AddRearrangeForm = ({ formData, setFormData, setSaveRef }) => {
  const [dropdownStates, setDropdownStates] = useState({ topic: false, subtopic: false, difficulty: false });
  const [loading, setLoading] = useState(false);
  const [fileUploads, setFileUploads] = useState({}); // { localId: { progress, status, url, purpose, itemIndex } }

  // focus newly uploaded image label input
  const pendingFocus = useRef(null);
  const imageInputRefs = useRef({});

  // topics/subtopics/difficulties (same as your original lists)
  const topics = [
    "Aptitude","Logical Reasoning","Verbal Ability","Operating Systems","DBMS","Computer Networks",
    "Programming","Data Structures","Algorithms","Software Engineering","System Design","HR & Behavioral"
  ];

  const subtopics = {
    Aptitude: ["Quantitative Aptitude","Number System","Percentages","Ratios & Proportions","Time & Work","Speed, Time & Distance","Probability","Permutations & Combinations","Mensuration","Data Interpretation"],
    "Logical Reasoning": ["Puzzles","Seating Arrangement","Blood Relations","Coding-Decoding","Syllogisms","Direction Sense","Series (Number/Alphabet)","Clocks & Calendars"],
    "Verbal Ability": ["Reading Comprehension","Sentence Correction","Fill in the Blanks","Synonyms & Antonyms","Paragraph Jumbles","Critical Reasoning"],
    "Operating Systems": ["Process Management","CPU Scheduling","Memory Management","Deadlocks","File Systems","Concurrency & Synchronization"],
    DBMS: ["ER Model","Normalization","SQL Queries","Transactions","Indexing","Joins & Keys"],
    "Computer Networks": ["OSI & TCP/IP Models","IP Addressing","Routing","Switching","Congestion Control","Application Layer Protocols (HTTP, DNS, FTP)"],
    Programming: ["C/C++ Basics","Java Basics","Python Basics","OOP Concepts","Exception Handling","Standard Libraries"],
    "Data Structures": ["Arrays","Strings","Linked List","Stacks & Queues","Trees","Graphs","Hashing","Heaps"],
    Algorithms: ["Sorting","Searching","Recursion & Backtracking","Greedy Algorithms","Dynamic Programming","Graph Algorithms","Divide & Conquer"],
    "Software Engineering": ["SDLC Models","Agile & Scrum","Testing & Debugging","Version Control (Git)"],
    "System Design": ["Scalability Basics","Load Balancing","Caching","Databases in Design","High-Level Design Questions"],
    "HR & Behavioral": ["Tell me about yourself","Strengths & Weaknesses","Teamwork","Leadership","Conflict Resolution","Why should we hire you?"]
  };

  const difficulties = ["Easy", "Medium", "Hard"];

  // helpers
  const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // Ensure items are objects: { item_id, value, images: [] }
  useEffect(() => {
    if (!formData?.items) return;
    const hasPrimitives = formData.items.some(it => typeof it === 'string' || !it?.item_id);
    if (hasPrimitives) {
      setFormData(prev => ({
        ...prev,
        items: (prev.items || []).map(it => typeof it === 'string' ? ({ item_id: uuid(), value: it, images: [] }) : ({ item_id: it.item_id || uuid(), value: it.value ?? '', images: it.images || [] }))
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.items]);

  const addItem = () => setFormData(prev => ({ ...prev, items: [...(prev.items || []), { item_id: uuid(), value: '', images: [] }] }));

  const removeItem = (index) => {
    const items = [...(formData.items || [])];
    if (items.length <= 1) { showError('At least one item is required'); return; }
    items.splice(index, 1);

    let correct = [...(formData.correctOrderIndexes || [])];
    correct = correct.filter(ci => ci !== index).map(ci => (ci > index ? ci - 1 : ci));

    setFormData(prev => ({ ...prev, items, correctOrderIndexes: correct }));
  };

  const moveItem = (index, dir) => {
    const items = [...(formData.items || [])];
    const n = items.length;
    const j = index + dir;
    if (j < 0 || j >= n) return;
    [items[index], items[j]] = [items[j], items[index]];

    const correct = [...(formData.correctOrderIndexes || [])];
    const updatedCorrect = correct.map(ci => {
      if (ci === index) return j;
      if (ci === j) return index;
      return ci;
    });

    setFormData(prev => ({ ...prev, items, correctOrderIndexes: updatedCorrect }));
  };

  const toggleDropdown = (dropdown) => setDropdownStates(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
  const selectDropdownValue = (dropdown, value) => {
    setFormData(prev => ({ ...prev, [dropdown === 'difficulty' ? 'difficulty' : dropdown]: value, ...(dropdown === 'topic' ? { subtopic: '' } : {}) }));
    setDropdownStates(prev => ({ ...prev, [dropdown]: false }));
  };

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
              <button key={idx} type="button" onClick={() => selectDropdownValue(dropdownKey, option)} className="w-full px-4 py-2 text-left hover:bg-[#4CA466]/10 transition-colors text-gray-800">
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Correct order helpers
  const captureCorrectOrder = () => {
    const items = formData.items || [];
    if (!items || items.length === 0) { showError('Add at least one item before capturing correct order'); return; }
    const idxs = items.map((_, i) => i);
    setFormData(prev => ({ ...prev, correctOrderIndexes: idxs }));
    showSuccess('Correct order captured from current items order');
  };

  const [isEditingCorrectOrder, setIsEditingCorrectOrder] = useState(false);
  const toggleEditCorrectOrder = () => {
    setIsEditingCorrectOrder(e => !e);
    if (!isEditingCorrectOrder) setFormData(prev => ({ ...prev, correctOrderIndexes: [] }));
  };
  const handlePickCorrectIndex = (idx) => {
    let cur = [...(formData.correctOrderIndexes || [])];
    if (cur.includes(idx)) return;
    cur.push(idx);
    setFormData(prev => ({ ...prev, correctOrderIndexes: cur }));
  };
  const clearCorrectOrder = () => setFormData(prev => ({ ...prev, correctOrderIndexes: [] }));

  // Validation
  const validateForm = () => {
    if (!formData.topic) { showError('Topic is required'); return false; }
    if (!formData.subtopic) { showError('Subtopic is required'); return false; }
    if (!formData.title?.trim()) { showError('Title is required'); return false; }
    if (!formData.prompt?.trim()) { showError('Prompt is required'); return false; }
    if (!formData.items || formData.items.length < 1) { showError('At least 1 item is required'); return false; }
    if (formData.items.some(it => !String(it.value || it).trim())) { showError('Items cannot be empty'); return false; }
    const correct = formData.correctOrderIndexes || [];
    if (!correct || correct.length !== formData.items.length) { showError('Correct order must be set and include every item'); return false; }
    if (formData.marks === undefined || formData.marks === null) { showError('Marks is required'); return false; }
    if (Number(formData.marks) < 0) { showError('Marks must be >= 0'); return false; }
    if (Number(formData.negativeMarks) < 0) { showError('Negative marks cannot be negative'); return false; }
    if (!formData.timeLimit || Number(formData.timeLimit) <= 0) { showError('Time limit must be greater than 0'); return false; }
    return true;
  };

  const timeInSeconds = formData.timeUnit === 'minutes' ? Number(formData.timeLimit) * 60 : formData.timeUnit === 'hours' ? Number(formData.timeLimit) * 3600 : Number(formData.timeLimit);

  // FILE UPLOADS
  const handleLocalFileSelect = (file, purpose, itemIndex = null) => {
    try {
      validateFile(file, { maxSize: 10, allowedTypes: ['image/png','image/jpeg','image/webp'] });
    } catch (err) { showError(err.message || 'Invalid file'); return; }

    const localId = uuid();
    setFileUploads(prev => ({ ...prev, [localId]: { file, progress: 0, status: 'queued', purpose, itemIndex } }));

    (async () => {
      try {
        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'uploading' } }));
        const res = await uploadFile(file, (p) => setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), progress: p } })), '/rearrange-images');

        const imageObject = { image_id: uuid(), url: res.url, label: '', alt_text: file.name || '', metadata: { key: res.key, size: file.size, type: file.type } };

        if (purpose === 'question') {
          setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).concat(imageObject) }));
        } else if (purpose === 'explanation') {
          setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).concat(imageObject) }));
        } else if (purpose === 'item' && itemIndex !== null) {
          setFormData(prev => {
            const items = (prev.items || []).map(it => ({ ...it }));
            while (items.length <= itemIndex) items.push({ item_id: uuid(), value: '', images: [] });
            items[itemIndex].images = (items[itemIndex].images || []).concat(imageObject);
            return { ...prev, items };
          });
        }

        // focus new image label
        pendingFocus.current = { image_id: imageObject.image_id };

        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'done', progress: 100, url: res.url } }));
      } catch (err) {
        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'error' } }));
        console.error('Upload failed', err);
        showError('File upload failed');
      }
    })();
  };

  // manage label edits & removals
  const updateImageLabel = (purpose, itemIndex, imgIndex, newLabel) => {
    if (purpose === 'question') {
      setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).map((img,i) => i === imgIndex ? { ...img, label: newLabel } : img) }));
    } else if (purpose === 'explanation') {
      setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).map((img,i) => i === imgIndex ? { ...img, label: newLabel } : img) }));
    } else if (purpose === 'item') {
      setFormData(prev => {
        const items = (prev.items || []).map(it => ({ ...it }));
        items[itemIndex] = { ...items[itemIndex], images: (items[itemIndex].images || []).map((img,i) => i === imgIndex ? { ...img, label: newLabel } : img) };
        return { ...prev, items };
      });
    }
  };

  const removeImage = (purpose, itemIndex, imgIndex) => {
    if (purpose === 'question') setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).filter((_,i) => i !== imgIndex) }));
    else if (purpose === 'explanation') setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).filter((_,i) => i !== imgIndex) }));
    else if (purpose === 'item') setFormData(prev => { const items = (prev.items || []).map(it => ({ ...it })); items[itemIndex].images = (items[itemIndex].images || []).filter((_,i) => i !== imgIndex); return { ...prev, items }; });
  };

  // focus newly added image label
  useEffect(() => {
    if (!pendingFocus.current) return;
    const { image_id } = pendingFocus.current;
    const el = imageInputRefs.current[image_id];
    if (el) {
      try { el.focus(); if (typeof el.select === 'function') el.select(); } catch (err) { /* ignore */ }
    }
    pendingFocus.current = null;
  }, [formData.questionImages, formData.explanationImages, formData.items]);

  const setImageRef = (id) => (el) => {
    if (!id) return; if (el) imageInputRefs.current[id] = el; else delete imageInputRefs.current[id];
  };

  // FileUploader small component
  const FileUploader = ({ purpose, itemIndex = null }) => (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <label htmlFor={`file-upload-${purpose}-${itemIndex ?? 'main'}`} className="cursor-pointer inline-flex items-center px-3 py-2 rounded-lg text-white text-sm font-medium shadow transition focus:outline-none" style={{ backgroundColor: '#4CA466' }}>
          {purpose === 'question' ? 'Question Images' : purpose === 'explanation' ? 'Explanation Images' : 'Item Images'}
        </label>

        <input id={`file-upload-${purpose}-${itemIndex ?? 'main'}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLocalFileSelect(f, purpose, itemIndex); e.target.value = null; }} />
      </div>

      <div className="flex gap-2 mt-2 flex-wrap">
        {purpose === 'question' && (formData.questionImages || []).map((img, i) => (
          <div key={img.image_id} className="flex flex-col items-center w-36">
            <div className="border rounded p-2 flex flex-col items-start w-full">
              <img src={img.url} alt={img.alt_text || img.label} className="w-32 h-20 object-contain rounded" />
              <div className="flex items-center justify-between w-full mt-1">
                <div className="text-xs text-gray-500">{formatFileSize(img.metadata?.size || 0)}</div>
                <button onClick={() => removeImage('question', null, i)} className="text-red-500 text-xs">Remove</button>
              </div>
            </div>
            <input ref={setImageRef(img.image_id)} type="text" value={img.label || ''} onChange={(e) => updateImageLabel('question', null, i, e.target.value)} placeholder="Enter label..." className="text-xs px-2 py-1 border rounded w-full mt-2" />
          </div>
        ))}

        {purpose === 'explanation' && (formData.explanationImages || []).map((img, i) => (
          <div key={img.image_id} className="flex flex-col items-center w-36">
            <div className="border rounded p-2 flex flex-col items-start w-full">
              <img src={img.url} alt={img.alt_text || img.label} className="w-32 h-20 object-contain rounded" />
              <div className="flex items-center justify-between w-full mt-1">
                <div className="text-xs text-gray-500">{formatFileSize(img.metadata?.size || 0)}</div>
                <button onClick={() => removeImage('explanation', null, i)} className="text-red-500 text-xs">Remove</button>
              </div>
            </div>
            <input ref={setImageRef(img.image_id)} type="text" value={img.label || ''} onChange={(e) => updateImageLabel('explanation', null, i, e.target.value)} placeholder="Enter label..." className="text-xs px-2 py-1 border rounded w-full mt-2" />
          </div>
        ))}

        {purpose === 'item' && itemIndex !== null && ((formData.items?.[itemIndex]?.images) || []).map((img, ii) => (
          <div key={img.image_id} className="flex flex-col items-center w-36">
            <div className="border rounded p-2 flex flex-col items-start w-full">
              <img src={img.url} alt={img.alt_text || img.label} className="w-32 h-20 object-contain rounded" />
              <div className="flex items-center justify-between w-full mt-1">
                <div className="text-xs text-gray-500">{formatFileSize(img.metadata?.size || 0)}</div>
                <button onClick={() => removeImage('item', itemIndex, ii)} className="text-red-500 text-xs">Remove</button>
              </div>
            </div>
            <input ref={setImageRef(img.image_id)} type="text" value={img.label || ''} onChange={(e) => updateImageLabel('item', itemIndex, ii, e.target.value)} placeholder="Enter label..." className="text-xs px-2 py-1 border rounded w-full mt-2" />
          </div>
        ))}
      </div>
    </div>
  );

  // Save handler
  const handleSave = async () => {
    if (!validateForm()) return;

    const uploadsInProgress = Object.values(fileUploads).some(f => f.status === 'uploading' || f.status === 'queued');
    if (uploadsInProgress) { showError('Please wait for image uploads to finish'); return; }

    const payload = {
      title: formData.title,
      prompt: formData.prompt,
      question_images: (formData.questionImages || []).map(i => ({ image_id: i.image_id, url: i.url, label: i.label, alt_text: i.alt_text, metadata: i.metadata })),
      items: (formData.items || []).map(it => ({ value: it.value, images: (it.images || []).map(im => ({ image_id: im.image_id, url: im.url, label: im.label, alt_text: im.alt_text, metadata: im.metadata })) })),
      correct_item_indexes: formData.correctOrderIndexes || [],
      is_drag_and_drop: !!formData.isDragAndDrop,
      marks: Number(formData.marks),
      negative_marks: Number(formData.negativeMarks || 0),
      difficulty_level: formData.difficulty,
      explanation: formData.explanation,
      explanation_images: (formData.explanationImages || []).map(i => ({ image_id: i.image_id, url: i.url, label: i.label, alt_text: i.alt_text, metadata: i.metadata })),
      tags: (formData.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      time_limit: timeInSeconds,
      topic: formData.topic,
      subtopic: formData.subtopic
    };
  const unitId = formData.unitID ?? formData.unitId ?? null;
  console.log(unitId)
  const url = unitId
    ? `/course-rearranges/units/${encodeURIComponent(unitId)}/rearrange`
    : '/college-rearranges/';
    console.log(url)

    
    try {
      setLoading(true);
      const res = await privateAxios.post(url, payload);
      setLoading(false);
      if (res.data?.success) { showSuccess(res.data.message || 'Rearrange saved'); console.log('Rearrange saved:', res.data.data); }
      else showError(res.data?.message || 'Save failed');
    } catch (err) {
      setLoading(false);
      console.error('Error saving rearrange:', err);
      showError(err?.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => { if (setSaveRef) setSaveRef(handleSave); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, fileUploads]);

  const getTagsArray = () => (formData.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

  return (
    <div className="relative">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Rearrange Question</h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableDropdown label="Topic" value={formData.topic} options={topics} placeholder="Select topic" dropdownKey="topic" />
            <SearchableDropdown label="Subtopic" value={formData.subtopic} options={formData.topic ? (subtopics[formData.topic] || []) : []} placeholder="Select subtopic" dropdownKey="subtopic" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Enter question title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea value={formData.prompt} onChange={(e) => handleInputChange('prompt', e.target.value)} placeholder="Enter the prompt/instructions for reordering..." rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
            <FileUploader purpose="question" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Items (drag/reorder)</label>
              <div className="flex items-center space-x-3">
                <button type="button" onClick={addItem} className="flex items-center space-x-1 px-3 py-1 bg-[#4CA466] text-white rounded-md hover:bg-[#3d8a54] transition-colors text-sm"><Plus className="w-4 h-4" /><span>Add Item</span></button>
                <button type="button" onClick={captureCorrectOrder} className="px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-50">Capture Correct Order</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isDragAndDrop: !prev.isDragAndDrop }))} className={`px-3 py-1 border rounded-md text-sm ${formData.isDragAndDrop ? 'bg-[#4CA466] text-white' : 'bg-white'}`}>{formData.isDragAndDrop ? 'Drag & Drop' : 'List Mode'}</button>
              </div>
            </div>

            <div className="space-y-3">
              {(formData.items || []).map((item, idx) => (
                <div key={item.item_id} className="flex items-center space-x-3 group">
                  <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => moveItem(idx, -1)} className="p-2 hover:bg-gray-100 rounded" title="Move up"><ArrowUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveItem(idx, +1)} className="p-2 hover:bg-gray-100 rounded" title="Move down"><ArrowDown className="w-4 h-4" /></button>
                  </div>

                  <input type="text" value={item.value} onChange={(e) => { const items = (formData.items || []).map(it => ({ ...it })); items[idx].value = e.target.value; setFormData(prev => ({ ...prev, items })); }} placeholder={`Item ${idx + 1}`} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />

                  <div className="flex items-center space-x-2">
                    <FileUploader purpose="item" itemIndex={idx} />
                    <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Correct Order</div>
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={toggleEditCorrectOrder} className={`px-3 py-1 border rounded-md text-sm ${isEditingCorrectOrder ? 'bg-[#4CA466] text-white' : 'bg-white'}`}>{isEditingCorrectOrder ? 'Finish' : 'Edit'}</button>
                  <button type="button" onClick={clearCorrectOrder} className="px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-50">Clear</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(formData.items || []).map((it, idx) => {
                  const pos = (formData.correctOrderIndexes || []).indexOf(idx);
                  return (
                    <button key={it.item_id} type="button" onClick={() => { if (isEditingCorrectOrder) handlePickCorrectIndex(idx); }} className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${pos === -1 ? 'bg-white text-gray-700' : 'bg-[#4CA466] text-white'}`}>
                      <span className="mr-2 font-semibold">{pos === -1 ? idx + 1 : pos + 1}.</span>
                      <span className="max-w-xs truncate">{it.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
            <textarea value={formData.explanation} onChange={(e) => handleInputChange('explanation', e.target.value)} placeholder="Provide explanation for the correct sequence..." rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
            <FileUploader purpose="explanation" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input type="text" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} placeholder="Enter tags separated by commas (e.g., steps, sorting)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            {getTagsArray().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">{getTagsArray().map((tag, index) => (<span key={index} className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium border border-[#4CA466]/20">{tag}</span>))}</div>
            )}
          </div>

        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={handleSave} className="px-4 py-2 bg-[#4CA466] text-white rounded-md hover:bg-[#3d8a54]">{loading ? <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</div> : 'Save Question'}</button>
        </div>
      </div>

      {loading && (
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

export default AddRearrangeForm;
