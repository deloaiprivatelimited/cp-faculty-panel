import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import type { ExcelData } from './BulkUploadPage';

interface FileUploadProps {
  onFileUpload: (data: ExcelData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const processFile = useCallback((file: File) => {
    setIsProcessing(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          throw new Error('The Excel file appears to be empty');
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        if (headers.length === 0) {
          throw new Error('No headers found in the Excel file');
        }

        onFileUpload({
          headers,
          rows: rows.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process the Excel file');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (!excelFile) {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    processFile(excelFile);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <FileSpreadsheet className="w-16 h-16 text-[#4CA466] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Excel File</h2>
        <p className="text-gray-600">
          Drag and drop your Excel file here, or click to browse. Supports .xlsx and .xls files.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-[#4CA466] bg-green-50' 
            : 'border-gray-300 hover:border-[#4CA466] hover:bg-gray-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CA466] mb-4"></div>
            <p className="text-gray-600">Processing your file...</p>
          </div>
        ) : (
          <div>
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-[#4CA466]' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${isDragOver ? 'text-[#4CA466]' : 'text-gray-700'}`}>
              {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
            </p>
            <p className="text-gray-500 text-sm">Maximum file size: 10MB</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Supported formats: Excel (.xlsx, .xls)
        </p>
      </div>
    </div>
  );
};

export default FileUpload;