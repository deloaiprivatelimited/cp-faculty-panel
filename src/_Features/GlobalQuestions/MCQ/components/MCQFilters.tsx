import React, { useEffect, useMemo } from "react";
import { Filter, X } from "lucide-react";

interface FilterProps {
  selectedDifficulty: string;
  selectedTopic: string;
  selectedSubtopic: string;
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
  onSubtopicChange: (subtopic: string) => void;
  onClearFilters: () => void;
  availableData: {
    difficulties?: string[];
    topics: string[]; // backend provides this
    // backend may provide either:
    // - a mapping: Record<string, string[]>
    // - or something else (array, missing, etc). We will fallback to local mapping.
    subtopics?: any;
  };
}

const MCQFilters: React.FC<FilterProps> = ({
  selectedDifficulty,
  selectedTopic,
  selectedSubtopic,
  onDifficultyChange,
  onTopicChange,
  onSubtopicChange,
  onClearFilters,
  availableData,
}) => {
  const hasActiveFilters = !!(selectedDifficulty || selectedTopic || selectedSubtopic);

  // Local fallback mapping (exactly the mapping you posted)
  const fallbackSubtopics: Record<string, string[]> = {
    Aptitude: [
      "Quantitative Aptitude",
      "Number System",
      "Percentages",
      "Ratios & Proportions",
      "Time & Work",
      "Speed, Time & Distance",
      "Probability",
      "Permutations & Combinations",
      "Mensuration",
      "Data Interpretation"
    ],
    "Logical Reasoning": [
      "Puzzles",
      "Seating Arrangement",
      "Blood Relations",
      "Coding-Decoding",
      "Syllogisms",
      "Direction Sense",
      "Series (Number/Alphabet)",
      "Clocks & Calendars"
    ],
    "Verbal Ability": [
      "Reading Comprehension",
      "Sentence Correction",
      "Fill in the Blanks",
      "Synonyms & Antonyms",
      "Paragraph Jumbles",
      "Critical Reasoning"
    ],
    "Operating Systems": [
      "Process Management",
      "CPU Scheduling",
      "Memory Management",
      "Deadlocks",
      "File Systems",
      "Concurrency & Synchronization"
    ],
    DBMS: [
      "ER Model",
      "Normalization",
      "SQL Queries",
      "Transactions",
      "Indexing",
      "Joins & Keys"
    ],
    "Computer Networks": [
      "OSI & TCP/IP Models",
      "IP Addressing",
      "Routing",
      "Switching",
      "Congestion Control",
      "Application Layer Protocols (HTTP, DNS, FTP)"
    ],
    Programming: [
      "C/C++ Basics",
      "Java Basics",
      "Python Basics",
      "OOP Concepts",
      "Exception Handling",
      "Standard Libraries"
    ],
    "Data Structures": [
      "Arrays",
      "Strings",
      "Linked List",
      "Stacks & Queues",
      "Trees",
      "Graphs",
      "Hashing",
      "Heaps"
    ],
    Algorithms: [
      "Sorting",
      "Searching",
      "Recursion & Backtracking",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Graph Algorithms",
      "Divide & Conquer"
    ],
    "Software Engineering": [
      "SDLC Models",
      "Agile & Scrum",
      "Testing & Debugging",
      "Version Control (Git)"
    ],
    "System Design": [
      "Scalability Basics",
      "Load Balancing",
      "Caching",
      "Databases in Design",
      "High-Level Design Questions"
    ],
    "HR & Behavioral": [
      "Tell me about yourself",
      "Strengths & Weaknesses",
      "Teamwork",
      "Leadership",
      "Conflict Resolution",
      "Why should we hire you?"
    ]
  };

  // Use backend mapping if it's already a proper object mapping; otherwise use fallback.
  const subtopicsMapping: Record<string, string[]> =
    availableData.subtopics && typeof availableData.subtopics === "object" && !Array.isArray(availableData.subtopics)
      ? availableData.subtopics
      : fallbackSubtopics;

  // Build the list to populate subtopic select based on selectedTopic.
  const subtopicsForSelect = useMemo(() => {
    if (selectedTopic) {
      return subtopicsMapping[selectedTopic] ?? [];
    }
    // Flatten all subtopic arrays and dedupe while preserving order
    const seen = new Set<string>();
    const flat: string[] = [];
    for (const t of (availableData.topics ?? Object.keys(subtopicsMapping))) {
      const arr = subtopicsMapping[t] ?? [];
      for (const s of arr) {
        if (!seen.has(s)) {
          seen.add(s);
          flat.push(s);
        }
      }
    }
    return flat;
  }, [subtopicsMapping, selectedTopic, availableData.topics]);

  // Clear subtopic if it doesn't belong to newly selected topic
  useEffect(() => {
    if (!selectedTopic) return; // if no topic selected, any subtopic allowed (from full list)
    const valid = (subtopicsMapping[selectedTopic] ?? []).includes(selectedSubtopic);
    if (!valid && selectedSubtopic) {
      onSubtopicChange("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]); // only run when topic changes

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-transparent outline-none transition-all"
          >
            <option value="">All Difficulties</option>
            {(availableData.difficulties ?? []).map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-transparent outline-none transition-all"
          >
            <option value="">All Topics</option>
            {(availableData.topics ?? Object.keys(subtopicsMapping)).map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Subtopic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtopic</label>
          <select
            value={selectedSubtopic}
            onChange={(e) => onSubtopicChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-transparent outline-none transition-all"
            disabled={subtopicsForSelect.length === 0}
            title={subtopicsForSelect.length === 0 ? "No subtopics available" : undefined}
          >
            <option value="">All Subtopics</option>
            {subtopicsForSelect.map((subtopic) => (
              <option key={subtopic} value={subtopic}>
                {subtopic}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MCQFilters;
