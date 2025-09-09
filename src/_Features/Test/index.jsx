import React, { useState } from 'react';
// import TestDashboard from './components/TestDashboard.js';
// import TestDetail from './TestDetail.js';
import TestDashboard from './TestDashboard';
import TestDetail from './TestDetail';
function Test() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState([
    {
      id: '1',
      name: 'Mathematics Midterm',
      description: 'Comprehensive math test covering algebra and geometry',
      notes: 'Calculator allowed for sections 2-3',
      startDateTime: '2024-01-20T10:00',
      endDateTime: '2024-01-20T12:00',
      status: 'upcoming',
      sections: [
        {
          id: '1',
          name: 'Algebra',
          instructions: 'Solve all algebraic equations',
          duration: 45,
          isTimeConstrained: true,
          questions: []
        }
      ]
    },
    {
      id: '2',
      name: 'History Quiz',
      description: 'World War II events and consequences',
      notes: 'Open book test',
      startDateTime: '2024-01-15T09:00',
      endDateTime: '2024-01-15T10:30',
      status: 'past',
      sections: []
    },
    {
      id: '3',
      name: 'Science Lab Report',
      description: 'Submit your chemistry lab findings',
      notes: 'Include all calculations and observations',
      startDateTime: '2024-01-18T14:00',
      endDateTime: '2024-01-18T16:00',
      status: 'ongoing',
      sections: []
    }
  ]);
  
  // My Library Questions (user's previously created questions)
  const [myLibraryQuestions] = useState([
    {
      id: 'my-1',
      content: 'What is the derivative of x²?',
      type: 'multiple-choice',
      options: ['2x', 'x', '2', 'x²'],
      correctAnswer: 0,
      subject: 'Mathematics',
      difficulty: 'easy',
      tags: ['calculus', 'derivatives']
    },
    {
      id: 'my-2',
      content: 'Explain the process of photosynthesis in plants.',
      type: 'essay',
      subject: 'Biology',
      difficulty: 'medium',
      tags: ['photosynthesis', 'plants', 'biology']
    },
    {
      id: 'my-3',
      content: 'What year did World War II end?',
      type: 'short-answer',
      correctAnswer: '1945',
      subject: 'History',
      difficulty: 'easy',
      tags: ['world war', 'history', 'dates']
    },
    {
      id: 'my-4',
      content: 'Solve for x: 2x + 5 = 13',
      type: 'short-answer',
      correctAnswer: '4',
      subject: 'Mathematics',
      difficulty: 'easy',
      tags: ['algebra', 'equations']
    },
    {
      id: 'my-5',
      content: 'Which of the following is NOT a programming paradigm?',
      type: 'multiple-choice',
      options: ['Object-Oriented', 'Functional', 'Procedural', 'Alphabetical'],
      correctAnswer: 3,
      subject: 'Computer Science',
      difficulty: 'medium',
      tags: ['programming', 'paradigms']
    }
  ]);

  // Global Library Questions (shared question bank)
  const [globalLibraryQuestions] = useState([
    {
      id: 'global-1',
      content: 'What is the capital of France?',
      type: 'multiple-choice',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      subject: 'Geography',
      difficulty: 'easy',
      tags: ['geography', 'capitals', 'europe']
    },
    {
      id: 'global-2',
      content: 'Describe the main causes of the American Civil War.',
      type: 'essay',
      subject: 'History',
      difficulty: 'hard',
      tags: ['american history', 'civil war', 'causes']
    },
    {
      id: 'global-3',
      content: 'What is the chemical symbol for gold?',
      type: 'short-answer',
      correctAnswer: 'Au',
      subject: 'Chemistry',
      difficulty: 'medium',
      tags: ['chemistry', 'elements', 'symbols']
    },
    {
      id: 'global-4',
      content: 'Which planet is known as the Red Planet?',
      type: 'multiple-choice',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      subject: 'Astronomy',
      difficulty: 'easy',
      tags: ['astronomy', 'planets', 'solar system']
    },
    {
      id: 'global-5',
      content: 'What is the speed of light in a vacuum?',
      type: 'short-answer',
      correctAnswer: '299,792,458 m/s',
      subject: 'Physics',
      difficulty: 'medium',
      tags: ['physics', 'light', 'constants']
    },
    {
      id: 'global-6',
      content: 'Explain the concept of supply and demand in economics.',
      type: 'essay',
      subject: 'Economics',
      difficulty: 'medium',
      tags: ['economics', 'supply', 'demand', 'market']
    },
    {
      id: 'global-7',
      content: 'What is the largest mammal in the world?',
      type: 'multiple-choice',
      options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
      correctAnswer: 1,
      subject: 'Biology',
      difficulty: 'easy',
      tags: ['biology', 'mammals', 'animals']
    },
    {
      id: 'global-8',
      content: 'Calculate the area of a circle with radius 5 units.',
      type: 'short-answer',
      correctAnswer: '25π or 78.54',
      subject: 'Mathematics',
      difficulty: 'medium',
      tags: ['geometry', 'area', 'circle']
    }
  ]);

  const [students] = useState([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@school.edu',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob.smith@school.edu',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol.davis@school.edu',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@school.edu',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '5',
      name: 'Emma Brown',
      email: 'emma.brown@school.edu',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '6',
      name: 'Frank Miller',
      email: 'frank.miller@school.edu',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '7',
      name: 'Grace Lee',
      email: 'grace.lee@school.edu',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '8',
      name: 'Henry Taylor',
      email: 'henry.taylor@school.edu',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ]);

  const [testAssignments, setTestAssignments] = useState({
    '1': ['1', '3', '5'], // Mathematics Midterm assigned to Alice, Carol, Emma
    '2': ['2', '4', '6'], // History Quiz assigned to Bob, David, Frank
    '3': ['1', '2', '7', '8'] // Science Lab Report assigned to Alice, Bob, Grace, Henry
  });

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setCurrentView('test-detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTest(null);
  };

  const handleTestCreate = (newTest) => {
    const test = {
      ...newTest,
      id: Date.now().toString(),
      sections: []
    };
    setTests(prev => [...prev, test]);
  };

  const handleTestUpdate = (updatedTest) => {
    setTests(prev => prev.map(test => test.id === updatedTest.id ? updatedTest : test));
    setSelectedTest(updatedTest);
  };

  const handleStudentAssignment = (testId, studentIds) => {
    setTestAssignments(prev => ({
      ...prev,
      [testId]: studentIds
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' ? (
        <TestDashboard 
          tests={tests}
          students={students}
          testAssignments={testAssignments}
          onTestSelect={handleTestSelect}
          onTestCreate={handleTestCreate}
        />
      ) : selectedTest ? (
        <TestDetail 
          test={selectedTest}
          students={students}
          myLibraryQuestions={myLibraryQuestions}
          globalLibraryQuestions={globalLibraryQuestions}
          assignedStudents={testAssignments[selectedTest.id] || []}
          onBack={handleBackToDashboard}
          onTestUpdate={handleTestUpdate}
          onStudentAssignment={(studentIds) => handleStudentAssignment(selectedTest.id, studentIds)}
        />
      ) : null}
    </div>
  );
}

export default Test;