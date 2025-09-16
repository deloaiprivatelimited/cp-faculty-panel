import React, { useState, useEffect, useCallback } from 'react';
import { Save, Check, AlertCircle, Code, RefreshCw } from 'lucide-react';
// import { getPredefinedBoilerplates, upsertSolutionCode } from '../services/codingQuestions';
import { getSolutionCode,upsertSolutionCode } from '../services/codingQuestions';
function SolutionEditor({ questionId }) {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [boilerplates, setBoilerplates] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error', 'idle'
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingLanguage, setSavingLanguage] = useState(null); // language currently being saved
  const [fetchError, setFetchError] = useState(null);
    const languages = [
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' },
    { value: 'c', label: 'C', extension: '.c' }
  ];

  const [perLangStatus, setPerLangStatus] = useState(() => {
    const init = {};
    languages.forEach(l => { init[l.value] = { saved: false, saving: false, error: null }; });
    return init;
  });
   const setLangStatus = (lang, patch) => {
    setPerLangStatus(prev => ({ ...prev, [lang]: { ...prev[lang], ...patch } }));
  };
  const getLangStatusIcon = (lang) => {
    const s = perLangStatus[lang] || {};
    if (s.saving) return <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />;
    if (s.error) return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (s.saved) return <Check className="w-3 h-3 text-green-500" />;
    // unsaved / edited locally
    return <Save className="w-3 h-3 text-gray-400" />;
  };

  const defaultBoilerplates = {
    python: `def solution():
    """
    Write your solution here
    """
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`,
    javascript: `function solution() {
    /**
     * Write your solution here
     */
    return null;
}

// Test your solution
console.log(solution());`,
    java: `public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        // Test your solution
        System.out.println(sol.solve());
    }
    
    public Object solve() {
        // Write your solution here
        return null;
    }
}`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    // Write your solution here
    void solve() {
        
    }
};

int main() {
    Solution sol;
    sol.solve();
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

// Write your solution here
void solution() {
    
}

int main() {
    solution();
    return 0;
}`
  };

  // Helper: Get language label
  const getLanguageLabel = (languageValue) => {
    const lang = languages.find(l => l.value === languageValue);
    return lang ? lang.label : languageValue;
  };

  // Helper: line numbers
  const getLineNumbers = (code) => {
    const lines = code.split('\n');
    return Array.from({ length: lines.length }, (_, i) => i + 1);
  };

  // Save status icon
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Save className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return 'Not saved';
    }
  };

  // Load boilerplates from backend and merge with defaults
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const resp = await getSolutionCode(questionId);
        // backend returns { id, predefined_boilerplates: { lang: code } }
        const remote = (resp && resp.solution_code) || {};
        // merge: remote overwrites defaults where present
        const merged = {  ...remote };
            
        if (mounted) {
                const newStatus = { ...perLangStatus };
languages.forEach(l => {
          newStatus[l.value] = {
            saved: !!remote[l.value], // true if backend provided it
            saving: false,
            error: null
          };
        });
        setPerLangStatus(newStatus);
          setBoilerplates(merged);
          setSaveStatus('saved');
          setLastSaved(null);
        }
      } catch (err) {
        console.error('Failed to fetch boilerplates', err);
        if (mounted) {
          // still seed defaults so editor is usable offline
          setBoilerplates({ ...defaultBoilerplates });
          setFetchError(err.message || 'Failed to fetch boilerplates');
          setSaveStatus('idle');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (questionId) fetch();

    return () => { mounted = false; };
  }, [questionId]);

  // Update boilerplate in local state (NOT saving)
  const updateBoilerplate = (language, code) => {
    setBoilerplates(prev => ({
      ...prev,
      [language]: code
    }));
    setLangStatus(language, { saved: false, error: null });
    setSaveStatus('idle');
  };

  // Reset selected language to default in local state (does not call backend)
  const resetToDefault = () => {
    const defaultCode = defaultBoilerplates[selectedLanguage] || '';
    updateBoilerplate(selectedLanguage, defaultCode);
  };

  // Save current language to backend
  const saveCurrentLanguage = useCallback(async () => {
    const lang = selectedLanguage;
    const code = boilerplates[lang] ?? '';
    if (!lang) return;
    setSaveStatus('saving');
    setSavingLanguage(lang);
        setLangStatus(lang, { saving: true, error: null });

    try {
      // call service (single-language payload)
      await upsertSolutionCode(questionId, { language: lang, code });
      setSaveStatus('saved');
      setLastSaved(new Date());
      setSavingLanguage(null);
            setLangStatus(lang, { saved: true, saving: false, error: null });

    } catch (err) {
      console.error('Save failed', err);
      setSaveStatus('error');
      setSavingLanguage(null);
            setLangStatus(lang, { saving: false, error: err.message || 'Save failed' });

    }
  }, [questionId, selectedLanguage, boilerplates]);

  // Optional: Save ALL languages to backend (merges with remote)
  const saveAllLanguages = useCallback(async () => {
    setSaveStatus('saving');
        languages.forEach(l => setLangStatus(l.value, { saving: true, error: null }));

    try {
      await upsertSolutionCode(questionId, { solution_code: boilerplates });
      setSaveStatus('saved');
      setLastSaved(new Date());
            languages.forEach(l => setLangStatus(l.value, { saved: true, saving: false, error: null }));

    } catch (err) {
      console.error('Save all failed', err);
      setSaveStatus('error');
            languages.forEach(l => setLangStatus(l.value, { saving: false, error: err.message || 'Save failed' }));

    }
  }, [questionId, boilerplates]);

  const currentCode = boilerplates[selectedLanguage] || '';
  const currentLanguage = languages.find(l => l.value === selectedLanguage);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-6 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solution Editor</h1>
            <p className="text-gray-600 mt-1">Create and manage code templates for different programming languages</p>
            {fetchError && (
              <p className="text-sm text-red-600 mt-2">Warning: Failed to load remote boilerplates — using defaults. ({fetchError})</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getSaveStatusIcon()}
              <span>{getSaveStatusText()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveCurrentLanguage}
                disabled={saveStatus === 'saving' && savingLanguage === selectedLanguage}
                className="px-3 py-2 flex items-center gap-2 bg-[#4CA466] hover:bg-[#3b8a52] text-white rounded-md shadow-sm disabled:opacity-60 transition"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>

              <button
                onClick={saveAllLanguages}
                disabled={saveStatus === 'saving'}
                className="px-3 py-2 flex items-center gap-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition"
                title="Save all languages at once"
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
          {/* Editor Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Code Template Editor
              </h3>
              <button
                onClick={resetToDefault}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset to Default
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programming Language
                </label>
                <div className="flex gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => setSelectedLanguage(lang.value)}
                      className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 border ${
                        selectedLanguage === lang.value ? 'bg-[#4CA466] text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {/* small status icon */}
                      <span className="flex items-center">{getLangStatusIcon(lang.value)}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
          
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>File extension:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {currentLanguage?.extension}
                </code>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex flex-col" style={{ height: '500px' }}>
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">
                {getLanguageLabel(selectedLanguage)} Template
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Lines: {getLineNumbers(currentCode).length}
                </span>
                <span className="text-xs text-gray-500">
                  {currentLanguage?.extension}
                </span>
              </div>
            </div>
            
            <div className="flex" style={{ height: 'calc(100% - 40px)' }}>
              {/* Line Numbers */}
              <div 
                className="bg-gray-50 px-2 py-3 border-r border-gray-200 select-none flex-shrink-0" 
                style={{ width: '60px', overflowY: 'auto' }}
              >
                {getLineNumbers(currentCode).map(lineNum => (
                  <div key={lineNum} className="text-xs text-gray-400 leading-6 text-right pr-2">
                    {lineNum}
                  </div>
                ))}
              </div>
              
              {/* Code Area */}
              <div style={{ flex: 1 }}>
                <textarea
                  value={currentCode}
                  onChange={(e) => updateBoilerplate(selectedLanguage, e.target.value)}
                  className="p-3 font-mono text-sm leading-6 resize-none outline-none border-none bg-white"
                  style={{ width: '100%', height: '100%', overflow: 'auto' }}
                  placeholder={`Write your ${getLanguageLabel(selectedLanguage)} boilerplate code here...`}
                  spellCheck="false"
                />
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>Auto-save: Disabled</span>
                <span>•</span>
                <span>Language: {getLanguageLabel(selectedLanguage)}</span>
                {loading && <span>• Loading...</span>}
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusIcon()}
                <span>{getSaveStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolutionEditor;
