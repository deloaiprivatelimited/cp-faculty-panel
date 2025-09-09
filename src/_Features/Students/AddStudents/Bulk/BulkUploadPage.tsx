// BulkUploadPage.tsx
import React, { useState, useEffect } from "react";
import FileUpload from "./FileUpload";
import DataPreview from "./DataPreview";
import ColumnMapping from "./ColumnMapping";
import { Upload, Database, Settings, CheckCircle } from "lucide-react";
import { privateAxios } from "../../../../utils/axios";
import { showError } from "../../../../utils/toast";

const ALLOWED_FIELDS = [
  "name",
  "gender",
  "date_of_birth",
  "email",
  "phone_number",
  "usn",
  "enrollment_number",
  "branch",
  "year_of_study",
  "semester",
  "cgpa",
  "address",
  "city",
  "state",
  "pincode",
  "guardian_name",
  "guardian_contact",
];
const PRIMARY_FIELDS = ["email", "usn", "enrollment_number"];

export interface ExcelData {
  headers: string[];
  rows: any[][];
}

export interface ColumnMapping {
  [excelColumn: string]: string;
}

type ApiResultItem = {
  index: number;
  status: string;
  message?: string;
  student_id?: string;
  email?: string;
  provided?: any;
};

type ApiResponseShape = {
  success: boolean;
  college: { id: string; name: string };
  created_count?: number; // insert or upsert-created
  updated_count?: number; // upsert-updated
  total_received: number;
  results: ApiResultItem[];
};

const BulkUploadPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<
    "upload" | "preview" | "mapping" | "complete"
  >("upload");
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [primaryKey, setPrimaryKey] = useState<string>("");
  const [mode, setMode] = useState<"insert" | "upsert">("insert");
  const [isProcessing, setIsProcessing] = useState(false);

  // New state to hold API response for the "complete" screen
  const [apiResponse, setApiResponse] = useState<ApiResponseShape | null>(null);

  const handleFileUpload = (data: ExcelData) => {
    setExcelData(data);
    setCurrentStep("preview");

    const autoMapping: ColumnMapping = {};
    data.headers.forEach((header) => {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = ALLOWED_FIELDS.find((field) => {
        const fieldNormalized = field.toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          fieldNormalized.includes(normalized) ||
          normalized.includes(fieldNormalized)
        );
      });
      if (match) {
        autoMapping[header] = match;
      }
    });
    setColumnMapping(autoMapping);
  };

  const handleMapping = (mapping: ColumnMapping) => {
    setColumnMapping(mapping);
    setCurrentStep("mapping");
  };

  const handleProcessData = async () => {
    if (!excelData) return;
    setIsProcessing(true);
    setApiResponse(null);

    // Transform rows -> mapped objects
    const mappedData = excelData.rows.map((row) => {
      const mappedRow: any = {};
      Object.entries(columnMapping).forEach(([excelColumn, targetField]) => {
        const columnIndex = excelData.headers.indexOf(excelColumn);
        if (columnIndex !== -1) {
          let value = row[columnIndex];

          // ✅ Force string for specific fields
          if (
            ["phone_number", "pincode"].includes(targetField) &&
            value !== null &&
            value !== undefined
          ) {
            value = String(value);
          }

          mappedRow[targetField] = value;
        }
      });
      return mappedRow;
    });

    try {
      let resp;
      if (mode === "insert") {
        // insert-only endpoint expects mappedData
        resp = await privateAxios.post<ApiResponseShape>(
          "/students/add-bulk-students",
          { mappedData }
        );
      } else {
        // upsert endpoint expects primaryField + students
        if (!primaryKey) {
          showError("Primary key must be selected for Upsert mode.");
          setIsProcessing(false);
          return;
        }
        resp = await privateAxios.post<ApiResponseShape>(
          "/students/upsert-bulk-students",
          {
            primaryField: primaryKey,
            students: mappedData,
          }
        );
      }

      const data = resp.data;

      if (!data || !data.results) {
        showError("Unexpected response from server");
        setIsProcessing(false);
        return;
      }

      // Save response and switch to complete step
      setApiResponse(data);
      setCurrentStep("complete");
    } catch (err: any) {
      // try to extract message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to Process Data";
      showError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep("upload");
    setExcelData(null);
    setColumnMapping({});
    setPrimaryKey("");
    setMode("insert");
    setApiResponse(null);
    setIsProcessing(false);
  };

  const steps = [
    {
      id: "upload",
      label: "Upload File",
      icon: Upload,
      completed: currentStep !== "upload",
    },
    {
      id: "preview",
      label: "Preview Data",
      icon: Database,
      completed: ["mapping", "complete"].includes(currentStep),
    },
    {
      id: "mapping",
      label: "Map Columns",
      icon: Settings,
      completed: currentStep === "complete",
    },
    {
      id: "complete",
      label: "Complete",
      icon: CheckCircle,
      completed: currentStep === "complete",
    },
  ];

  const statusBadge = (status: string) => {
    const base =
      "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium";
    if (status === "created")
      return (
        <span className={`${base} bg-green-100 text-green-800`}>Created</span>
      );
    if (status === "created_email_failed")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>
          Created (email failed)
        </span>
      );
    if (status === "updated")
      return (
        <span className={`${base} bg-blue-100 text-blue-800`}>Updated</span>
      );
    if (status === "skipped")
      return (
        <span className={`${base} bg-gray-100 text-gray-800`}>Skipped</span>
      );
    return <span className={`${base} bg-red-100 text-red-800`}>{status}</span>;
  };

  // ---------- Download helpers (unchanged) ----------
  const safeString = (v: any) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const stringifyField = (value: any) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const downloadFile = (
    filename: string,
    content: Blob | string,
    mime = "application/octet-stream"
  ) => {
    const blob =
      content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!apiResponse) return;
    const rows = apiResponse.results;

    const headers = [
      "index",
      "status",
      "message",
      "email",
      "student_id",
      "provided",
    ];
    const lines = [];
    lines.push(headers.join(","));

    for (const r of rows) {
      const rowVals = [
        r.index,
        r.status,
        stringifyField(r.message),
        stringifyField(r.email),
        stringifyField(r.student_id),
        stringifyField(r.provided),
      ].map((cell) => {
        const s = safeString(cell);
        if (
          s.includes('"') ||
          s.includes(",") ||
          s.includes("\n") ||
          s.includes("\r")
        ) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      });
      lines.push(rowVals.join(","));
    }

    const csvContent = "\uFEFF" + lines.join("\r\n"); // BOM + CRLF
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(
      `bulk-upload-results-${ts}.csv`,
      csvContent,
      "text/csv;charset=utf-8;"
    );
  };

  const downloadJSON = () => {
    if (!apiResponse) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const pretty = JSON.stringify(apiResponse, null, 2);
    downloadFile(
      `bulk-upload-results-${ts}.json`,
      pretty,
      "application/json;charset=utf-8;"
    );
  };
  // ---------- end download helpers ----------

  return (
    <div className="w-full pl-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bulk Data Upload
        </h1>
        <p className="text-gray-600">
          Upload Excel files and map columns to your database fields
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = step.completed;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${
                    isActive
                      ? "border-[#4CA466] bg-[#4CA466] text-white"
                      : isCompleted
                      ? "border-[#4CA466] bg-[#4CA466] text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }
                `}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={`ml-3 font-medium ${
                    isActive
                      ? "text-[#4CA466]"
                      : isCompleted
                      ? "text-[#4CA466]"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-6 ${
                      step.completed ? "bg-[#4CA466]" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {currentStep === "upload" && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}

        {currentStep === "preview" && excelData && (
          <DataPreview
            data={excelData}
            onNext={() => handleMapping(columnMapping)}
            onBack={() => setCurrentStep("upload")}
          />
        )}

        {currentStep === "mapping" && excelData && (
          <ColumnMapping
            data={excelData}
            allowedFields={ALLOWED_FIELDS}
            mapping={columnMapping}
            primaryKey={primaryKey}
            mode={mode}
            onMappingChange={setColumnMapping}
            onPrimaryKeyChange={setPrimaryKey}
            onModeChange={setMode}
            onProcess={handleProcessData}
            onBack={() => setCurrentStep("preview")}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === "complete" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-12 h-12 text-[#4CA466] mr-4" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upload Complete!
                  </h2>
                  <p className="text-gray-600">
                    {apiResponse
                      ? apiResponse.updated_count !== undefined
                        ? `Processed ${apiResponse.total_received} records — ${
                            apiResponse.created_count ?? 0
                          } created, ${apiResponse.updated_count ?? 0} updated.`
                        : `Processed ${apiResponse.total_received} records — ${
                            apiResponse.created_count ?? 0
                          } created.`
                      : "No response available."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {apiResponse && (
                  <>
                    <button
                      onClick={downloadCSV}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Download CSV
                    </button>
                    <button
                      onClick={downloadJSON}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Download JSON
                    </button>
                  </>
                )}
                <button
                  onClick={resetProcess}
                  className="bg-[#4CA466] hover:bg-[#3d8a54] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Upload Another File
                </button>
              </div>
            </div>

            {!apiResponse && (
              <div className="text-center py-12">
                <p className="text-gray-600">No server response to display.</p>
              </div>
            )}

            {apiResponse && (
              <div className="space-y-6">
                {/* College / summary */}
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">College</div>
                      <div className="font-medium">
                        {apiResponse.college?.name || "-"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {apiResponse.college?.id}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Total received
                      </div>
                      <div className="font-medium">
                        {apiResponse.total_received}
                      </div>
                      <div className="text-sm text-gray-500">Created</div>
                      <div className="font-medium">
                        {apiResponse.created_count ?? 0}
                      </div>
                      {apiResponse.updated_count !== undefined && (
                        <>
                          <div className="text-sm text-gray-500 mt-2">
                            Updated
                          </div>
                          <div className="font-medium">
                            {apiResponse.updated_count ?? 0}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Results table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Message
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Student ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {apiResponse.results.map((r) => (
                        <tr key={r.index}>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {r.index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {statusBadge(r.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {r.message ||
                              (r.provided ? JSON.stringify(r.provided) : "-")}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {r.email || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {r.student_id || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Quick filters / summary */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {apiResponse.results.length} rows
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      apiResponse.results.filter((r) => r.status === "created")
                        .length
                    }{" "}
                    created
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      apiResponse.results.filter(
                        (r) => r.status === "created_email_failed"
                      ).length
                    }{" "}
                    created (email failed)
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      apiResponse.results.filter((r) => r.status === "updated")
                        .length
                    }{" "}
                    updated
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      apiResponse.results.filter((r) => r.status === "skipped")
                        .length
                    }{" "}
                    skipped
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      apiResponse.results.filter(
                        (r) =>
                          ![
                            "created",
                            "created_email_failed",
                            "updated",
                            "skipped",
                          ].includes(r.status)
                      ).length
                    }{" "}
                    errors
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadPage;
