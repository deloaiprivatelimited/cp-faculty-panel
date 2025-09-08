import React from 'react';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import type { ExcelData } from './BulkUploadPage';

interface DataPreviewProps {
  data: ExcelData;
  onNext: () => void;
  onBack: () => void;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, onNext, onBack }) => {
  const { headers, rows } = data;
  const previewRows = rows.slice(0, 10); // Show first 10 rows

  return (
    <div>
       {/* Navigation */}
      <div className="flex justify-between mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Upload
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg transition-colors"
        >
          Continue to Mapping
          <ArrowRight size={20} />
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-[#4CA466]" />
          <h2 className="text-2xl font-bold text-gray-900">Data Preview</h2>
        </div>
        <div className="text-sm text-gray-600">
          Total Records: <span className="font-semibold">{rows.length.toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-green-800">
          <strong>Preview:</strong> Showing the first {previewRows.length} rows of your data. 
          Please review the structure before proceeding to column mapping.
        </p>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rowIndex + 1}
                </td>
                {headers.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate"
                    title={String(row[cellIndex] || '')}
                  >
                    {String(row[cellIndex] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > previewRows.length && (
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-600">
          ... and {(rows.length - previewRows.length).toLocaleString()} more rows
        </div>
      )}

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-[#4CA466]">{rows.length.toLocaleString()}</div>
          <div className="text-sm text-green-700">Total Records</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-[#4CA466]">{headers.length}</div>
          <div className="text-sm text-green-700">Columns</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-[#4CA466]">
            {headers.filter(h => h && h.toString().trim()).length}
          </div>
          <div className="text-sm text-green-700">Valid Headers</div>
        </div>
      </div>

     
    </div>
  );
};

export default DataPreview;