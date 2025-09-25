import { useState, useEffect, useCallback } from 'react';
import { testResultsService, StudentDetailResponse } from '../services/api';

interface UseStudentDetailResultsParams {
  student_id: string;
  test_id: string;
  limit?: number;
  offset?: number;
  include_snapshots?: boolean;
}

interface UseStudentDetailResultsReturn {
  data: StudentDetailResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStudentDetailResults = (params: UseStudentDetailResultsParams): UseStudentDetailResultsReturn => {
  const [data, setData] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testResultsService.getStudentDetailResults(params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching student detail results:', err);
    } finally {
      setLoading(false);
    }
  }, [params.student_id, params.test_id, params.limit, params.offset, params.include_snapshots]);

  useEffect(() => {
    if (params.student_id && params.test_id) {
      fetchData();
    }
  }, [fetchData, params.student_id, params.test_id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};