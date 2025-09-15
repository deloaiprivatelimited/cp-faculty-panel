// src/components/TestCaseGroups.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchTestcaseGroups,
  createTestcaseGroup,
  updateTestcaseGroup,deleteTestcaseGroup
} from '../services/codingQuestions'; // adjust the path if needed
import { showError, showSuccess } from '../../../../../utils/toast'; // adjust if needed

function TestCaseGroups({ questionId }) {
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set()); // track per-group saving
  const [groups, setGroups] = useState([]);

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'hidden', label: 'Hidden' }
  ];
  const scoringOptions = [
    { value: 'binary', label: 'Binary (Pass/Fail)' },
    { value: 'partial', label: 'Partial Credit' }
  ];

  // ---------- Helpers ----------
  const newLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const normalizeFromApi = (api) => ({
    // persisted groups carry persistedId; local id used for UI key and editing
    id: api.id || newLocalId(),
    persistedId: api.id || null,
    name: api.name || '',
    weight: Number(api.weight ?? 0),
    visibility: api.visibility || 'hidden',
    scoring_strategy: api.scoring_strategy || 'binary',
    cases: (api.cases || []).map((c) => ({
      id: c.id || newLocalId(),
      // API may return "input"; the editor uses "input_text"
      input_text: c.input_text ?? c.input ?? '',
      expected_output: c.expected_output ?? '',
      time_limit_ms: c.time_limit_ms ?? '',
      memory_limit_kb: c.memory_limit_kb ?? ''
    }))
  });

  const denormalizeToApi = (group) => ({
    // For reliability we send inline cases; backend will create TestCase docs
    name: group.name?.trim(),
    weight: Number(group.weight || 0),
    visibility: group.visibility,
    scoring_strategy: group.scoring_strategy,
    cases: (group.cases || []).map((tc) => ({
      input: String(tc.input_text ?? ''),
      expected_output: String(tc.expected_output ?? ''),
      // only send numeric overrides if provided
      ...(tc.time_limit_ms !== '' && tc.time_limit_ms !== null
        ? { time_limit_ms: Number(tc.time_limit_ms) }
        : {}),
      ...(tc.memory_limit_kb !== '' && tc.memory_limit_kb !== null
        ? { memory_limit_kb: Number(tc.memory_limit_kb) }
        : {})
    }))
  });

  // ---------- Load ----------
  const load = async () => {
    if (!questionId) return;
    setLoading(true);
    try {
      const data = await fetchTestcaseGroups(questionId); // { items: [...] }
      console.log(data)
      const items = Array.isArray(data?.items) ? data.items : [];
      setGroups(items.map(normalizeFromApi));
    } catch (err) {
      showError?.(err?.message || 'Failed to load testcase groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // ---------- Local CRUD ----------
  const addGroup = () => {
    const nowId = newLocalId();
    const newGroup = {
      id: nowId,
      persistedId: null,
      name: '',
      weight: 0,
      visibility: 'hidden',
      scoring_strategy: 'binary',
      cases: [
        {
          id: newLocalId(),
          input_text: '',
          expected_output: '',
          time_limit_ms: '',
          memory_limit_kb: ''
        }
      ]
    };
    setGroups((prev) => [...prev, newGroup]);
  };

 // add to imports at top:
// import { ..., deleteTestcaseGroup } from '../services/codingQuestions';

const removeGroup = async (groupId) => {
  const g = groups.find((x) => x.id === groupId);
  if (!g) return;

  // If this group isn't persisted yet, just remove locally
  if (!g.persistedId) {
    setGroups((prev) => prev.filter((gg) => gg.id !== groupId));
    showSuccess?.('Group removed');
    return;
  }

  // Confirm destructive action
  // (optional: remove this if you handle confirmation elsewhere)
  const ok = window.confirm(
    'Delete this test case group and all its testcases? This action cannot be undone.'
  );
  if (!ok) return;

  // optimistic UI: mark as saving/processing
  setSaving(groupId, true);
  try {
    // call backend delete route
    await deleteTestcaseGroup(g.persistedId);

    // remove from UI
    setGroups((prev) => prev.filter((gg) => gg.id !== groupId));

    // also clear any saving flag
    showSuccess?.('Group and its testcases deleted');
  } catch (err) {
    showError?.(err?.message || 'Failed to delete group');
  } finally {
    setSaving(groupId, false);
  }
};


  const updateGroup = (groupId, field, value) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [field]: value } : g))
    );
  };

  const addTestCase = (groupId) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              cases: [
                ...g.cases,
                {
                  id: newLocalId(),
                  input_text: '',
                  expected_output: '',
                  time_limit_ms: '',
                  memory_limit_kb: ''
                }
              ]
            }
          : g
      )
    );
  };

  const removeTestCase = (groupId, caseId) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, cases: g.cases.filter((tc) => tc.id !== caseId) }
          : g
      )
    );
  };

  const updateTestCase = (groupId, caseId, field, value) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              cases: g.cases.map((tc) =>
                tc.id === caseId ? { ...tc, [field]: value } : tc
              )
            }
          : g
      )
    );
  };

  // ---------- Save ----------
  const setSaving = (groupId, on) => {
    setSavingIds((prev) => {
      const copy = new Set(prev);
      if (on) copy.add(groupId);
      else copy.delete(groupId);
      return copy;
    });
  };

  const saveGroup = async (group) => {
    if (!questionId) return;
    setSaving(group.id, true);
    try {
      const payload = denormalizeToApi(group);
      let result;
      if (group.persistedId) {
        result = await updateTestcaseGroup(questionId, {
          groupId: group.persistedId,
          ...payload
        });
        showSuccess?.('Group updated');
      } else {
        result = await createTestcaseGroup(questionId, payload);
        showSuccess?.('Group created');
      }

      // After save, refresh persistedId (and latest server state)
      const newId = result?.id || group.persistedId;
      if (newId && !group.persistedId) {
        // promote local group to persisted
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, persistedId: newId } : g))
        );
      }
      // Optionally reload from server to sync case IDs and timestamps
    //   await load();
    } catch (err) {
      showError?.(err?.message || 'Failed to save group');
    } finally {
      setSaving(group.id, false);
    }
  };

  const saveAll = async () => {
    for (const g of groups) {
      // eslint-disable-next-line no-await-in-loop
      await saveGroup(g);
    }
  };

  const getTotalWeight = useMemo(
    () => groups.reduce((sum, g) => sum + (parseInt(g.weight) || 0), 0),
    [groups]
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="p-6 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Case Groups</h1>
            <p className="text-gray-600 mt-1">
              Manage test case groups for your question
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Total Weight:{' '}
              <span className="font-semibold text-[#4CA466]">{getTotalWeight}</span>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="px-3 py-2 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Reload'}
            </button>
            <button
              onClick={addGroup}
              className="px-4 py-2 bg-[#4CA466] text-white font-medium rounded-lg hover:bg-[#3d8a54] transition-colors"
            >
              Add Group
            </button>
            <button
              onClick={saveAll}
              disabled={loading || savingIds.size > 0}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Save All
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">Loading…</div>
        ) : (
          <div className="space-y-6">
            {groups.map((group, groupIndex) => {
              const isSaving = savingIds.has(group.id);
              return (
                <div
                  key={group.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  {/* Group Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Group {groupIndex + 1}{' '}
                        {group.persistedId ? (
                          <span className="ml-2 text-xs text-gray-500">
                            (id: {group.persistedId})
                          </span>
                        ) : (
                          <span className="ml-2 text-xs text-amber-600">(new)</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => saveGroup(group)}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? 'Saving…' : 'Save'}
                        </button>
                        {groups.length > 1 && (
                          <button
                            onClick={() => removeGroup(group.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove Group
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Group Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Group Name
                        </label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                          placeholder="e.g., basic, edge, performance"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight
                        </label>
                        <input
                          type="number"
                          value={group.weight}
                          onChange={(e) =>
                            updateGroup(group.id, 'weight', parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visibility
                        </label>
                        <select
                          value={group.visibility}
                          onChange={(e) =>
                            updateGroup(group.id, 'visibility', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                        >
                          {visibilityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scoring Strategy
                        </label>
                        <select
                          value={group.scoring_strategy}
                          onChange={(e) =>
                            updateGroup(group.id, 'scoring_strategy', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                        >
                          {scoringOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Test Cases */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Test Cases ({group.cases.length})
                      </h4>
                      <button
                        onClick={() => addTestCase(group.id)}
                        className="px-3 py-1.5 bg-[#4CA466] text-white text-sm font-medium rounded-md hover:bg-[#3d8a54] transition-colors"
                      >
                        Add Test Case
                      </button>
                    </div>

                    <div className="space-y-4">
                      {group.cases.map((testCase, caseIndex) => (
                        <div
                          key={testCase.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-900">
                              Test Case {caseIndex + 1}
                            </h5>
                            {group.cases.length > 1 && (
                              <button
                                onClick={() => removeTestCase(group.id, testCase.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            {/* Input and Expected Output */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Input
                                </label>
                                <textarea
                                  value={testCase.input_text}
                                  onChange={(e) =>
                                    updateTestCase(
                                      group.id,
                                      testCase.id,
                                      'input_text',
                                      e.target.value
                                    )
                                  }
                                  rows="3"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none font-mono"
                                  placeholder="Test case input..."
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Expected Output
                                </label>
                                <textarea
                                  value={testCase.expected_output}
                                  onChange={(e) =>
                                    updateTestCase(
                                      group.id,
                                      testCase.id,
                                      'expected_output',
                                      e.target.value
                                    )
                                  }
                                  rows="3"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none font-mono"
                                  placeholder="Expected output..."
                                />
                              </div>
                            </div>

                            {/* Optional Limits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Time Limit Override (ms)
                                </label>
                                <input
                                  type="number"
                                  value={testCase.time_limit_ms}
                                  onChange={(e) =>
                                    updateTestCase(
                                      group.id,
                                      testCase.id,
                                      'time_limit_ms',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                                  placeholder="Optional override"
                                  min="0"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Memory Limit Override (KB)
                                </label>
                                <input
                                  type="number"
                                  value={testCase.memory_limit_kb}
                                  onChange={(e) =>
                                    updateTestCase(
                                      group.id,
                                      testCase.id,
                                      'memory_limit_kb',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                                  placeholder="Optional override"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {groups.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="text-gray-400 text-lg mb-2">📝</div>
                <p className="text-gray-500 text-sm mb-4">
                  No test case groups created yet
                </p>
                <button
                  onClick={addGroup}
                  className="px-4 py-2 bg-[#4CA466] text-white font-medium rounded-lg hover:bg-[#3d8a54] transition-colors"
                >
                  Create First Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCaseGroups;
