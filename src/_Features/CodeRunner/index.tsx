import React, { useState, useEffect } from "react";
import { questionService } from "./services/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/Tabs";
import ProblemStatement from "./components/ProblemStatement";
import SolutionTab from "./components/SolutionTab";
import CodeEditor from "./components/CodeEditor";
import { useQuestion } from "./hooks/useQuestion";
import { Loader2 } from "lucide-react";
import type { Question } from "./types";
import { privateAxios } from "../../utils/axios";
import SubmissionsTabs from "./components/SubmissionsTab";
import ResultPanel from "./components/ResultPanel";
import type { SubmissionResult } from "./types";
import { useParams } from "react-router-dom";

function CodeRunner() {
  // For demo purposes, using hardcoded values
   const { collection = "questions", questionId = "68c559a2592c0d9977b08b8b" } = useParams();

  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);

  const { question, loading, error } = useQuestion(collection, questionId);
  const [activeTab, setActiveTab] = useState("problem");
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Initialize code with boilerplate and custom input with first sample
  useEffect(() => {
    if (question) {
      // Set default language
      const defaultLang = question.allowed_languages[0] || "python";
      setSelectedLanguage(defaultLang);

      // Set boilerplate code if available
      if (
        question.predefined_boilerplates &&
        question.predefined_boilerplates[defaultLang]
      ) {
        setCode(question.predefined_boilerplates[defaultLang]);
      }

      // Set first sample input as default custom input
      if (question.sample_io && question.sample_io.length > 0) {
        setCustomInput(question.sample_io[0].input_text);
      }
    }
  }, [question]);

  // Update code when language changes
  useEffect(() => {
    if (
      question &&
      question.predefined_boilerplates &&
      question.predefined_boilerplates[selectedLanguage]
    ) {
      setCode(question.predefined_boilerplates[selectedLanguage]);
    } else {
      setCode("");
    }
  }, [selectedLanguage, question]);

  /* handleRunCode */
  const handleRunCode = async () => {
    setIsRunning(true);

    // show running message immediately
    setOutput("Running...");

    try {
      const resp = await questionService.runCode(
        collection,
        questionId,
        code,
        selectedLanguage,
        customInput
      );

      const result = resp?.result || {};

      // Decode actual outputs (they should already be decoded by the backend)
      const stdout = (result.stdout ?? "").toString().trim();
      const stderr = (result.stderr ?? "").toString().trim();
      const compileOutput = (result.compile_output ?? "").toString().trim();
      const message = (result.message ?? "").toString().trim();

      // Preferred display order:
      // 1) stdout (if present)
      // 2) stderr (if stdout empty)
      // 3) compile_output (if above empty)
      // 4) message or a default note
      let finalOutput = "";
      if (stdout.length > 0) {
        finalOutput = stdout;
      } else if (stderr.length > 0) {
        finalOutput = stderr;
      } else if (compileOutput.length > 0) {
        finalOutput = compileOutput;
      } else if (message.length > 0) {
        finalOutput = message;
      } else {
        // Nothing useful returned — provide a short friendly message
        finalOutput = "(no output)";
      }

      setOutput(finalOutput);
    } catch (err) {
      console.error("Error running code:", err);
      setOutput("Error: Failed to run code. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsRunning(true);
    setOutput("Submitting code...");
    setSubmissionResult(null); // clear previous

    try {
      const res = await privateAxios.post(
        `/coding/questions/${collection}/${questionId}/mock-submit`,
        {
          source_code: code,
          language: selectedLanguage,
        }
      );

      // prefer standardized shape; guard for varying backend shapes
      const data = res?.data;
      // If backend returns the same shape as earlier example, data is already the SubmissionResult
      // If it's nested, adapt accordingly:
      const submission: SubmissionResult = {
        submission_id:
          data.submission_id ??
          data.data?.submission_id ??
          data.id ??
          "unknown",
        question_id: data.question_id ?? data.data?.question_id ?? questionId,
        verdict:
          data.verdict ??
          data.data?.verdict ??
          (data.total_score === data.max_score
            ? "Accepted"
            : data.total_score > 0
            ? "Partial"
            : "Wrong Answer"),
        total_score: Number(data.total_score ?? data.data?.total_score ?? 0),
        max_score: Number(
          data.max_score ?? data.data?.max_score ?? question.points ?? 0
        ),
        groups: data.groups ?? data.data?.groups ?? [],
        created_at:
          data.created_at ?? data.data?.created_at ?? new Date().toISOString(),
      };

      setSubmissionResult(submission);

      // Also set a friendly output
      setOutput(
        `Verdict: ${submission.verdict} — Score: ${submission.total_score}/${submission.max_score}`
      );
    } catch (err: any) {
      console.error("Submit error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit code";
      setOutput(`Error: ${message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading question...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-xl font-semibold text-gray-100 mb-2">
            Error Loading Question
          </h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-xl font-semibold text-gray-100 mb-2">
            Question Not Found
          </h1>
          <p className="text-gray-400">
            The requested question could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Determine available tabs
  const availableTabs = ["problem"];
  if (question.sample_io && question.sample_io.length > 0) {
    availableTabs.push("samples");
  }
  if (
    question.solution_code &&
    Object.keys(question.solution_code).length > 0
  ) {
    availableTabs.push("solution");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1f1f1f" }}>
      <div className="flex h-full">
        {/* Left Panel - Problem Statement */}
        <div
          className="w-1/2 border-r h-screen border-gray-800 flex flex-col"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <TabsList
              className="flex-shrink-0 px-4 border-b border-gray-800"
              style={{ backgroundColor: "#1f1f1f" }}
            >
              <TabsTrigger
                value="problem"
                className="text-gray-300 hover:text-gray-100 data-[state=active]:text-white"
                style={{
                  backgroundColor:
                    activeTab === "problem" ? "#2f2f2f" : "transparent",
                }}
              >
                Problem
              </TabsTrigger>

              {question.solution_code &&
                Object.keys(question.solution_code).length > 0 && (
                  <TabsTrigger
                    value="solution"
                    className="text-gray-300 hover:text-gray-100 data-[state=active]:text-white"
                    style={{
                      backgroundColor:
                        activeTab === "solution" ? "#2f2f2f" : "transparent",
                    }}
                  >
                    Solution
                  </TabsTrigger>
                )}
                 <TabsTrigger
                value="submissions"
                className="text-gray-300 hover:text-gray-100 data-[state=active]:text-white"
                style={{
                  backgroundColor:
                    activeTab === "submissions" ? "#2f2f2f" : "transparent",
                }}
              >
               Submissions
              </TabsTrigger>
            </TabsList>
            

            <div
              className="flex-1 overflow-y-auto custom-scrollbar"
              style={{
                backgroundColor: "#1f1f1f",
                scrollbarWidth: "thin",
                scrollbarColor: "#4a4a4a #1f1f1f",
              }}
            >
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #1f1f1f;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #4a4a4a;
                  border-radius: 4px;
                  border: 1px solid #1f1f1f;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #5a5a5a;
                }
                .custom-scrollbar::-webkit-scrollbar-corner {
                  background: #1f1f1f;
                }
              `}</style>
              <TabsContent
                value="problem"
                style={{ backgroundColor: "#1f1f1f" }}
              >
                <ProblemStatement question={question} />
              </TabsContent>

              {question.solution_code &&
                Object.keys(question.solution_code).length > 0 && (
                  <TabsContent
                    value="solution"
                    style={{ backgroundColor: "#1f1f1f" }}
                  >
                    <SolutionTab question={question} />
                  </TabsContent>
                )}
                <TabsContent
                    value="submissions"
                    style={{ backgroundColor: "#1f1f1f" }}
                  >
                    <SubmissionsTabs collection="questions" questionId={questionId} />
                  </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor */}
        {/* Right Panel - Code Editor */}
        <div
          className="w-1/2 flex flex-col h-screen"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{
              backgroundColor: "#1f1f1f",
              scrollbarWidth: "thin",
              scrollbarColor: "#4a4a4a #1f1f1f",
            }}
          >
            <CodeEditor
              question={question}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              code={code}
              onCodeChange={setCode}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              output={output}
              isRunning={isRunning}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
            />

            {/* Result panel placed under the editor */}
            <div
              className="flex-shrink-0 p-4 border-t border-gray-800"
              style={{ backgroundColor: "#1f1f1f" }}
            >
              <ResultPanel result={submissionResult} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeRunner;
