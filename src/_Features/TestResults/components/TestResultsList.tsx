import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTestResults } from "../hooks/useTestResults";
import { testResultsService } from "../services/api";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { SearchInput } from "./ui/SearchInput";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Eye,
  Users,
  Clock,
  Award,
  Loader2,
  AlertCircle,
  EyeOff,
  Monitor,
  Columns,
} from "lucide-react";

export const TestResultsList: React.FC = () => {
  const { testId } = useParams<{ testId: string }>(); // ⬅️ get testId from route params

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"submitted_at" | "total_marks" | "name">(
    "submitted_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  // Use the API hook to fetch data
  const { data, loading, error, refetch } = useTestResults({
    test_id: testId,
    search: searchTerm,
    limit: 100,
    offset: 0,
    sort_by: sortBy === "name" ? "submitted_at" : sortBy, // API doesn't support name sorting
    order: sortOrder,
  });

  // Helper formatters
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not submitted";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getPerformanceColor = (marks: number) => {
    if (marks >= 80) return "text-green-400";
    if (marks >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Compose results + defensive telemetry access
  const filteredAndSortedResults = useMemo(() => {
    if (!data?.results) return [];

    // Add student info to results (backend already returns student object maybe)
    let resultsWithStudents = data.results.map((result) => ({
      ...result,
    }));

    // Client-side filtering for name (since API handles search)
    let filtered = resultsWithStudents;
    if (searchTerm && sortBy === "name") {
      filtered = resultsWithStudents.filter(
        (result) =>
          (result.student?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (result.student?.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Client-side sorting for name (since API doesn't support it)
    if (sortBy === "name") {
      filtered.sort((a, b) => {
        const compareValue = (a.student?.name || "").localeCompare(
          b.student?.name || ""
        );
        return sortOrder === "desc" ? -compareValue : compareValue;
      });
    }

    return filtered;
  }, [data?.results, searchTerm, sortBy, sortOrder]);

  const submittedCount = filteredAndSortedResults.filter((r) => r.submitted)
    .length;
  const averageScore =
    filteredAndSortedResults.length > 0
      ? filteredAndSortedResults.reduce((sum, r) => sum + r.total_marks, 0) /
        filteredAndSortedResults.length
      : 0;

  const handleRefresh = () => refetch();

  // pull telemetry summaries safe
  const tabsSummary = data?.tabs_summary;

  // helper: robust telemetry extractors (reuse in rendering if needed)
  const extractFullScreen = (raw: any) =>
    !!(raw.full_screen ?? raw.fullscreen_violated ?? raw.is_fullscreen ?? false);
  console.log(extractFullScreen)

  const extractTabSwitchCount = (raw: any) => {
    // numeric canonical fields first
    if (typeof raw.tab_switch_count === "number") return raw.tab_switch_count;
    if (typeof raw.tab_switches_count === "number")
      return raw.tab_switches_count;
    // list-shaped fallbacks
    if (Array.isArray(raw.tab_switches)) return raw.tab_switches.length;
    if (Array.isArray(raw.tab_focus_events)) return raw.tab_focus_events.length;
    if (Array.isArray(raw.tabs)) return raw.tabs.length;
    return 0;
  };
const handleDownloadExcel = () => {
  if (!filteredAndSortedResults.length) return;

  // Prepare clean data for export
  const exportData = filteredAndSortedResults.map((r) => ({
    Name: r.student?.name || "Unknown",
    Email: r.student?.email || "Unknown",
    Score: `${r.total_marks.toFixed(1)} / ${r.max_marks}`,
    Status: r.submitted ? "Submitted" : "In Progress",
    "Submitted At": formatDate(r.submitted_at),
    "Fullscreen Violation": extractFullScreen(r) ? "Yes" : "No",
    "Tab Switches": extractTabSwitchCount(r),
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

  // Generate buffer and save as file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `test_results_${testId || "data"}.xlsx`);
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data?.test?.test_name}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gray-600">{data?.test?.description}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
            </Button>
            <Button
  size="sm"
  variant="outline"
  onClick={handleDownloadExcel}
  className="flex items-center gap-2"
>
  Download Excel
</Button>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Test Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.total || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-[#4CA466]" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-500 text-sm">Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {submittedCount}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-[#4CA466]" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-gray-500 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageScore.toFixed(1)}
                  </p>
                </div>
                <Award className="w-8 h-8 text-[#4CA466]" />
              </CardContent>
            </Card>

            {/* Tabs summary card (if available) */}
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-500 text-sm">Tab switches (all)</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-semibold">
                      {tabsSummary ? tabsSummary.total_tab_switches : "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      avg: {tabsSummary ? tabsSummary.avg_tab_switches_per_attempt.toFixed(1) : "—"}
                    </p>
                  </div>
                  <Columns className="w-6 h-6 text-[#4CA466]" />
                </div>
              </CardContent>
            </Card>

            {/* placeholder - monitor / fullscreen KPI */}
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-500 text-sm">Fullscreen used</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-semibold">
                      {data?.results
                        ? data.results.filter((r) => extractFullScreen(r)).length
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-500">attempts</p>
                  </div>
                  <Monitor className="w-6 h-6 text-[#4CA466]" />
                </div>
              </CardContent>
            </Card>

            {/* small empty placeholder to keep grid layout consistent */}
            <div />
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Note: For API search, you might want to debounce this
                    // and trigger a new API call instead of client-side filtering
                  }}
                />
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 text-sm">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
                  >
                    <option value="submitted_at">Submission Time</option>
                    <option value="total_marks">Marks</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-gray-700 text-sm">Order:</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            {loading && (
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#4CA466]" />
                <span className="text-gray-600">Loading results...</span>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900">Student Results</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Student
                    </th>
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Email
                    </th>
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Score
                    </th>
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Status
                    </th>
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Submitted At
                    </th>

                    {/* NEW telemetry columns */}
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Fullscreen
                    </th>
                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Tabs
                    </th>

                    <th className="text-left text-gray-600 font-medium py-3 px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedResults.map((result) => {
                    // defensive access to telemetry with fallbacks
                    const fullScreen = extractFullScreen(result);
                    const tabSwitchCount = extractTabSwitchCount(result);

                    return (
                      <tr
                        key={result.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {result.student?.name || "Unknown"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {result.student?.email || "Unknown"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-bold text-lg ${getPerformanceColor(
                              result.total_marks
                            )}`}
                          >
                            {result.total_marks.toFixed(1)}
                          </span>
                          <span className="text-gray-400">/{result.max_marks}</span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={result.submitted ? "success" : "warning"}>
                            {result.submitted ? "Submitted" : "In Progress"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {formatDate(result.submitted_at)}
                        </td>

                        {/* Fullscreen */}
                     {/* Fullscreen */}
<td className="py-4 px-6">
  {fullScreen ? (
    <span className="inline-flex items-center gap-2 text-sm text-red-600">
      <Monitor className="w-4 h-4" />
      Violation
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 text-sm text-gray-500">
      <EyeOff className="w-4 h-4" />
      No violation
    </span>
  )}
</td>


                        {/* Tab switch count */}
                        <td className="py-4 px-6 text-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{tabSwitchCount}</div>
                            <div className="text-xs text-gray-400">tabs</div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/student/${result.student_id}/results`, {
                                state: { testId },
                              })
                            }
                            disabled={loading}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!loading && filteredAndSortedResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No results found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
