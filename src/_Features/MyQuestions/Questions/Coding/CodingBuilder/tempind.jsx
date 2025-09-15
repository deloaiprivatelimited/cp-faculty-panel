import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import SolutionEditor from './SolutionEditor.jsx';
import CodingQuestionInfo from './CodingQuestion.jsx';
import TestCaseGroups from './TestCases.jsx';
import { useParams } from 'react-router-dom';
import BoilerplateEditor from './BoilerplateEditor.jsx';

export default function CodeBuilder() {
  const [activeComponent, setActiveComponent] = useState('questions');
  const { questionId } = useParams();

  const renderComponent = () => {
    switch (activeComponent) {
      case 'questions':
        return <CodingQuestionInfo questionId={questionId} />;
      case 'test-cases':
        return <TestCaseGroups questionId={questionId} />;
      case 'boilerplate-editor':
        return <BoilerplateEditor questionId={questionId} />;
      case 'solution-editor':
        return <SolutionEditor questionId={questionId} />;
      default:
        return <CodingQuestionInfo />;
    }
  };

  return (
    // Full screen, no scroll
    <div className="w-screen h-screen flex">
      {/* Sidebar fixed */}
      <aside className="w-16 flex-shrink-0 bg-gray-100">
        <Sidebar
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />
      </aside>

      {/* Main area fills rest, no scroll */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <section className="flex-1 p-6 overflow-hidden">
          {renderComponent()}
        </section>
      </main>
    </div>
  );
}
