import React, { useState } from 'react';
import { X, Edit, Library, Globe, Search, Filter, BookOpen, Award } from 'lucide-react';

const AddQuestionModal = ({ 
  myLibraryQuestions, 
  globalLibraryQuestions, 
  onClose, 
  onAdd 
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formData, setFormData] = useState({
    content: '',
    type: 'multiple-choice'
  });

  const getCurrentQuestions = () => {
    return selectedOption === 'my-library' ? myLibraryQuestions : globalLibraryQuestions;
  };

  const getFilteredQuestions = () => {
    const questions = getCurrentQuestions();
    return questions.filter(question => {
      const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  };

  const getUniqueSubjects = () => {
    const questions = getCurrentQuestions();
    const subjects = questions.map(q => q.subject).filter(Boolean);
    return [...new Set(subjects)].sort();
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleAddSelectedQuestions = () => {
    const questions = getCurrentQuestions();
    selectedQuestions.forEach(questionId => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const { id, ...questionWithoutId } = question;
        onAdd(questionWithoutId);
      }
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    onAdd(formData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'multiple-choice': return '📝';
      case 'short-answer': return '✏️';
      case 'essay': return '📄';
      default: return '❓';
    }
  };

  const options = [
    {
      key: 'scratch',
      title: 'Create from Scratch',
      description: 'Write a new question from scratch',
      icon: Edit
    },
    {
      key: 'my-library',
      title: 'Select from My Library',
      description: 'Choose from your previously created questions',
      icon: Library
    },
    {
      key: 'global-library',
      title: 'Select from Global Library',
      description: 'Browse questions from the global question bank',
      icon: Globe
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Question</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!selectedOption ? (
            <div className="space-y-3">
              <p className="text-gray-600 mb-6">How would you like to add a question?</p>
              {options.map(({ key, title, description, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedOption(key)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#4CA466] hover:bg-[#4CA466]/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 group-hover:bg-[#4CA466] group-hover:text-white rounded-lg transition-colors">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-[#4CA466] transition-colors">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : selectedOption === 'scratch' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent resize-none"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOption(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] transition-colors"
                >
                  Add Question
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedOption === 'my-library' ? (
                    <>
                      <Library className="text-[#4CA466]" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">My Question Library</h3>
                        <p className="text-sm text-gray-600">Select from your previously created questions</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Globe className="text-[#4CA466]" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Global Question Library</h3>
                        <p className="text-sm text-gray-600">Browse questions from the global question bank</p>
                      </div>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {getCurrentQuestions().length} questions available
                </span>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions by content or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    >
                      <option value="all">All Subjects</option>
                      {getUniqueSubjects().map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Question List */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {getFilteredQuestions().map(question => (
                    <div
                      key={question.id}
                      onClick={() => handleQuestionSelect(question.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-[#4CA466] ${
                        selectedQuestions.includes(question.id)
                          ? 'border-[#4CA466] bg-[#4CA466]/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(question.type)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {question.type.replace('-', ' ').toUpperCase()}
                            </span>
                            {question.subject && (
                              <span className="text-xs text-[#4CA466] bg-[#4CA466]/10 px-2 py-1 rounded-full">
                                {question.subject}
                              </span>
                            )}
                            {question.difficulty && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedQuestions.includes(question.id)
                            ? 'border-[#4CA466] bg-[#4CA466]'
                            : 'border-gray-300'
                        }`}>
                          {selectedQuestions.includes(question.id) && (
                            <X size={12} className="text-white rotate-45" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-800 mb-3">{question.content}</p>
                      
                      {question.options && (
                        <div className="space-y-1 mb-3">
                          {question.options.map((option, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map(tag => (
                            <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getFilteredQuestions().length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-gray-500">No questions found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedQuestions.length > 0 && (
                    <span>
                      {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAddSelectedQuestions}
                    disabled={selectedQuestions.length === 0}
                    className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <BookOpen size={16} />
                    Add Selected Questions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;