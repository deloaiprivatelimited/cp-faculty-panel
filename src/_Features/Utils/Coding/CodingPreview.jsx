// CodingPreview.jsx
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Code, Clock, Trophy, Copy } from 'lucide-react';
import MarkdownRenderer from '../../../utils/MarkDownRender';

const CodingPreview = ({ coding, isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [activeTab, setActiveTab] = useState('description');
  const backdropRef = useRef(null);

  // Reset local state when a new coding is opened
  useEffect(() => {
    if (coding) {
      setSelectedLanguage(
        coding.allowed_languages && coding.allowed_languages.length > 0
          ? coding.allowed_languages[0]
          : 'python'
      );
      setActiveTab('description');
    }
  }, [coding]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !coding) return null;

  const getDifficultyColor = (level) => {
    if (!level) return 'bg-gray-100 text-gray-600';
    switch (level.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  };

  const formatMemory = (kb) => {
    if (typeof kb !== 'number') return '';
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)}MB`;
    return `${kb}KB`;
  };

  const boilerplateFor = (lang) =>
    (coding.predefined_boilerplates && coding.predefined_boilerplates[lang]) ? coding.predefined_boilerplates[lang] : '';
  const solutionFor = (lang) =>
    (coding.solution_code && coding.solution_code[lang]) ? coding.solution_code[lang] : '';

  // Backdrop click: close only if clicking the backdrop (not the modal)
  const onBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };
console.log('coding')
console.log(coding)
  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Code size={24} className="text-[#4CA466]" />
              {coding.title || 'Untitled'}
            </h2>
            <p className="text-gray-600">{coding.topic || ''} {coding.subtopic ? `• ${coding.subtopic}` : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(coding.difficulty)}`}>
                {coding.difficulty || 'unknown'}
              </span>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Trophy size={16} />
                <span>{coding.points ?? '-' } points</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock size={16} />
                <span>Time: {coding.time_limit_ms ?? '-'}ms</span>
              </div>

              <div className="text-sm text-gray-600">
                Memory: {formatMemory(coding.memory_limit_kb)}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 text-lg">{coding.short_description || ''}</p>
            </div>

            <div className="mb-6">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'description' ? 'border-[#4CA466] text-[#4CA466]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Problem Description
                </button>
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'examples' ? 'border-[#4CA466] text-[#4CA466]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Examples
                </button>
                <button
                  onClick={() => setActiveTab('boilerplate')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'boilerplate' ? 'border-[#4CA466] text-[#4CA466]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Code Template
                </button>
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'solution' ? 'border-[#4CA466] text-[#4CA466]' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Solution
                </button>
              </div>

              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <MarkdownRenderer text={coding.long_description_markdown || ''} />
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-6">
                  {coding.sample_io && coding.sample_io.length > 0 ? (
                    coding.sample_io.map((example, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Example {index + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-2">Input:</h5>
                            <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                              {example.input_text}
                            </pre>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-2">Output:</h5>
                            <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                              {example.output}
                            </pre>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Explanation:</h5>
                          <p className="text-gray-700 text-sm">{example.explanation}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded border border-gray-200 bg-gray-50 text-gray-600">
                      No examples available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'boilerplate' && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">Language:</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
                    >
                      {(coding.allowed_languages || []).map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(boilerplateFor(selectedLanguage))}
                      className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors z-10"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{boilerplateFor(selectedLanguage) || '// No boilerplate available for this language'}</code>
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'solution' && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium text-gray-700">Language:</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
                    >
                      {(coding.allowed_languages || []).map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(solutionFor(selectedLanguage))}
                      className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors z-10"
                      title="Copy solution"
                    >
                      <Copy size={16} />
                    </button>

                    {solutionFor(selectedLanguage) ? (
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{solutionFor(selectedLanguage)}</code>
                      </pre>
                    ) : (
                      <div className="p-4 rounded border border-gray-200 bg-gray-50 text-gray-600">
                        No solution snippet available for <strong>{selectedLanguage}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {coding.tags && coding.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {coding.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CodingPreview.propTypes = {
  coding: PropTypes.shape({
    title: PropTypes.string,
    topic: PropTypes.string,
    subtopic: PropTypes.string,
    difficulty: PropTypes.string,
    points: PropTypes.number,
    time_limit_ms: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    memory_limit_kb: PropTypes.number,
    short_description: PropTypes.string,
    long_description_markdown: PropTypes.string,
    sample_io: PropTypes.arrayOf(PropTypes.shape({
      input_text: PropTypes.string,
      output: PropTypes.string,
      explanation: PropTypes.string,
    })),
    allowed_languages: PropTypes.arrayOf(PropTypes.string),
    predefined_boilerplates: PropTypes.object,
    solution_code: PropTypes.object,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

CodingPreview.defaultProps = {
  coding: null,
  isOpen: false,
};

export default CodingPreview;
