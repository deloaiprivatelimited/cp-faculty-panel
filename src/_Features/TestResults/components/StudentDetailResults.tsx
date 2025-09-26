import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStudentDetailResults } from '../hooks/useStudentDetailResults';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import MarkdownRenderer from '../../../utils/MarkDownRender';
import { ArrowLeft, Clock, Award, CheckCircle, XCircle, Code, List, FileText, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export const StudentDetailResults: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  // Get testId from navigation state or use default
  const testId = location.state?.testId || 'test-123';



  // Use the API hook to fetch data
  const { data, loading, error, refetch } = useStudentDetailResults({
    student_id: studentId,
    test_id: testId,
    include_snapshots: true,
  });
  // console.log(data)

  // Extract the first result (assuming one result per student per test)
  const detailedResult = data?.results?.[0];
  const student = data?.student;
  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">Student ID is required</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-[#4CA466] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 text-lg">Loading student results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student || !detailedResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">Student results not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRefresh = () => refetch();

  // Combine all sections for sidebar
  const allSections = [
    ...detailedResult.timed_section_answers.map(s => ({ ...s, type: 'timed' })),
    ...detailedResult.open_section_answers.map(s => ({ ...s, type: 'open' }))
  ];

  // Set default selected section if none selected
  // React.useEffect(() => {
  //   if (!selectedSectionId && allSections.length > 0) {
  //     setSelectedSectionId(allSections[0].section_id);
  //   }
  // }, [selectedSectionId, allSections]);

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
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
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


// Normalize student selection to array of option_ids
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
    <div className="space-y-4">
<div>
{mcq.question_text && <MarkdownRenderer text={mcq.question_text}/>}
</div>


<div className="grid gap-2">
{mcq.options.map((opt, index) => {
const isSelected = studentSelections.includes(opt.option_id);
const isCorrect = correctSet.has(opt.option_id);


return (
<div
key={opt.option_id}
className={`p-3 rounded-lg border flex items-center gap-3 ${
isCorrect ? "border-green-500 bg-green-500/10" : isSelected ? "border-red-500 bg-red-500/10" : "border-gray-200 bg-gray-50"
}`}
>
{isCorrect ? (
<CheckCircle className="w-5 h-5 text-green-400" />
) : isSelected ? (
<XCircle className="w-5 h-5 text-red-400" />
) : (
<div className="w-5 h-5" />
)}


<div className="flex-1">
<div className="text-gray-900"><MarkdownRenderer text={opt.value}/></div>
</div>


<div className="flex flex-col items-end gap-1">
{isSelected && <div className="text-xs font-medium text-gray-700">Selected</div>}
{isCorrect && <div className="text-xs font-medium text-green-600">Correct</div>}
</div>
</div>
);
})}
</div>


{mcq.explanation && (
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
<h5 className="font-medium text-gray-900 mb-2">Explanation</h5>
<MarkdownRenderer text={mcq.explanation}/></div>
)}


<div className="text-sm text-gray-500">
{typeof mcq.marks === "number" && (
<div>Marks: {mcq.marks} {typeof mcq.negative_marks === 'number' && `(Negative: ${mcq.negative_marks})`}</div>
)}
{typeof answer.marks_obtained === 'number' && <div>Marks obtained: {answer.marks_obtained}</div>}
</div>
</div>
    );
  };

  const renderRearrangeAnswer = (answer: any) => {
    const rearrange = answer.snapshot_rearrange;
    if (!rearrange) return null;
    // console.log(answer)
    // console.log(answer.value)
const studentOrder: string[] = Array.isArray(answer.value)
? (answer.value as string[])
: (answer.value && typeof answer.value === "object" && Array.isArray((answer.value as any).value))
? (answer.value as any).value
: [];
// console.log(studentOrder)

// Build a lookup map for item_id -> display value
const itemMap = new Map<string, string>();
rearrange.items.forEach((it) => itemMap.set(it.item_id, it.value ?? it.item_id));
    return (
      <div className="space-y-4">
        <div>
<MarkdownRenderer text={rearrange.prompt}/>        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Student's Order</h5>
            <div className="space-y-2">
              {studentOrder.length === 0 && (
<div className="text-sm text-gray-500">No answer submitted.</div>
)}{studentOrder.map((itemId, position) => {
const correctIdAtPosition = rearrange.correct_order[position];
const isCorrect = itemId === correctIdAtPosition;
const label = itemMap.get(itemId) ?? itemId;


return (
<div
key={itemId + "-" + position}
className={`p-3 rounded-lg border ${
isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
}`}
>
<div className="flex items-center gap-3">
{isCorrect ? (
<CheckCircle className="w-5 h-5 text-green-400" />
) : (
<XCircle className="w-5 h-5 text-red-400" />
)}
<span className="text-gray-900">{position + 1}. {label}</span>
</div>
</div>
);
})}
              {/* {answer.value.map((itemIndex: number, position: number) => (
                <div
                  key={position}
                  className={`p-3 rounded-lg border ${
                    rearrange.correct_order[position] === itemIndex
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {rearrange.correct_order[position] === itemIndex ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-gray-900">{position + 1}. {rearrange.items[itemIndex]}</span>
                  </div>
                </div>
              ))} */}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3">Correct Order</h5>
            <div className="space-y-2">
             {rearrange.correct_order.map((itemId, position) => (
<div key={itemId + "-correct-" + position} className="p-3 rounded-lg border border-green-500 bg-green-500/10">
<div className="flex items-center gap-3">
<CheckCircle className="w-5 h-5 text-green-400" />
<span className="text-gray-900">{position + 1}. {itemMap.get(itemId) ?? itemId}</span>
</div>
</div>
))}
            </div>
          </div>
        </div>
        
        {rearrange.explanation && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Explanation</h5>
<MarkdownRenderer text={rearrange.explanation}/>          </div>
        )}
      </div>
    );
  };

  const renderCodingAnswer = (answer: any) => {
    const coding = answer.snapshot_coding;
    console.log(answer)
    if (!coding) return null;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{coding.title}</h4>
          <p className="text-gray-700 mb-4">{coding.short_description}</p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Student's Solution</h5>
          <div className="bg-gray-900 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="default">{answer.value.language}</Badge>
            </div>
            <pre className="text-gray-100 text-sm overflow-x-auto">
              <code>{answer.value.source_code}</code>
            </pre>
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (fixed) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm h-screen fixed top-0 left-0 z-20">
        {/* Sidebar header (fixed, not scrollable) */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/test/results/${testId}`)}
            className="mb-4 flex items-center gap-2 w-full justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            className="mb-4 flex items-center gap-2 w-full justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{student.name}</h2>
            <p className="text-gray-600 text-sm mb-3">{student.email}</p>
            <div className="text-2xl font-bold text-[#4CA466]">
              {detailedResult.total_marks}/{detailedResult.max_marks}
            </div>
            <Badge variant={detailedResult.submitted ? 'success' : 'warning'} className="mt-2">
              {detailedResult.submitted ? 'Submitted' : 'In Progress'}
            </Badge>
          </div>
        </div>

        {/* Sidebar content (scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Test Sections</h3>
            <div className="space-y-2">
              {allSections.map((section) => {
                const sectionScore = getSectionScore(section);
                const isSelected = selectedSectionId === section.section_id;
                
                return (
                  <button
                    key={section.section_id}
                    onClick={() => setSelectedSectionId(section.section_id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'border-[#4CA466] bg-[#4CA466]/10 text-gray-900'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#4CA466]/50 hover:bg-[#4CA466]/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{section.section_name}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {section.answers.length} question{section.answers.length !== 1 ? 's' : ''}
                      </span>
                      <span className={`font-medium ${getMarksColor(sectionScore.obtained, sectionScore.total)}`}>
                        {sectionScore.obtained.toFixed(1)}/{sectionScore.total}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="text-xs">
                        {section.type === 'timed' ? `${section.section_duration}min` : 'Open'}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (scrollable, with left margin) */}
      <div className="ml-80 min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{detailedResult.test.title}</h1>
            <p className="text-gray-600">{detailedResult.test.description}</p>
          </div>

          {/* Test Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Score</p>
                  <p className="text-2xl font-bold text-gray-900">{detailedResult.total_marks.toFixed(1)}</p>
                </div>
                <Award className="w-8 h-8 text-[#4CA466]" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-500 text-sm">Submitted At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(detailedResult.submitted_at)}</p>
                </div>
                <Clock className="w-8 h-8 text-[#4CA466]" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-500 text-sm">Last Auto-save</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(detailedResult.last_autosave)}</p>
                </div>
                <Clock className="w-8 h-8 text-[#4CA466]" />
              </CardContent>
            </Card>
          </div>

          {/* Selected Section Content */}
          {selectedSection ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedSection.section_name}</h3>
                    <p className="text-gray-600">
                      {selectedSection.type === 'timed' 
                        ? `Duration: ${selectedSection.section_duration} minutes` 
                        : 'Open-ended Section'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">{selectedSection.answers.length} Questions</Badge>
                    <div className="mt-2">
                      {(() => {
                        const sectionScore = getSectionScore(selectedSection);
                        return (
                          <span className={`text-lg font-bold ${getMarksColor(sectionScore.obtained, sectionScore.total)}`}>
                            {sectionScore.obtained.toFixed(1)}/{sectionScore.total}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {selectedSection.answers.map((answer, index) => (
                  <div key={answer.question_id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {getQuestionIcon(answer.question_type)}
                        <div>
                          <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                          <p className="text-gray-500 text-sm capitalize">{answer.question_type} Question</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getMarksColor(answer.marks_obtained, 
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
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 text-lg">Select a section from the sidebar to view questions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};