import { useState, useEffect, useCallback } from 'react';
import { testResultsService, TestResult, TestResultsListResponse } from '../services/api';

interface UseTestResultsParams {
  test_id: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'submitted_at' | 'last_autosave' | 'total_marks';
  order?: 'asc' | 'desc';
}

interface UseTestResultsReturn {
  data: TestResultsListResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTestResults = (params: UseTestResultsParams): UseTestResultsReturn => {
  const [data, setData] = useState<TestResultsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testResultsService.getTestResults(params);
      console.log("resp",response)
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching test results:', err);
    } finally {
      setLoading(false);
    }
  }, [params.test_id, params.search, params.limit, params.offset, params.sort_by, params.order]);

  useEffect(() => {
    if (params.test_id) {
      fetchData();
    }
  }, [fetchData, params.test_id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};