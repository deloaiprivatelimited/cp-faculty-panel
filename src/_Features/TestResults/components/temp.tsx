import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle, 
  Code, 
  List, 
  FileText, 
  ChevronRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { dummyStudentData } from '../data/dummyData';

export const StudentDetailResults: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('section-1');
  const [loading, setLoading] = useState(false);

  // Use dummy data instead of API
  const data = dummyStudentData;
  const detailedResult = data.results[0];
  const student = data.student;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleBack = () => {
    // In a real app, this would navigate back
    console.log('Navigate back to results');
  };

  // Combine all sections for sidebar
  const allSections = [
    ...detailedResult.timed_section_answers.map(s => ({ ...s, type: 'timed' })),
    ...detailedResult.open_section_answers.map(s => ({ ...s, type: 'open' }))
  ];

  const selectedSection = allSections.find(s => s.section_id === selectedSectionId);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleString();
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'mcq': return <FileText className="w-5 h-5 text-[#4CA466]" />;
      case 'rearrange': return <List className="w-5 h-5 text-[#4CA466]" />;
      case 'coding': return <Code className="w-5 h-5 text-[#4CA466]" />;
      default: return <FileText className="w-5 h-5 text-[#4CA466]" />;
    }
  };

  const getMarksColor = (obtained: number | null, total: number) => {
    if (obtained === null) return 'text-gray-500';
    const percentage = (obtained / total) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSectionScore = (section: any) => {
    const totalMarks = section.answers.reduce((sum: number, answer: any) => {
      const maxMarks = answer.question_type === 'mcq' ? answer.snapshot_mcq?.marks || 0 :
                     answer.question_type === 'rearrange' ? answer.snapshot_rearrange?.marks || 0 :
                     answer.snapshot_coding?.marks || 0;
      return sum + maxMarks;
    }, 0);
    
    const obtainedMarks = section.answers.reduce((sum: number, answer: any) => {
      return sum + (answer.marks_obtained || 0);
    }, 0);
    
    return { obtained: obtainedMarks, total: totalMarks };
  };

  const renderMCQAnswer = (answer: any) => {
    const mcq = answer.snapshot_mcq;
    if (!mcq) return null;

    let studentSelections: string[] = [];
    if (Array.isArray(answer.value)) {
      studentSelections = answer.value as string[];
    } else if (answer.value && typeof answer.value === "object" && Array.isArray((answer.value as any).value)) {
      studentSelections = (answer.value as any).value;
    } else if (typeof answer.value === "string") {
      studentSelections = [answer.value];
    }

    const correctSet = new Set(mcq.correct_options);
    
    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-lg">{mcq.title ?? "MCQ"}</h4>
          {mcq.question_text && (
            <p className="text-gray-700 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: mcq.question_text }} />
          )}
        </div>

        <div className="grid gap-3">
          {mcq.options.map((opt, index) => {
            const isSelected = studentSelections.includes(opt.option_id);
            const isCorrect = correctSet.has(opt.option_id);

            return (
              <div
                key={opt.option_id}
                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200 ${
                  isCorrect ? "border-green-400 bg-green-50" : 
                  isSelected ? "border-red-400 bg-red-50" : 
                  "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : isSelected ? (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}

                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{opt.value}</div>
                  <div className="text-xs text-gray-500 mt-1">Option ID: {opt.option_id}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {isSelected && <Badge variant="default" className="text-xs">Selected</Badge>}
                  {isCorrect && <Badge variant="success" className="text-xs">Correct</Badge>}
                </div>
              </div>
            );
          })}
        </div>

        {mcq.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Explanation
            </h5>
            <p className="text-gray-700 leading-relaxed">{mcq.explanation}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
          {typeof mcq.marks === "number" && (
            <div className="flex justify-between">
              <span>Maximum Marks:</span>
              <span className="font-medium">{mcq.marks}</span>
            </div>
          )}
          {typeof mcq.negative_marks === 'number' && (
            <div className="flex justify-between">
              <span>Negative Marks:</span>
              <span className="font-medium">{mcq.negative_marks}</span>
            </div>
          )}
          {typeof answer.marks_obtained === 'number' && (
            <div className="flex justify-between">
              <span>Marks Obtained:</span>
              <span className={`font-bold ${getMarksColor(answer.marks_obtained, mcq.marks)}`}>
                {answer.marks_obtained}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRearrangeAnswer = (answer: any) => {
    const rearrange = answer.snapshot_rearrange;
    if (!rearrange) return null;

    const studentOrder: string[] = Array.isArray(answer.value)
      ? (answer.value as string[])
      : (answer.value && typeof answer.value === "object" && Array.isArray((answer.value as any).value))
      ? (answer.value as any).value
      : [];

    const itemMap = new Map<string, string>();
    rearrange.items.forEach((it) => itemMap.set(it.item_id, it.value ?? it.item_id));

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-lg">{rearrange.title}</h4>
          <p className="text-gray-700 mb-6 leading-relaxed">{rearrange.prompt}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Student's Order
            </h5>
            <div className="space-y-3">
              {studentOrder.length === 0 ? (
                <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">No answer submitted.</div>
              ) : (
                studentOrder.map((itemId, position) => {
                  const correctIdAtPosition = rearrange.correct_order[position];
                  const isCorrect = itemId === correctIdAtPosition;
                  const label = itemMap.get(itemId) ?? itemId;

                  return (
                    <div
                      key={itemId + "-" + position}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <span className="font-medium text-gray-900">{position + 1}.</span>
                        <span className="text-gray-900">{label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Correct Order
            </h5>
            <div className="space-y-3">
              {rearrange.correct_order.map((itemId, position) => (
                <div key={itemId + "-correct-" + position} className="p-4 rounded-xl border-2 border-green-400 bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium text-gray-900">{position + 1}.</span>
                    <span className="text-gray-900">{itemMap.get(itemId) ?? itemId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {rearrange.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Explanation
            </h5>
            <p className="text-gray-700 leading-relaxed">{rearrange.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCodingAnswer = (answer: any) => {
    const coding = answer.snapshot_coding;
    if (!coding) return null;

    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-lg">{coding.title}</h4>
          <p className="text-gray-700 mb-6 leading-relaxed">{coding.short_description}</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-[#4CA466]" />
            Student's Solution
          </h5>
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <Badge variant="default" className="text-xs font-mono">
                {answer.value.language}
              </Badge>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <pre className="p-4 text-gray-100 text-sm overflow-x-auto leading-relaxed">
              <code>{answer.value.code}</code>
            </pre>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Sample Input/Output
            </h5>
            <div className="space-y-4">
              {coding.sample_io.map((io: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-500 font-medium">Input:</span>
                      <span className="text-gray-900 font-mono ml-2 bg-gray-100 px-2 py-1 rounded">
                        {io.input}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Output:</span>
                      <span className="text-gray-900 font-mono ml-2 bg-gray-100 px-2 py-1 rounded">
                        {io.output}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Problem Details
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600">Max Marks:</span>
                <span className="text-gray-900 font-semibold">{coding.marks}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600">Negative Marks:</span>
                <span className="text-gray-900 font-semibold">{coding.negative_marks}</span>
              </div>
              <div className="flex justify-between items-start py-2">
                <span className="text-gray-600">Languages:</span>
                <div className="flex flex-wrap gap-1">
                  {coding.allowed_languages.map((lang: string) => (
                    <Badge key={lang} variant="default" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnswer = (answer: any) => {
    switch (answer.question_type) {
      case 'mcq':
        return renderMCQAnswer(answer);
      case 'rearrange':
        return renderRearrangeAnswer(answer);
      case 'coding':
        return renderCodingAnswer(answer);
      default:
        return <div className="text-gray-500">Unknown question type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg h-screen fixed">
        <div className="p-6 border-b border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 w-full justify-center hover:bg-[#4CA466] hover:text-white hover:border-[#4CA466] transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            className="mb-6 flex items-center gap-2 w-full justify-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#4CA466] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{student.name}</h2>
            <p className="text-gray-600 text-sm mb-4">{student.email}</p>
            <div className="text-3xl font-bold text-[#4CA466] mb-2">
              {detailedResult.total_marks}/{detailedResult.max_marks}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {((detailedResult.total_marks / detailedResult.max_marks) * 100).toFixed(1)}%
            </div>
            <Badge variant={detailedResult.submitted ? 'success' : 'warning'} className="text-xs">
              {detailedResult.submitted ? 'Submitted' : 'In Progress'}
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Test Sections</h3>
            <div className="space-y-3">
              {allSections.map((section) => {
                const sectionScore = getSectionScore(section);
                const isSelected = selectedSectionId === section.section_id;
                
                return (
                  <button
                    key={section.section_id}
                    onClick={() => setSelectedSectionId(section.section_id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                      isSelected
                        ? 'border-[#4CA466] bg-[#4CA466]/10 text-gray-900 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#4CA466]/50 hover:bg-[#4CA466]/5 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm">{section.section_name}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-gray-500">
                        {section.answers.length} question{section.answers.length !== 1 ? 's' : ''}
                      </span>
                      <span className={`font-bold ${getMarksColor(sectionScore.obtained, sectionScore.total)}`}>
                        {sectionScore.obtained.toFixed(1)}/{sectionScore.total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs">
                        {section.type === 'timed' ? `${section.section_duration}min` : 'Open'}
                      </Badge>
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4CA466] transition-all duration-300"
                          style={{ width: `${(sectionScore.obtained / sectionScore.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto ml-80">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{detailedResult.test.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{detailedResult.test.description}</p>
          </div>

          {/* Test Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#4CA466]">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{detailedResult.total_marks.toFixed(1)}</p>
                  <p className="text-sm text-gray-500 mt-1">out of {detailedResult.max_marks}</p>
                </div>
                <div className="p-3 bg-[#4CA466]/10 rounded-full">
                  <Award className="w-8 h-8 text-[#4CA466]" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Submitted At</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(detailedResult.submitted_at)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Last Auto-save</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(detailedResult.last_autosave)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Section Content */}
          {selectedSection ? (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-[#4CA466]/5 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedSection.section_name}</h3>
                    <p className="text-gray-600 mt-2">
                      {selectedSection.type === 'timed' 
                        ? `Duration: ${selectedSection.section_duration} minutes` 
                        : 'Open-ended Section'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="mb-3">{selectedSection.answers.length} Questions</Badge>
                    <div>
                      {(() => {
                        const sectionScore = getSectionScore(selectedSection);
                        return (
                          <span className={`text-2xl font-bold ${getMarksColor(sectionScore.obtained, sectionScore.total)}`}>
                            {sectionScore.obtained.toFixed(1)}/{sectionScore.total}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-12 p-8">
                {selectedSection.answers.map((answer, index) => (
                  <div key={answer.question_id} className="border-b border-gray-200 pb-12 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#4CA466]/10 rounded-lg">
                          {getQuestionIcon(answer.question_type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Question {index + 1}</h4>
                          <p className="text-gray-500 capitalize">{answer.question_type} Question</p>
                        </div>
                      </div>
                      <div className="text-right bg-gray-50 rounded-lg p-4 min-w-[120px]">
                        <div className="text-xs text-gray-500 mb-1">Score</div>
                        <div className={`text-xl font-bold ${getMarksColor(answer.marks_obtained, 
                          answer.question_type === 'mcq' ? answer.snapshot_mcq?.marks || 0 :
                          answer.question_type === 'rearrange' ? answer.snapshot_rearrange?.marks || 0 :
                          answer.snapshot_coding?.marks || 0
                        )}`}>
                          {answer.marks_obtained !== null ? answer.marks_obtained.toFixed(1) : '0'} / {
                            answer.question_type === 'mcq' ? answer.snapshot_mcq?.marks || 0 :
                            answer.question_type === 'rearrange' ? answer.snapshot_rearrange?.marks || 0 :
                            answer.snapshot_coding?.marks || 0
                          }
                        </div>
                      </div>
                    </div>
                    {renderAnswer(answer)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="p-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-xl">Select a section from the sidebar to view questions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};