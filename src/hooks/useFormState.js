import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'mr_report_form_state'
const TEMPLATES_KEY = 'mr_report_templates'
const API_KEY_STORAGE = 'mr_report_api_key'
const API_KEY_NOTE_STORAGE = 'mr_report_api_key_note'
const SPLIT_PCT_STORAGE = 'mr_report_split_pct'
const MAX_TEMPLATES = 10

// Fix #15: debounce delay for auto-save (ms)
const SAVE_DEBOUNCE_MS = 300

// ── Default columns ──────────────────────────────────────────────────────────
const defaultColumns = [
  { id: 'col1', label: 'Level / Category' },
  { id: 'col2', label: 'Candidates Found' },
  { id: 'col3', label: '%' },
]

function makeEmptyRow(id, columns) {
  const values = Object.fromEntries(columns.map(col => [col.id, '']))
  return { id, values }
}

const defaultSummaryRows = [
  makeEmptyRow(1, defaultColumns),
  makeEmptyRow(2, defaultColumns),
  makeEmptyRow(3, defaultColumns),
]

// ── Default insights ─────────────────────────────────────────────────────────
const defaultInsights = [
  { id: 1, text: '~XX% of profiles meet Senior+ criteria' },
  { id: 2, text: 'Core technical skills are widely available' },
  { id: 3, text: 'Domain-experienced talent represents ~XX% of the total pool' },
  { id: 4, text: 'Talent concentration is highest in [City / Cities]' },
  { id: 5, text: 'Architect-level profiles show higher competition and longer hiring cycles' },
]

// ── Default form ─────────────────────────────────────────────────────────────
const defaultForm = {
  recipientName: '',
  role: '',
  location: '',
  interpretation: '',
  methodologyRole: '',
  methodologyRoleOverridden: false,
  methodologyLocation: '',
  methodologyLocationOverridden: false,
  totalYearsExperience: '',
  coreSkills: '',
  recommendations: '',
}

// ── Fix #9: consolidated localStorage helpers ─────────────────────────────────
function readFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // fail silently
  }
}

// ── Restore or fall back to defaults ────────────────────────────────────────
function getInitialState() {
  const saved = readFromStorage(STORAGE_KEY, null)
  if (!saved) {
    return {
      form: { ...defaultForm },
      columns: defaultColumns.map(c => ({ ...c })),
      summaryRows: defaultSummaryRows.map(r => ({ ...r, values: { ...r.values } })),
      nextRowId: defaultSummaryRows.length + 1,
      nextColId: defaultColumns.length + 1,
      insights: defaultInsights.map(i => ({ ...i })),
      nextInsightId: defaultInsights.length + 1,
    }
  }
  return saved
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useFormState() {
  // Fix #12: lazy initializer — getInitialState() runs only once, not on every render
  const [form, setForm] = useState(() => getInitialState().form)
  const [columns, setColumns] = useState(() => getInitialState().columns)
  const [summaryRows, setSummaryRows] = useState(() => getInitialState().summaryRows)
  const [nextRowId, setNextRowId] = useState(() => getInitialState().nextRowId)
  const [nextColId, setNextColId] = useState(() => getInitialState().nextColId)
  const [insights, setInsights] = useState(() => getInitialState().insights)
  const [nextInsightId, setNextInsightId] = useState(() => getInitialState().nextInsightId)

  // Fix #15: debounce auto-save — only write to localStorage after SAVE_DEBOUNCE_MS of inactivity
  const saveTimerRef = useRef(null)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      writeToStorage(STORAGE_KEY, { form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId })
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId])

  // ── Form ──
  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ── Summary rows ──
  function updateSummaryCell(rowId, colId, value) {
    setSummaryRows(prev =>
      prev.map(row =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [colId]: value } }
          : row
      )
    )
  }

  function addSummaryRow() {
    setSummaryRows(prev => {
      const colIds = Object.keys(prev[0]?.values ?? {})
      const values = Object.fromEntries(colIds.map(id => [id, '']))
      return [...prev, { id: nextRowId, values }]
    })
    setNextRowId(n => n + 1)
  }

  function removeSummaryRow(id) {
    setSummaryRows(prev => prev.filter(row => row.id !== id))
  }

  // ── Columns ──
  function addColumn() {
    const newColId = `col${nextColId}`
    const newCol = { id: newColId, label: 'New Column' }
    setColumns(prev => [...prev, newCol])
    setSummaryRows(prev =>
      prev.map(row => ({
        ...row,
        values: { ...row.values, [newColId]: '' },
      }))
    )
    setNextColId(n => n + 1)
  }

  function removeColumn(colId) {
    setColumns(prev => prev.filter(col => col.id !== colId))
    setSummaryRows(prev =>
      prev.map(row => {
        const { [colId]: _, ...rest } = row.values
        return { ...row, values: rest }
      })
    )
  }

  function updateColumnLabel(colId, label) {
    setColumns(prev =>
      prev.map(col => (col.id === colId ? { ...col, label } : col))
    )
  }

  // ── Insights ──
  function addInsight() {
    setInsights(prev => [...prev, { id: nextInsightId, text: '' }])
    setNextInsightId(n => n + 1)
  }

  function removeInsight(id) {
    setInsights(prev => prev.filter(item => item.id !== id))
  }

  function updateInsight(id, text) {
    setInsights(prev =>
      prev.map(item => (item.id === id ? { ...item, text } : item))
    )
  }

  // Fix #4: atomic replacement of all insights at once (used by AI insights handler)
  function replaceInsights(newInsights) {
    const maxId = newInsights.reduce((max, i) => Math.max(max, i.id), 0)
    setInsights(newInsights)
    setNextInsightId(maxId + 1)
  }

  // ── Methodology overrides ──
  function overrideMethodologyRole(value) {
    setForm(prev => ({
      ...prev,
      methodologyRole: value,
      methodologyRoleOverridden: value.trim() !== '',
    }))
  }

  function resetMethodologyRole() {
    setForm(prev => ({ ...prev, methodologyRole: '', methodologyRoleOverridden: false }))
  }

  function overrideMethodologyLocation(value) {
    setForm(prev => ({
      ...prev,
      methodologyLocation: value,
      methodologyLocationOverridden: value.trim() !== '',
    }))
  }

  function resetMethodologyLocation() {
    setForm(prev => ({ ...prev, methodologyLocation: '', methodologyLocationOverridden: false }))
  }

  // ── Reset ──
  // Note: only clears form state — templates and API key are preserved intentionally
  function resetForm() {
    setForm({ ...defaultForm })
    setColumns(defaultColumns.map(c => ({ ...c })))
    setSummaryRows(defaultSummaryRows.map(r => ({ ...r, values: { ...r.values } })))
    setNextRowId(defaultSummaryRows.length + 1)
    setNextColId(defaultColumns.length + 1)
    setInsights(defaultInsights.map(i => ({ ...i })))
    setNextInsightId(defaultInsights.length + 1)
    removeFromStorage(STORAGE_KEY)
  }

  // ── Bulk restore (used by template loader) ──
  function restoreState(saved) {
    setForm({ ...defaultForm, ...saved.form })
    setColumns(saved.columns ?? defaultColumns.map(c => ({ ...c })))
    setSummaryRows(saved.summaryRows ?? defaultSummaryRows.map(r => ({ ...r, values: { ...r.values } })))
    setNextRowId(saved.nextRowId ?? defaultSummaryRows.length + 1)
    setNextColId(saved.nextColId ?? defaultColumns.length + 1)
    setInsights(saved.insights ?? defaultInsights.map(i => ({ ...i })))
    setNextInsightId(saved.nextInsightId ?? defaultInsights.length + 1)
  }

  // ── Templates ──
  const [templates, setTemplates] = useState(() => readFromStorage(TEMPLATES_KEY, []))

  // ── API Key (persisted separately, never in form snapshots) ──
  const [apiKey, setApiKeyState] = useState(() => {
    try { return localStorage.getItem(API_KEY_STORAGE) || '' } catch { return '' }
  })

  function saveApiKey(key) {
    const trimmed = key.trim()
    setApiKeyState(trimmed)
    if (trimmed) {
      writeToStorage(API_KEY_STORAGE, trimmed)
    } else {
      removeFromStorage(API_KEY_STORAGE)
    }
  }

  // ── API Key Note ──
  const [apiKeyNote, setApiKeyNoteState] = useState(() => {
    try { return localStorage.getItem(API_KEY_NOTE_STORAGE) || '' } catch { return '' }
  })

  function saveApiKeyNote(text) {
    setApiKeyNoteState(text)
    if (text.trim()) {
      writeToStorage(API_KEY_NOTE_STORAGE, text)
    } else {
      removeFromStorage(API_KEY_NOTE_STORAGE)
    }
  }

  function saveTemplate(name) {
    if (!name.trim()) return
    const trimmedName = name.trim()
    const snapshot = { form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId }
    setTemplates(prev => {
      const filtered = prev.filter(t => t.name !== trimmedName)
      const updated = [{ name: trimmedName, snapshot, savedAt: Date.now() }, ...filtered].slice(0, MAX_TEMPLATES)
      writeToStorage(TEMPLATES_KEY, updated)
      return updated
    })
  }

  function deleteTemplate(name) {
    setTemplates(prev => {
      const updated = prev.filter(t => t.name !== name)
      writeToStorage(TEMPLATES_KEY, updated)
      return updated
    })
  }

  function loadTemplate(name) {
    const tpl = templates.find(t => t.name === name)
    if (tpl) restoreState(tpl.snapshot)
  }

  // ── Computed values ──
  const subject = `Market Capacity Report – ${form.role || '[Role]'} in ${form.location || '[Location]'}`
  const effectiveMethodologyRole = form.methodologyRoleOverridden ? form.methodologyRole : form.role
  const effectiveMethodologyLocation = form.methodologyLocationOverridden ? form.methodologyLocation : form.location

  return {
    form,
    columns,
    summaryRows,
    insights,
    subject,
    effectiveMethodologyRole,
    effectiveMethodologyLocation,
    updateField,
    updateSummaryCell,
    addSummaryRow,
    removeSummaryRow,
    addColumn,
    removeColumn,
    updateColumnLabel,
    addInsight,
    removeInsight,
    updateInsight,
    replaceInsights,
    overrideMethodologyRole,
    resetMethodologyRole,
    overrideMethodologyLocation,
    resetMethodologyLocation,
    resetForm,
    restoreState,
    templates,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
    apiKey,
    saveApiKey,
    apiKeyNote,
    saveApiKeyNote,
  }
}

// ── Fix #18: exported helpers for splitPct persistence (used by App.jsx) ──────
export function loadSplitPct(defaultPct) {
  return readFromStorage(SPLIT_PCT_STORAGE, defaultPct)
}

export function saveSplitPct(pct) {
  writeToStorage(SPLIT_PCT_STORAGE, pct)
}
