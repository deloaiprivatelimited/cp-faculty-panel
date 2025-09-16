import React, { useEffect, useMemo, useState, useRef } from "react";
import { ChevronDown, Loader2, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { privateAxios } from "../../../../../utils/axios";
import { showError, showSuccess } from "../../../../../utils/toast";
import { uploadFile, validateFile, formatFileSize } from "../../../../../utils/fileUpload";
// Small UUID helper using browser crypto
const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());

export default function EditRearrangeForm({ formData, setFormData, setSaveRef, setSaving,course =false}) {
  const [dropdownStates, setDropdownStates] = useState({ topic: false, subtopic: false, difficulty: false });
  const [Loading, setLoading] = useState(false);
  const [isEditingCorrectOrder, setIsEditingCorrectOrder] = useState(false);

  // file uploads tracker: { localId: { progress, status, url, purpose, itemIndex } }
  const [fileUploads, setFileUploads] = useState({});

  // focus newly uploaded image label
  const pendingFocus = useRef(null);
  const imageInputRefs = useRef({});

  const topics = [ /* ...same as before... */ 
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

  const toggleDropdown = (k) => setDropdownStates(s => ({ ...s, [k]: !s[k] }));
  const selectDropdownValue = (k, val) => {
    setFormData(prev => ({ ...prev, [k]: val, ...(k === "topic" ? { subtopic: "" } : {}) }));
    setDropdownStates(s => ({ ...s, [k]: false }));
  };

  // ---------------- helpers for items ----------------
  // ensure items have stable item_id and images preserved
  const ensureItemIds = () => {
    if (!formData.items || formData.items.length === 0) {
      setFormData(prev => ({ ...prev, items: [{ item_id: uuid(), value: "", images: [] }] }));
      return;
    }
    const items = formData.items.map(it => ({ item_id: it.item_id || uuid(), value: it.value || "", images: it.images || [] }));
    setFormData(prev => ({ ...prev, items }));
  };

  useEffect(() => { ensureItemIds(); // eslint-disable-next-line
  }, []);

  const addItem = () => setFormData(prev => ({ ...prev, items: [...(prev.items || []), { item_id: uuid(), value: "", images: [] }] }));

  const removeItem = (index) => {
    setFormData(prev => {
      const items = [...(prev.items || [])];
      if (items.length <= 1) return prev; // require at least 1 item
      const removed = items.splice(index, 1)[0];

      // update correctOrderIndexes (indexes) and also correctOrderIds (if stored)
      let correctIdx = [...(prev.correctOrderIndexes || [])];
      correctIdx = correctIdx.filter(ci => ci !== index).map(ci => (ci > index ? ci - 1 : ci));
      // Also if user stores correctOrderIds, remove that id
      const correctIds = (prev.correctOrderIds || []).filter(id => id !== removed.item_id);
      return { ...prev, items, correctOrderIndexes: correctIdx, correctOrderIds: correctIds };
    });
  };

  const moveItem = (index, dir) => {
    // dir -1 up, +1 down
    setFormData(prev => {
      const items = [...(prev.items || [])];
      const n = items.length;
      const j = index + dir;
      if (j < 0 || j >= n) return prev;
      [items[index], items[j]] = [items[j], items[index]];

      // remap correctOrderIndexes (indexes)
      let correctIdx = [...(prev.correctOrderIndexes || [])];
      correctIdx = correctIdx.map(ci => {
        if (ci === index) return j;
        if (ci === j) return index;
        return ci;
      });

      // rebuild correctOrderIds from indexes
      const newCorrectIds = correctIdx.map(ci => items[ci]?.item_id).filter(Boolean);

      return { ...prev, items, correctOrderIndexes: correctIdx, correctOrderIds: newCorrectIds };
    });
  };

  const handleItemChange = (index, value) => setFormData(prev => {
    const items = [...(prev.items || [])];
    items[index] = { ...items[index], value };
    return { ...prev, items };
  });

  // Correct order editing
  const captureCorrectOrder = () => {
    const items = formData.items || [];
    if (!items.length) return showError("Add items before capturing correct order");
    const idxs = items.map((_, i) => i);
    const ids = items.map(it => it.item_id);
    setFormData(prev => ({ ...prev, correctOrderIndexes: idxs, correctOrderIds: ids }));
    showSuccess("Correct order captured from current items order");
  };

  const toggleEditCorrectOrder = () => {
    setIsEditingCorrectOrder(v => {
      if (!v) {
        // starting edit -> reset selected indexes to empty so user can pick
        setFormData(prev => ({ ...prev, correctOrderIndexes: [] }));
      }
      return !v;
    });
  };

  const handlePickCorrectIndex = (idx) => {
    setFormData(prev => {
      const cur = [...(prev.correctOrderIndexes || [])];
      if (cur.includes(idx)) return prev; // ignore duplicates
      cur.push(idx);
      const curIds = cur.map(i => prev.items[i]?.item_id).filter(Boolean);
      return { ...prev, correctOrderIndexes: cur, correctOrderIds: curIds };
    });
  };

  const clearCorrectOrder = () => setFormData(prev => ({ ...prev, correctOrderIndexes: [], correctOrderIds: [] }));

  // ---------------- image helpers ----------------
  // _normalize_image behavior is implemented on server; here we accept string or object but store canonical structure
  const _makeImageObject = (res, file) => ({
    image_id: uuid(),
    url: res.url,
    label: "",
    alt_text: file?.name || "",
    metadata: { key: res.key, size: file?.size, type: file?.type }
  });

  const handleLocalFileSelect = (file, purpose, itemIndex = null) => {
    try {
      validateFile(file, { maxSize: 10, allowedTypes: ['image/png', 'image/jpeg', 'image/webp'] });
    } catch (err) {
      showError(err.message || "Invalid file");
      return;
    }

    const localId = uuid();
    setFileUploads(prev => ({ ...prev, [localId]: { file, progress: 0, status: 'queued', purpose, itemIndex } }));

    (async () => {
      try {
        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'uploading' } }));
        // pass progress callback
        const res = await uploadFile(file, (p) => {
          setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), progress: p } }));
        }, '/rearrange-images');

        const imageObject = _makeImageObject(res, file);

        if (purpose === 'question') {
          setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).concat(imageObject) }));
        } else if (purpose === 'explanation') {
          setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).concat(imageObject) }));
        } else if (purpose === 'item' && itemIndex !== null) {
          setFormData(prev => {
            const items = (prev.items || []).map(it => ({ ...it }));
            while (items.length <= itemIndex) items.push({ item_id: uuid(), value: "", images: [] });
            items[itemIndex].images = (items[itemIndex].images || []).concat(imageObject);
            return { ...prev, items };
          });
        }

        // focus new image label input after next render
        pendingFocus.current = { image_id: imageObject.image_id };

        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'done', progress: 100, url: res.url } }));
      } catch (err) {
        setFileUploads(prev => ({ ...prev, [localId]: { ...(prev[localId] || {}), status: 'error' } }));
        console.error('Upload failed', err);
        showError('File upload failed');
      }
    })();
  };

  const updateImageLabel = (purpose, itemIndex, imgIndex, newLabel) => {
    if (purpose === 'question') {
      setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).map((img, i) => i === imgIndex ? { ...img, label: newLabel } : img) }));
    } else if (purpose === 'explanation') {
      setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).map((img, i) => i === imgIndex ? { ...img, label: newLabel } : img) }));
    } else if (purpose === 'item') {
      setFormData(prev => {
        const items = (prev.items || []).map(it => ({ ...it }));
        items[itemIndex] = { ...items[itemIndex], images: (items[itemIndex].images || []).map((img, i) => i === imgIndex ? { ...img, label: newLabel } : img) };
        return { ...prev, items };
      });
    }
  };

  const removeImage = (purpose, itemIndex, imgIndex) => {
    if (purpose === 'question') setFormData(prev => ({ ...prev, questionImages: (prev.questionImages || []).filter((_, i) => i !== imgIndex) }));
    else if (purpose === 'explanation') setFormData(prev => ({ ...prev, explanationImages: (prev.explanationImages || []).filter((_, i) => i !== imgIndex) }));
    else if (purpose === 'item') setFormData(prev => {
      const items = (prev.items || []).map(it => ({ ...it }));
      items[itemIndex].images = (items[itemIndex].images || []).filter((_, i) => i !== imgIndex);
      return { ...prev, items };
    });
  };

  // focus effect for newly added image label input
  useEffect(() => {
    if (!pendingFocus.current) return;
    const { image_id } = pendingFocus.current;
    const el = imageInputRefs.current[image_id];
    if (el) {
      try { el.focus(); if (typeof el.select === 'function') el.select(); } catch (err) { /* ignore */ }
    }
    pendingFocus.current = null;
  }, [formData.questionImages, formData.explanationImages, formData.items]);

  // stable ref setter (so it's less likely to flash null then node)
  const setImageRef = (id) => (el) => {
    if (!id) return;
    if (el) imageInputRefs.current[id] = el;
    else delete imageInputRefs.current[id];
  };

  // small FileUploader component
  const FileUploader = ({ purpose, itemIndex = null }) => (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <label
          htmlFor={`file-upload-${purpose}-${itemIndex ?? "main"}`}
          className="cursor-pointer inline-flex items-center px-3 py-2 rounded-lg text-white text-sm font-medium shadow transition focus:outline-none"
          style={{ backgroundColor: "#4CA466" }}
        >
          {purpose === "question" ? "Question Images" : purpose === "explanation" ? "Explanation Images" : "Item Images"}
        </label>

        <input
          id={`file-upload-${purpose}-${itemIndex ?? "main"}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleLocalFileSelect(f, purpose, itemIndex);
            e.target.value = null;
          }}
        />
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

  // ---------------- validators -----------------
  const validateForm = () => {
    if (!formData.topic) return showError("Topic is required"), false;
    if (!formData.subtopic) return showError("Subtopic is required"), false;
    if (!formData.title?.trim()) return showError("Title is required"), false;
    if (!formData.prompt?.trim()) return showError("Prompt is required"), false;
    if (!formData.items || formData.items.length < 1) return showError("At least one item is required"), false;
    if (formData.items.some(it => !String(it.value || "").trim())) return showError("Items cannot be empty"), false;
    const correct = formData.correctOrderIndexes || [];
    if (!correct || correct.length !== formData.items.length) return showError("Correct order must include every item"), false;
    if (!formData.marks && formData.marks !== 0) return showError("Marks is required"), false;
    if (Number(formData.marks) < 0) return showError("Marks must be >= 0"), false;
    if (Number(formData.negativeMarks) < 0) return showError("Negative marks cannot be negative"), false;
    if (!formData.timeLimit || Number(formData.timeLimit) <= 0) return showError("Time limit must be > 0"), false;
    return true;
  };

  const timeInSeconds = useMemo(() => {
    const n = Number(formData.timeLimit);
    return formData.timeUnit === "minutes" ? n * 60 : formData.timeUnit === "hours" ? n * 3600 : n;
  }, [formData.timeLimit, formData.timeUnit]);

  // expose save to parent header (PUT to /rearranges/:id)
  useEffect(() => {
    if (!setSaveRef) return;
    setSaveRef(async () => {
      if (!validateForm()) return;
      // Ensure no uploads in progress
      const uploadsInProgress = Object.values(fileUploads).some(f => f.status === 'uploading' || f.status === 'queued');
      if (uploadsInProgress) { showError('Please wait for image uploads to finish'); return; }

      const payload = {
        title: formData.title,
        prompt: formData.prompt,
        // include stable item ids so backend can map — backend accepts items with item_id and images
        items: (formData.items || []).map(it => ({
          item_id: it.item_id,
          value: it.value,
          images: (it.images || []).map(im => ({ image_id: im.image_id, url: im.url, label: im.label, alt_text: im.alt_text, metadata: im.metadata }))
        })),
        // we'll send correct_item_indexes (0-based)
        correct_item_indexes: formData.correctOrderIndexes || [],
        is_drag_and_drop: !!formData.isDragAndDrop,
        marks: Number(formData.marks),
        negative_marks: Number(formData.negativeMarks || 0),
        difficulty_level: formData.difficulty,
        explanation: formData.explanation,
        // include explanation and question images
        question_images: (formData.questionImages || []).map(i => ({ image_id: i.image_id, url: i.url, label: i.label, alt_text: i.alt_text, metadata: i.metadata })),
        explanation_images: (formData.explanationImages || []).map(i => ({ image_id: i.image_id, url: i.url, label: i.label, alt_text: i.alt_text, metadata: i.metadata })),
        tags: (formData.tags || "").split(",").map(t => t.trim()).filter(Boolean),
        time_limit: timeInSeconds,
        topic: formData.topic,
        subtopic: formData.subtopic,
      };
      try {
        setSaving?.(true);
        setLoading(true);
         let url = `/college-rearranges/${formData.id}`
        if(course){
          url = `/course-rearranges/${formData.id}`
        }
        const res = await privateAxios.put(url, payload);
        if (res.data?.success) {
          showSuccess(res.data.message || "Rearrange updated");
        } else {
          showError(res.data?.message || "Failed to update rearrange");
        }
      } catch (e) {
        console.error(e);
        showError("Something went wrong while updating");
      } finally {
        setLoading(false);
        setSaving?.(false);
      }
    });
    // eslint-disable-next-line
  }, [formData, fileUploads]);

  const SearchableDropdown = ({ label, value, options, placeholder, dropdownKey }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <button type="button" onClick={() => toggleDropdown(dropdownKey)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors bg-white text-left flex items-center justify-between">
          <span className={value ? "text-gray-800" : "text-gray-500"}>{value || placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownStates[dropdownKey] ? "rotate-180" : ""}`} />
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

  const getTagsArray = () => (formData.tags || "").split(",").map(t => t.trim()).filter(Boolean);

  return (
    <div className="relative">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Rearrange</h1>

        <div className="space-y-6">
          {/* Topic & Subtopic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableDropdown label="Topic" value={formData.topic} options={topics} placeholder="Select topic" dropdownKey="topic" />
            <SearchableDropdown label="Subtopic" value={formData.subtopic} options={formData.topic ? (subtopics[formData.topic] || []) : []} placeholder="Select subtopic" dropdownKey="subtopic" />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea value={formData.prompt} onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
            <FileUploader purpose="question" />
          </div>

          {/* Items list with reorder controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Items (reorder)</label>
              <div className="flex items-center space-x-3">
                <button type="button" onClick={addItem} className="flex items-center space-x-1 px-3 py-1 bg-[#4CA466] text-white rounded-md hover:bg-[#3d8a54] transition-colors text-sm">
                  <Plus className="w-4 h-4" /><span>Add Item</span>
                </button>
                <button type="button" onClick={captureCorrectOrder} className="px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-50">Capture Correct Order</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isDragAndDrop: !prev.isDragAndDrop }))} className={`px-3 py-1 border rounded-md text-sm ${formData.isDragAndDrop ? "bg-[#4CA466] text-white" : "bg-white"}`}>{formData.isDragAndDrop ? "Drag & Drop" : "List Mode"}</button>
              </div>
            </div>

            <div className="space-y-3">
              {(formData.items || []).map((it, idx) => (
                <div key={it.item_id} className="flex items-center space-x-3 group">
                  <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => moveItem(idx, -1)} className="p-2 hover:bg-gray-100 rounded" title="Move up"><ArrowUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveItem(idx, +1)} className="p-2 hover:bg-gray-100 rounded" title="Move down"><ArrowDown className="w-4 h-4" /></button>
                  </div>

                  <input type="text" value={it.value} onChange={(e) => handleItemChange(idx, e.target.value)} placeholder={`Item ${idx + 1}`} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />

                  <div className="flex items-center space-x-2">
                    <FileUploader purpose="item" itemIndex={idx} />
                    <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Correct order editor */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Correct Order</div>
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={toggleEditCorrectOrder} className={`px-3 py-1 border rounded-md text-sm ${isEditingCorrectOrder ? "bg-[#4CA466] text-white" : "bg-white"}`}>{isEditingCorrectOrder ? "Finish" : "Edit"}</button>
                  <button type="button" onClick={clearCorrectOrder} className="px-3 py-1 border rounded-md text-sm bg-white hover:bg-gray-50">Clear</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(formData.correctOrderIndexes || []).length === 0 && <div className="text-sm text-gray-500">No correct order set. Capture or edit to set one.</div>}

                {(formData.items || []).map((it, idx) => {
                  const pos = (formData.correctOrderIndexes || []).indexOf(idx);
                  return (
                    <button key={it.item_id} type="button" onClick={() => { if (isEditingCorrectOrder) handlePickCorrectIndex(idx); }} className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${pos === -1 ? "bg-white text-gray-700" : "bg-[#4CA466] text-white"}`}>
                      <span className="mr-2 font-semibold">{pos === -1 ? idx + 1 : pos + 1}.</span>
                      <span className="max-w-xs truncate">{it.value || `Item ${idx + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scoring & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
              <input type="number" value={formData.marks} onChange={(e) => setFormData(prev => ({ ...prev, marks: e.target.value }))} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Negative Marks</label>
              <input type="number" value={formData.negativeMarks} onChange={(e) => setFormData(prev => ({ ...prev, negativeMarks: e.target.value }))} min="0" step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            </div>

            <SearchableDropdown label="Difficulty Level" value={formData.difficulty} options={difficulties} placeholder="Select difficulty" dropdownKey="difficulty" />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit</label>
            <div className="flex space-x-3">
              <input type="number" value={formData.timeLimit} onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))} min="1" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
              <select value={formData.timeUnit} onChange={(e) => setFormData(prev => ({ ...prev, timeUnit: e.target.value }))} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
            <textarea value={formData.explanation} onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors resize-none" />
            <FileUploader purpose="explanation" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input type="text" value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="comma,separated,tags" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-colors" />
            {getTagsArray().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {getTagsArray().map((tag, i) => (<span key={i} className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium border border-[#4CA466]/20">{tag}</span>))}
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
