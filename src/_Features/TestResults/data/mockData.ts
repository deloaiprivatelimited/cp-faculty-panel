// Mock data matching the API response structure
export interface Student {
  id: string;
  name: string;
  email: string;
}

export interface TestResult {
  id: string;
  student_id: string;
  test_id: string;
  total_marks: number;
  submitted: boolean;
  submitted_at: string | null;
  last_autosave: string | null;
}

export interface TestMeta {
  id: string;
  title: string;
  description: string;
  duration: number;
  total_marks: number;
}

export interface MCQSnapshot {
  question_id: string;
  title: string;
  question_text: string;
  options: string[];
  is_multiple: boolean;
  marks: number;
  negative_marks: number;
  correct_options: number[];
  explanation: string;
}

export interface RearrangeSnapshot {
  question_id: string;
  title: string;
  prompt: string;
  items: string[];
  is_drag_and_drop: boolean;
  marks: number;
  negative_marks: number;
  correct_order: number[];
  explanation: string;
}

export interface CodingSnapshot {
  question_id: string;
  title: string;
  short_description: string;
  long_description_markdown: string;
  sample_io: { input: string; output: string }[];
  allowed_languages: string[];
  predefined_boilerplates: Record<string, string>;
  run_code_enabled: boolean;
  submission_enabled: boolean;
  marks: number;
  negative_marks: number;
}

export interface StudentAnswer {
  question_id: string;
  question_type: 'mcq' | 'rearrange' | 'coding';
  value: any;
  marks_obtained: number | null;
  snapshot_mcq?: MCQSnapshot;
  snapshot_rearrange?: RearrangeSnapshot;
  snapshot_coding?: CodingSnapshot;
}

export interface SectionAnswers {
  section_id: string;
  section_name: string;
  section_duration: number;
  answers: StudentAnswer[];
}

export interface DetailedResult extends TestResult {
  test: TestMeta;
  timed_section_answers: SectionAnswers[];
  open_section_answers: SectionAnswers[];
}

// Mock students
export const mockStudents: Student[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice.johnson@email.com' },
  { id: '2', name: 'Bob Smith', email: 'bob.smith@email.com' },
  { id: '3', name: 'Charlie Brown', email: 'charlie.brown@email.com' },
  { id: '4', name: 'Diana Wilson', email: 'diana.wilson@email.com' },
  { id: '5', name: 'Eva Davis', email: 'eva.davis@email.com' },
  { id: '6', name: 'Frank Miller', email: 'frank.miller@email.com' },
];

// Mock test metadata
export const mockTest: TestMeta = {
  id: 'test-123',
  title: 'Advanced Programming Assessment',
  description: 'Comprehensive test covering algorithms, data structures, and problem-solving',
  duration: 120,
  total_marks: 100,
};

// Mock test results
export const mockTestResults: TestResult[] = [
  {
    id: 'result-1',
    student_id: '1',
    test_id: 'test-123',
    total_marks: 87.5,
    submitted: true,
    submitted_at: '2024-01-15T14:30:00Z',
    last_autosave: '2024-01-15T14:29:45Z',
  },
  {
    id: 'result-2',
    student_id: '2',
    test_id: 'test-123',
    total_marks: 72.0,
    submitted: true,
    submitted_at: '2024-01-15T14:25:00Z',
    last_autosave: '2024-01-15T14:24:30Z',
  },
  {
    id: 'result-3',
    student_id: '3',
    test_id: 'test-123',
    total_marks: 94.5,
    submitted: true,
    submitted_at: '2024-01-15T14:20:00Z',
    last_autosave: '2024-01-15T14:19:55Z',
  },
  {
    id: 'result-4',
    student_id: '4',
    test_id: 'test-123',
    total_marks: 0,
    submitted: false,
    submitted_at: null,
    last_autosave: '2024-01-15T13:45:00Z',
  },
  {
    id: 'result-5',
    student_id: '5',
    test_id: 'test-123',
    total_marks: 81.0,
    submitted: true,
    submitted_at: '2024-01-15T14:35:00Z',
    last_autosave: '2024-01-15T14:34:45Z',
  },
  {
    id: 'result-6',
    student_id: '6',
    test_id: 'test-123',
    total_marks: 65.5,
    submitted: true,
    submitted_at: '2024-01-15T14:15:00Z',
    last_autosave: '2024-01-15T14:14:30Z',
  },
];

// Mock detailed results with section-wise answers
export const mockDetailedResults: Record<string, DetailedResult> = {
  '1': {
    ...mockTestResults[0],
    test: mockTest,
    timed_section_answers: [
      {
        section_id: 'section-1',
        section_name: 'Multiple Choice Questions',
        section_duration: 45,
        answers: [
          {
            question_id: 'mcq-1',
            question_type: 'mcq',
            value: [0, 2],
            marks_obtained: 5,
            snapshot_mcq: {
              question_id: 'mcq-1',
              title: 'Time Complexity',
              question_text: 'What is the time complexity of binary search?',
              options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
              is_multiple: false,
              marks: 5,
              negative_marks: 1,
              correct_options: [0],
              explanation: 'Binary search divides the search space in half with each iteration.',
            },
          },
          {
            question_id: 'mcq-2',
            question_type: 'mcq',
            value: [1, 3],
            marks_obtained: 3,
            snapshot_mcq: {
              question_id: 'mcq-2',
              title: 'Data Structures',
              question_text: 'Which data structures follow LIFO principle?',
              options: ['Queue', 'Stack', 'Array', 'Both Stack and function call stack'],
              is_multiple: true,
              marks: 5,
              negative_marks: 1,
              correct_options: [1, 3],
              explanation: 'Stack and function call stack both follow Last-In-First-Out principle.',
            },
          },
        ],
      },
      {
        section_id: 'section-2',
        section_name: 'Rearrange Questions',
        section_duration: 30,
        answers: [
          {
            question_id: 'rearrange-1',
            question_type: 'rearrange',
            value: [2, 0, 1, 3],
            marks_obtained: 7,
            snapshot_rearrange: {
              question_id: 'rearrange-1',
              title: 'Algorithm Steps',
              prompt: 'Arrange the steps of merge sort in correct order',
              items: ['Divide array', 'Conquer subarrays', 'Merge sorted arrays', 'Base case check'],
              is_drag_and_drop: true,
              marks: 8,
              negative_marks: 2,
              correct_order: [3, 0, 1, 2],
              explanation: 'Merge sort follows: check base case, divide, conquer recursively, then merge.',
            },
          },
        ],
      },
    ],
    open_section_answers: [
      {
        section_id: 'section-3',
        section_name: 'Coding Problems',
        section_duration: 45,
        answers: [
          {
            question_id: 'coding-1',
            question_type: 'coding',
            value: {
              language: 'python',
              code: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
            },
            marks_obtained: 15,
            snapshot_coding: {
              question_id: 'coding-1',
              title: 'Fibonacci Sequence',
              short_description: 'Implement fibonacci number calculation',
              long_description_markdown: '# Fibonacci Problem\n\nImplement a function to calculate the nth fibonacci number.\n\n**Constraints:**\n- 0 <= n <= 30\n- Time limit: 1 second',
              sample_io: [
                { input: '5', output: '5' },
                { input: '10', output: '55' },
              ],
              allowed_languages: ['python', 'javascript', 'java', 'cpp'],
              predefined_boilerplates: {
                python: 'def fibonacci(n):\n    # Your code here\n    pass',
                javascript: 'function fibonacci(n) {\n    // Your code here\n}',
              },
              run_code_enabled: true,
              submission_enabled: true,
              marks: 20,
              negative_marks: 0,
            },
          },
        ],
      },
    ],
  },
  '2': {
    ...mockTestResults[1],
    test: mockTest,
    timed_section_answers: [
      {
        section_id: 'section-1',
        section_name: 'Multiple Choice Questions',
        section_duration: 45,
        answers: [
          {
            question_id: 'mcq-1',
            question_type: 'mcq',
            value: [1],
            marks_obtained: -1,
            snapshot_mcq: {
              question_id: 'mcq-1',
              title: 'Time Complexity',
              question_text: 'What is the time complexity of binary search?',
              options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
              is_multiple: false,
              marks: 5,
              negative_marks: 1,
              correct_options: [0],
              explanation: 'Binary search divides the search space in half with each iteration.',
            },
          },
        ],
      },
    ],
    open_section_answers: [
      {
        section_id: 'section-3',
        section_name: 'Coding Problems',
        section_duration: 45,
        answers: [
          {
            question_id: 'coding-1',
            question_type: 'coding',
            value: {
              language: 'python',
              code: 'def fibonacci(n):\n    return n  # Incorrect implementation',
            },
            marks_obtained: 5,
            snapshot_coding: {
              question_id: 'coding-1',
              title: 'Fibonacci Sequence',
              short_description: 'Implement fibonacci number calculation',
              long_description_markdown: '# Fibonacci Problem\n\nImplement a function to calculate the nth fibonacci number.',
              sample_io: [
                { input: '5', output: '5' },
                { input: '10', output: '55' },
              ],
              allowed_languages: ['python', 'javascript', 'java', 'cpp'],
              predefined_boilerplates: {
                python: 'def fibonacci(n):\n    # Your code here\n    pass',
              },
              run_code_enabled: true,
              submission_enabled: true,
              marks: 20,
              negative_marks: 0,
            },
          },
        ],
      },
    ],
  },
};

// Helper function to get student by ID
export const getStudentById = (studentId: string): Student | undefined => {
  return mockStudents.find(student => student.id === studentId);
};

// Helper function to get test results with student info
export const getTestResultsWithStudents = () => {
  return mockTestResults.map(result => ({
    ...result,
    student: getStudentById(result.student_id),
  }));
};

// Helper function to get detailed result for a student
export const getDetailedResultForStudent = (studentId: string): DetailedResult | undefined => {
  return mockDetailedResults[studentId];
};