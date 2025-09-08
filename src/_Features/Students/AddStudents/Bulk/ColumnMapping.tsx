import React,{useEffect} from 'react';
import { ArrowLeft, Settings, Play, Key, RotateCcw } from 'lucide-react';
import type { ExcelData, ColumnMapping as ColumnMappingType } from './BulkUploadPage';
const PRIMARY_FIELDS = [
  "email",
  "usn",
  "enrollment_number"
];

interface ColumnMappingProps {
  data: ExcelData;
  allowedFields: string[];
  mapping: ColumnMappingType;
  primaryKey: string;
  mode: 'insert' | 'upsert';
  onMappingChange: (mapping: ColumnMappingType) => void;
  onPrimaryKeyChange: (key: string) => void;
  onModeChange: (mode: 'insert' | 'upsert') => void;
  onProcess: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

const ColumnMapping: React.FC<ColumnMappingProps> = ({
  data,
  allowedFields,
  mapping,
  primaryKey,
  mode,
  onMappingChange,
  onPrimaryKeyChange,
  onModeChange,
  onProcess,
  onBack,
  isProcessing
}) => {
  const sanitizeMapping = (rawMapping: ColumnMappingType): ColumnMappingType => {
    const cleaned: ColumnMappingType = {};
    const used = new Set<string>();

    // preserve original header order if possible (iterate data.headers first),
    // then fallback to rawMapping keys to catch any unexpected headers.
    const headersOrder = data.headers ?? Object.keys(rawMapping);

    headersOrder.forEach(header => {
      const field = rawMapping[header];
      if (!field) return;
      if (!used.has(field)) {
        cleaned[header] = field;
        used.add(field);
      }
      // if duplicate, skip it (we preserve the first occurrence)
    });
    // If there are any entries in rawMapping whose headers weren't in data.headers,
    // include them (first occurrence) as well.
    Object.entries(rawMapping).forEach(([h, f]) => {
      if (!f) return;
      if (!(h in cleaned) && !used.has(f)) {
        cleaned[h] = f;
        used.add(f);
      }
    });

    return cleaned;
  };
 // replace handleMappingChange with this
const handleMappingChange = (excelColumn: string, targetField: string) => {
  const newMapping: ColumnMappingType = { ...mapping };

  // If user cleared selection, just remove the mapping for this column
  if (targetField === '') {
    delete newMapping[excelColumn];
    onMappingChange(newMapping);
    return;
  }

  // Remove this targetField from any other excel column so mapping stays unique
  Object.entries(newMapping).forEach(([col, mappedField]) => {
    if (col !== excelColumn && mappedField === targetField) {
      delete newMapping[col];
    }
  });

  // Set mapping for this column
  newMapping[excelColumn] = targetField;

  onMappingChange(newMapping);
};
  // sanitize incoming mapping once on mount / when mapping or headers change.
  useEffect(() => {
    try {
      const cleaned = sanitizeMapping(mapping);
      // only update if different to avoid loops
      const same = JSON.stringify(cleaned) === JSON.stringify(mapping);
      if (!same) {
        onMappingChange(cleaned);
      }
    } catch (err) {
      // be defensive — don't crash UI if something odd happens
      // optionally console.warn here during dev
      // console.warn('Failed to sanitize mapping', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* we deliberately depend on mapping and data.headers */ mapping, JSON.stringify(data.headers)]);



const autoMapSimilar = () => {
  const autoMapping: ColumnMappingType = {};
  const used = new Set<string>();

  data.headers.forEach(header => {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Find exact matches first (but skip if already used)
    let match = allowedFields.find(field => {
      const fieldNormalized = field.toLowerCase().replace(/[^a-z0-9]/g, '');
      return fieldNormalized === normalized && !used.has(field);
    });

    // If no exact match, find partial matches (also skip used)
    if (!match) {
      match = allowedFields.find(field => {
        const fieldNormalized = field.toLowerCase().replace(/[^a-z0-9]/g, '');
        return !used.has(field) && (fieldNormalized.includes(normalized) || normalized.includes(fieldNormalized));
      });
    }

    if (match) {
      autoMapping[header] = match;
      used.add(match);
    }
  });

  onMappingChange(autoMapping);
};

  const clearAllMappings = () => {
    onMappingChange({});
    onPrimaryKeyChange('');
  };

  // Validation rules described by user:
  // - Insert: "name" and "email" must be mapped.
  // - Upsert: primaryKey must be selected AND primaryKey must be mapped AND at least one other mapped field besides primaryKey.

  const mappedFields = Object.values(mapping).filter(Boolean);
  const mappedSet = new Set(mappedFields);

  const isNameMapped = mappedSet.has('name'); // accept exact 'name' only; adjust if you want 'first_name' too
  const isEmailMapped = mappedSet.has('email');

  const hasPrimarySelected = !!primaryKey;
  const isPrimaryMapped = hasPrimarySelected ? mappedSet.has(primaryKey) : false;

  // count mapped fields that are NOT the primary key
  const mappedExcludingPrimary = mappedFields.filter(f => f !== primaryKey);

  const insertValid = isNameMapped && isEmailMapped;
  const upsertValid = hasPrimarySelected && isPrimaryMapped && mappedExcludingPrimary.length >= 1;

  const hasAtLeastOneMapping = Object.keys(mapping).length > 0;
  const canProcess = (mode === 'insert' ? insertValid : upsertValid) && hasAtLeastOneMapping;

  return (
    <div>
          {/* Navigation */}
      <div className="flex justify-between items-center mb-12">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={20} />
          Back to Preview
        </button>
        
        <div className="flex items-center gap-4">
          {/* Validation messages */}
          <div className="text-sm">
            {!hasAtLeastOneMapping && (
              <p className="text-red-600">Please map at least one column.</p>
            )}

            {mode === 'insert' && hasAtLeastOneMapping && !insertValid && (
              <div className="text-red-600">
                <p>Insert requires:</p>
                <ul className="list-disc ml-5">
                  {!isNameMapped && <li>Name must be mapped</li>}
                  {!isEmailMapped && <li>Email must be mapped</li>}
                </ul>
              </div>
            )}

            {mode === 'upsert' && hasAtLeastOneMapping && !upsertValid && (
              <div className="text-red-600">
                <p>Upsert requires:</p>
                <ul className="list-disc ml-5">
                  {!hasPrimarySelected && <li>Select a primary key</li>}
                  {hasPrimarySelected && !isPrimaryMapped && <li>The selected primary key must be mapped</li>}
                  {hasPrimarySelected && isPrimaryMapped && mappedExcludingPrimary.length < 1 && <li>Map at least one additional field besides primary key</li>}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={onProcess}
            disabled={!canProcess || isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Play size={20} />
                Process Data
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#4CA466]" />
          <h2 className="text-2xl font-bold text-gray-900">Column Mapping & Settings</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={autoMapSimilar}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-[#4CA466] text-[#4CA466] rounded-lg hover:bg-green-50 transition-colors"
          >
            <Settings size={16} />
            Auto Map Similar
          </button>
          <button
            onClick={clearAllMappings}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Column Mapping */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Map Excel Columns to Database Fields</h3>
            <p className="text-sm text-gray-600">
              Select the corresponding database field for each Excel column. Unmapped columns will be ignored.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Note: For inserts, <strong>name</strong> and <strong>email</strong> are required. For upserts, select a primary key, ensure the primary key is mapped, and map at least one other field.
            </p>
          </div>

          <div className="space-y-3">
            {data.headers.map((header, index) => {
              const sampleValue = data.rows[0]?.[index];
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{header}</div>
                      {sampleValue && (
                        <div className="text-sm text-gray-500 truncate max-w-xs" title={String(sampleValue)}>
                          Sample: {String(sampleValue)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                <select
  value={mapping[header] || ''}
  onChange={(e) => handleMappingChange(header, e.target.value)}
  className="block w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466]"
>
  <option value="">-- Select Field --</option>
  {allowedFields.map(field => {
    const isAlreadyMapped = Object.entries(mapping).some(
      ([excelCol, mappedField]) =>
        mappedField === field && excelCol !== header
    );

    return (
      <option
        key={field}
        value={field}
        disabled={isAlreadyMapped} // disable if already taken
      >
        {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </option>
    );
  })}
</select>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Primary Key Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Primary Key</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Select the field to use as the primary key for upsert operations.
            </p>
            <select
              value={primaryKey}
              onChange={(e) => onPrimaryKeyChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466]"
              disabled={mode === 'insert'}
            >
              <option value="">-- Select Primary Key --</option>
              {PRIMARY_FIELDS.map(field => (
                <option key={field} value={field}>
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            {mode === 'insert' && (
              <p className="text-xs text-gray-500 mt-2">Primary key not required for insert-only mode</p>
            )}
          </div>

          {/* Mode Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Operation Mode</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="insert"
                  checked={mode === 'insert'}
                  onChange={(e) => onModeChange(e.target.value as 'insert')}
                  className="mt-1 text-[#4CA466] focus:ring-[#4CA466]"
                />
                <div>
                  <div className="font-medium text-gray-900">Insert Only</div>
                  <div className="text-sm text-gray-600">
                    Add new records only. Skip duplicates.
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="upsert"
                  checked={mode === 'upsert'}
                  onChange={(e) => onModeChange(e.target.value as 'upsert')}
                  className="mt-1 text-[#4CA466] focus:ring-[#4CA466]"
                />
                <div>
                  <div className="font-medium text-gray-900">Upsert</div>
                  <div className="text-sm text-gray-600">
                    Insert new records and update existing ones based on primary key.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="text-green-800">
                <strong>{Object.keys(mapping).length}</strong> columns mapped
              </div>
              <div className="text-green-800">
                <strong>{data.rows.length.toLocaleString()}</strong> records to process
              </div>
              <div className="text-green-800">
                Mode: <strong>{mode === 'insert' ? 'Insert Only' : 'Upsert'}</strong>
              </div>
              {primaryKey && (
                <div className="text-green-800">
                  Primary Key: <strong>{primaryKey.replace(/_/g, ' ')}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

  
    </div>
  );
};

export default ColumnMapping;
