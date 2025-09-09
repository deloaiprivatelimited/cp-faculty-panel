import React, { useState } from 'react';
import { Plus, Calendar, Clock, BookOpen } from 'lucide-react';
import TestCard from './TestCard.jsx';
import CreateTestModal from './CreateTestModal.jsx';

const TestDashboard = ({ 
  tests, 
  students, 
  testAssignments, 
  onTestSelect, 
  onTestCreate 
}) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTests = tests.filter(test => test.status === activeTab);

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: Calendar },
    { key: 'ongoing', label: 'Ongoing', icon: Clock },
    { key: 'past', label: 'Past', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} />
              Create Test
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === key
                      ? 'border-[#4CA466] text-[#4CA466]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                  <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs ml-2">
                    {tests.filter(test => test.status === key).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <TestCard
              key={test.id}
              test={test}
              assignedStudentCount={testAssignments[test.id]?.length || 0}
              onClick={() => onTestSelect(test)}
            />
          ))}
          {filteredTests.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <BookOpen size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg mb-2">No {activeTab} tests</p>
              <p className="text-gray-400">
                {activeTab === 'upcoming' ? 'Create a new test to get started' : `No ${activeTab} tests found`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Test Modal */}
      {isCreateModalOpen && (
        <CreateTestModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={onTestCreate}
        />
      )}
    </div>
  );
};

export default TestDashboard;