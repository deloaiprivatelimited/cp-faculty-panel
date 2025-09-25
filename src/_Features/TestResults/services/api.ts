// src/services/testResultsService.ts
import { privateAxios, attachPrivateAxios } from "../../../utils/axios";

// Types matching your Flask API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Student {
  id: string;
  name: string;
  email: string;
}

/**
 * Per-attempt telemetry/violation shape.
 * Keep `any` for violations entries because shape may vary (string, object, etc).
 */
export interface AttemptTelemetry {
  full_screen: boolean;
  tab_switch_count: number;
  violations: any[]; // shape depends on backend; adjust if you have stricter shape
  violation_count: number;
}

export interface TestResult {
  id: string;
  student_id: string;
  student?: Student | null; // optional student object returned by backend

  test_id: string;
  total_marks: number;
  max_marks: number;
  submitted: boolean;
  submitted_at: string | null;
  last_autosave: string | null;

  // new telemetry fields
  full_screen?: boolean;
  tab_switch_count?: number;
  violations?: any[];
  violation_count?: number;
}

export interface TestMeta {
  id: string;
  test_name?: string | null;
  description?: string | null;
  duration_seconds?: number | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  total_sections?: number;
  no_of_students?: number;
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
  question_type: "mcq" | "rearrange" | "coding";
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

  // include telemetry too (optional)
  full_screen?: boolean;
  tab_switch_count?: number;
  violations?: any[];
  violation_count?: number;
}

/**
 * Summaries returned by backend for UI tabs/violations counts
 */
export interface TabsSummary {
  total_tab_switches: number;
  avg_tab_switches_per_attempt: number;
  max_tab_switches: number;
  attempts_with_tab_switches: number;
  attempts_with_tab_switches_percent: number;
}

export interface ViolationSummary {
  total_violations: number;
  attempts_with_violations: number;
  attempts_with_violations_percent: number;
}

export interface TestResultsListResponse {
  test?: TestMeta; // optional test meta object returned by backend
  results: TestResult[];
  total: number;
  limit: number;
  offset: number;

  // new top-level summaries
  tabs_summary?: TabsSummary;
  violation_summary?: ViolationSummary;
}

export interface StudentDetailResponse {
  student: Student;
  test_id: string;
  results: DetailedResult[];
  total: number;
  limit: number;
  offset: number;

  // also include summaries at student-level if backend returns them
  tabs_summary?: TabsSummary;
  violation_summary?: ViolationSummary;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage or wherever you store it
    this.token = localStorage.getItem("auth_token");
    if (this.token) {
      attachPrivateAxios(this.token);
    }
  }

  // Handle API response
  private async handleResponse<T>(promise: Promise<any>): Promise<T> {
    try {
      const response = await promise;
      const data = response.data as ApiResponse<T>;

      if (!data.success) {
        throw new Error(data.message || "API request failed");
      }
      // If backend wraps payload in `data`, return that; otherwise return whole object
      return (data.data as T) || (response.data as unknown as T);
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            `HTTP error! status: ${error.response.status}`
        );
      }
      throw new Error(error.message || "Network error");
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
    attachPrivateAxios(token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
    attachPrivateAxios(null);
  }

  // GET /api/students/results
  async getTestResults(params: {
    test_id: string;
    search?: string;
    limit?: number;
    offset?: number;
    sort_by?: "submitted_at" | "last_autosave" | "total_marks";
    order?: "asc" | "desc";
  }): Promise<TestResultsListResponse> {
    return this.handleResponse<TestResultsListResponse>(
      privateAxios.get("/api/faculty/test/results/results", { params })
    );
  }

  // GET /api/students/<student_id>/results
  async getStudentDetailResults(params: {
    student_id: string;
    test_id: string;
    limit?: number;
    offset?: number;
    include_snapshots?: boolean;
  }): Promise<StudentDetailResponse> {
    // We only want to send params the backend expects — keep `student_id` in path
    const { student_id, ...query } = params;
    return this.handleResponse<StudentDetailResponse>(
      privateAxios.get(`/api/faculty/test/results/${student_id}/results`, {
        params: query,
      })
    );
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export individual service functions for easier use
export const testResultsService = {
  getTestResults: (params: {
    test_id: string;
    search?: string;
    limit?: number;
    offset?: number;
    sort_by?: "submitted_at" | "last_autosave" | "total_marks";
    order?: "asc" | "desc";
  }) => apiService.getTestResults(params),

  getStudentDetailResults: (params: {
    student_id: string;
    test_id: string;
    limit?: number;
    offset?: number;
    include_snapshots?: boolean;
  }) => apiService.getStudentDetailResults(params),

  setAuthToken: (token: string) => apiService.setToken(token),

  clearAuthToken: () => apiService.clearToken(),
};

export default testResultsService;
