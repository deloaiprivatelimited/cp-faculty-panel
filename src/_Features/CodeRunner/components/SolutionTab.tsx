import React, { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import type { Question } from '../types';

interface SolutionTabProps {
  question: Question;
}

const languageMap: Record<string, string> = {
  python: 'python',
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript',
  c: 'c'
};

export default function SolutionTab({ question }: SolutionTabProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(
    question.allowed_languages[0] || 'python'
  );
  const [showSolution, setShowSolution] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!question.solution_code) {
    return (
      <div className="p-6 text-center" style={{ backgroundColor: '#1f1f1f' }}>
        <p className="text-gray-400">No solution available for this problem.</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-gray-100" style={{ backgroundColor: '#1f1f1f' }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Solution</h3>
        <p className="text-sm text-gray-400 mb-4">
          Review the solution code to understand the approach and implementation.
        </p>
        
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              showSolution
                ? 'bg-[#4CA466] text-white hover:bg-[#3d8f56]'
                : 'text-gray-300 hover:text-gray-100'
            }`}
            style={{ 
              backgroundColor: showSolution ? '#4CA466' : '#2f2f2f'
            }}
          >
            {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
        </div>
      </div>

      {showSolution && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          {/* Language Selector */}
          <div className="flex items-center gap-4 mb-8 p-4 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent hover:border-gray-500 transition-colors"
              style={{ backgroundColor: '#1f1f1f' }}
            >
              {question.allowed_languages
                .filter(lang => question.solution_code?.[lang])
                .map((lang) => (
                  <option key={lang} value={lang} style={{ backgroundColor: '#1f1f1f' }}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          {/* Solution Code */}
          {question.solution_code[selectedLanguage] && (
            <div className="border border-gray-600 rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-600" style={{ backgroundColor: '#2a2a2a' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#4CA466] rounded-full"></div>
                  <span className="text-base font-semibold text-white">
                    Solution Code - {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(question.solution_code![selectedLanguage])}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-[#4CA466] hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title="Copy solution code"
                >
                  <Copy className="w-4 h-4" />
                  <span className="font-medium">Copy</span>
                </button>
              </div>
              <div className="relative">
                <pre 
                  className="p-6 text-gray-200 text-sm font-mono overflow-x-auto max-h-96 leading-relaxed" 
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <code className="language-{selectedLanguage}">{question.solution_code[selectedLanguage]}</code>
                </pre>
                {/* Code language indicator */}
                <div className="absolute top-4 right-4 px-2 py-1 text-xs font-mono text-gray-400 rounded" style={{ backgroundColor: '#2a2a2a' }}>
                  {selectedLanguage}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}