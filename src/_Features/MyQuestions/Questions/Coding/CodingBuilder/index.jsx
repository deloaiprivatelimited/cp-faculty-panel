import React, { useState } from 'react';
import Sidebar from './sidebar.jsx';
import { useParams } from 'react-router-dom';
import SolutionEditor from './SolutionEditor.jsx';

import CodingQuestionInfo from './CodingQuestion.jsx';
import TestCaseGroups from './TestCases.jsx';
import BoilerplateEditor from './BoilerplateEditor.jsx';

export default function CodeBuilder() {
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
        return <SolutionEditor />;
    }
  };

 const [activeComponent, setActiveComponent] = useState('questions');
  const { questionId } = useParams();

  return (
    // Full screen, no scroll
    <div className="w-screen h-screen flex bg-red-500">
      <aside className="w-16 flex-shrink-0 bg-gray-100">
        <Sidebar
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />
      </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
        <section className="flex-1  overflow-hidden h-full">
          {renderComponent()}
        </section>
      </main>
    </div>
  );
}
