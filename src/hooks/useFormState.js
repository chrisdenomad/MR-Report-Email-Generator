import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'mr_report_form_state'
const TEMPLATES_KEY = 'mr_report_templates'
const SPLIT_PCT_STORAGE = 'mr_report_split_pct'
const MAX_TEMPLATES = 10

// Fix #15: debounce delay for auto-save (ms)
const SAVE_DEBOUNCE_MS = 300

// ── Default columns — Market Capacity ────────────────────────────────────────
export const defaultColumns = [
  { id: 'col1', label: 'Level / Category' },
  { id: 'col2', label: 'Candidates Found' },
  { id: 'col3', label: '%' },
]

// ── Default columns — Salary Benchmark ───────────────────────────────────────
export const defaultSalaryColumns = [
  { id: 'scol1', label: 'Location' },
  { id: 'scol2', label: 'Role' },
  { id: 'scol3', label: 'Seniority' },
  { id: 'scol4', label: 'Min' },
  { id: 'scol5', label: 'Max' },
  { id: 'scol6', label: 'Basis' },
  { id: 'scol7', label: 'Currency' },
  { id: 'scol8', label: 'Data Resources' },
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

const defaultSalarySummaryRows = [
  makeEmptyRow(1, defaultSalaryColumns),
  makeEmptyRow(2, defaultSalaryColumns),
  makeEmptyRow(3, defaultSalaryColumns),
]

// ── Default insights ─────────────────────────────────────────────────────────
const defaultInsights = [
  { id: 1, text: '~XX% of profiles meet Senior+ criteria' },
  { id: 2, text: 'Core technical skills are widely available' },
  { id: 3, text: 'Domain-experienced talent represents ~XX% of the total pool' },
  { id: 4, text: 'Talent concentration is highest in [City / Cities]' },
  { id: 5, text: 'Architect-level profiles show higher competition and longer hiring cycles' },
]

// ── Default opening lines per research type ───────────────────────────────────
export const CAPACITY_OPENING_LINE = 'I would like to share with you the market capacity research for [Role] in [Location].'
export const SALARY_OPENING_LINE = 'I would like to share with you the salary benchmark research for [Role] in [Location].'
export const COMBINED_OPENING_LINE = 'I would like to share with you the market capacity and salary benchmark research for [Role] in [Location].'

// ── Default form ─────────────────────────────────────────────────────────────
const defaultForm = {
  researchType: 'capacity',
  recipientName: '',
  role: '',
  location: '',
  // Content suggestion #1: editable opening line ([Role] and [Location] are interpolated at render time)
  openingLine: CAPACITY_OPENING_LINE,
  interpretation: '',
  methodologyRole: '',
  methodologyRoleOverridden: false,
  methodologyLocation: '',
  methodologyLocationOverridden: false,
  totalYearsExperience: '',
  coreSkills: '',
  recommendations: '',
  // Content suggestion #6: editable closing line
  closingLine: 'Please let me know if you have any questions or would like to explore additional criteria.',
  // Content suggestion #5: toggle chart placeholder visibility
  includeChartPlaceholder: true,
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
      // salary table (used in combined mode)
      salaryColumns: defaultSalaryColumns.map(c => ({ ...c })),
      salaryRows: defaultSalarySummaryRows.map(r => ({ ...r, values: { ...r.values } })),
      nextSalaryRowId: defaultSalarySummaryRows.length + 1,
      nextSalaryColId: defaultSalaryColumns.length + 1,
    }
  }
  // Merge saved form with defaultForm so any new fields added after the user
  // last saved will get their default values instead of coming back as undefined.
  return {
    ...saved,
    form: { ...defaultForm, ...saved.form },
    // back-fill salary table for sessions saved before combined mode existed
    salaryColumns: saved.salaryColumns ?? defaultSalaryColumns.map(c => ({ ...c })),
    salaryRows: saved.salaryRows ?? defaultSalarySummaryRows.map(r => ({ ...r, values: { ...r.values } })),
    nextSalaryRowId: saved.nextSalaryRowId ?? defaultSalarySummaryRows.length + 1,
    nextSalaryColId: saved.nextSalaryColId ?? defaultSalaryColumns.length + 1,
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useFormState() {
  // getInitialState() reads & parses localStorage — call it exactly once per
  // mount by caching the result in a ref before any useState initializers run.
  const initRef = useRef(null)
  function getInit() {
    if (!initRef.current) initRef.current = getInitialState()
    return initRef.current
  }

  const [form, setForm] = useState(() => getInit().form)
  const [columns, setColumns] = useState(() => getInit().columns)
  const [summaryRows, setSummaryRows] = useState(() => getInit().summaryRows)
  const [nextRowId, setNextRowId] = useState(() => getInit().nextRowId)
  const [nextColId, setNextColId] = useState(() => getInit().nextColId)
  const [insights, setInsights] = useState(() => getInit().insights)
  const [nextInsightId, setNextInsightId] = useState(() => getInit().nextInsightId)
  // salary table — used in combined mode
  const [salaryColumns, setSalaryColumns] = useState(() => getInit().salaryColumns)
  const [salaryRows, setSalaryRows] = useState(() => getInit().salaryRows)
  const [nextSalaryRowId, setNextSalaryRowId] = useState(() => getInit().nextSalaryRowId)
  const [nextSalaryColId, setNextSalaryColId] = useState(() => getInit().nextSalaryColId)

  // Fix #15: debounce auto-save — only write to localStorage after SAVE_DEBOUNCE_MS of inactivity
  const saveTimerRef = useRef(null)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      writeToStorage(STORAGE_KEY, {
        form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId,
        salaryColumns, salaryRows, nextSalaryRowId, nextSalaryColId,
      })
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId,
      salaryColumns, salaryRows, nextSalaryRowId, nextSalaryColId])

  // ── Form ──
  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ── Capacity summary rows ──
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

  // ── Capacity columns ──
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

  // ── Salary table rows ──
  function updateSalaryCell(rowId, colId, value) {
    setSalaryRows(prev =>
      prev.map(row =>
        row.id === rowId
          ? { ...row, values: { ...row.values, [colId]: value } }
          : row
      )
    )
  }

  function addSalaryRow() {
    setSalaryRows(prev => {
      const colIds = Object.keys(prev[0]?.values ?? {})
      const values = Object.fromEntries(colIds.map(id => [id, '']))
      return [...prev, { id: nextSalaryRowId, values }]
    })
    setNextSalaryRowId(n => n + 1)
  }

  function removeSalaryRow(id) {
    setSalaryRows(prev => prev.filter(row => row.id !== id))
  }

  // ── Salary columns ──
  function addSalaryColumn() {
    const newColId = `scol${nextSalaryColId}`
    const newCol = { id: newColId, label: 'New Column' }
    setSalaryColumns(prev => [...prev, newCol])
    setSalaryRows(prev =>
      prev.map(row => ({
        ...row,
        values: { ...row.values, [newColId]: '' },
      }))
    )
    setNextSalaryColId(n => n + 1)
  }

  function removeSalaryColumn(colId) {
    setSalaryColumns(prev => prev.filter(col => col.id !== colId))
    setSalaryRows(prev =>
      prev.map(row => {
        const { [colId]: _, ...rest } = row.values
        return { ...row, values: rest }
      })
    )
  }

  function updateSalaryColumnLabel(colId, label) {
    setSalaryColumns(prev =>
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
  function resetForm() {
    setForm({ ...defaultForm })
    setColumns(defaultColumns.map(c => ({ ...c })))
    setSummaryRows(defaultSummaryRows.map(r => ({ ...r, values: { ...r.values } })))
    setNextRowId(defaultSummaryRows.length + 1)
    setNextColId(defaultColumns.length + 1)
    setInsights(defaultInsights.map(i => ({ ...i })))
    setNextInsightId(defaultInsights.length + 1)
    setSalaryColumns(defaultSalaryColumns.map(c => ({ ...c })))
    setSalaryRows(defaultSalarySummaryRows.map(r => ({ ...r, values: { ...r.values } })))
    setNextSalaryRowId(defaultSalarySummaryRows.length + 1)
    setNextSalaryColId(defaultSalaryColumns.length + 1)
    removeFromStorage(STORAGE_KEY)
  }

  // ── Switch research type ──
  // keepData: if true, preserve the existing table(s); if false, reset to the new type's defaults
  function switchResearchType(newType, keepData) {
    const DEFAULT_OPENING = {
      capacity: CAPACITY_OPENING_LINE,
      salary: SALARY_OPENING_LINE,
      combined: COMBINED_OPENING_LINE,
    }
    const currentDefault = DEFAULT_OPENING[form.researchType] ?? CAPACITY_OPENING_LINE
    const newOpeningLine = DEFAULT_OPENING[newType] ?? CAPACITY_OPENING_LINE
    const shouldUpdateOpening = form.openingLine === currentDefault

    setForm(prev => ({
      ...prev,
      researchType: newType,
      ...(shouldUpdateOpening ? { openingLine: newOpeningLine } : {}),
    }))

    if (!keepData) {
      // For combined, reset both tables to their respective defaults.
      // For capacity/salary single types, only reset the "primary" table (columns/summaryRows).
      if (newType === 'combined') {
        setColumns(defaultColumns.map(c => ({ ...c })))
        setSummaryRows(defaultSummaryRows.map(r => ({ ...r, values: { ...r.values } })))
        setNextRowId(defaultSummaryRows.length + 1)
        setNextColId(defaultColumns.length + 1)
        setSalaryColumns(defaultSalaryColumns.map(c => ({ ...c })))
        setSalaryRows(defaultSalarySummaryRows.map(r => ({ ...r, values: { ...r.values } })))
        setNextSalaryRowId(defaultSalarySummaryRows.length + 1)
        setNextSalaryColId(defaultSalaryColumns.length + 1)
      } else if (newType === 'salary') {
        // Switching to single Salary — reset primary table to salary defaults
        setSalaryColumns(defaultSalaryColumns.map(c => ({ ...c })))
        setSalaryRows(defaultSalarySummaryRows.map(r => ({ ...r, values: { ...r.values } })))
        setNextSalaryRowId(defaultSalarySummaryRows.length + 1)
        setNextSalaryColId(defaultSalaryColumns.length + 1)
      } else {
        // Switching to single Capacity — reset primary table to capacity defaults
        setColumns(defaultColumns.map(c => ({ ...c })))
        setSummaryRows(defaultSummaryRows.map(r => ({ ...r, values: { ...r.values } })))
        setNextRowId(defaultSummaryRows.length + 1)
        setNextColId(defaultColumns.length + 1)
      }
    }
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
    setSalaryColumns(saved.salaryColumns ?? defaultSalaryColumns.map(c => ({ ...c })))
    setSalaryRows(saved.salaryRows ?? defaultSalarySummaryRows.map(r => ({ ...r, values: { ...r.values } })))
    setNextSalaryRowId(saved.nextSalaryRowId ?? defaultSalarySummaryRows.length + 1)
    setNextSalaryColId(saved.nextSalaryColId ?? defaultSalaryColumns.length + 1)
  }

  // ── Templates ──
  const [templates, setTemplates] = useState(() => readFromStorage(TEMPLATES_KEY, []))

  function saveTemplate(name) {
    if (!name.trim()) return
    const trimmedName = name.trim()
    const snapshot = {
      form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId,
      salaryColumns, salaryRows, nextSalaryRowId, nextSalaryColId,
    }
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
  // Content suggestion #7: include current month + year in subject line
  const monthYear = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const reportLabel =
    form.researchType === 'salary' ? 'Salary Benchmark Report' :
    form.researchType === 'combined' ? 'Market Capacity & Salary Benchmark Report' :
    'Market Capacity Report'
  const subject = `${reportLabel} – ${form.role || '[Role]'} – ${form.location || '[Location]'} – ${monthYear}`
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
    // salary table
    salaryColumns,
    salaryRows,
    updateSalaryCell,
    addSalaryRow,
    removeSalaryRow,
    addSalaryColumn,
    removeSalaryColumn,
    updateSalaryColumnLabel,
    addInsight,
    removeInsight,
    updateInsight,
    overrideMethodologyRole,
    resetMethodologyRole,
    overrideMethodologyLocation,
    resetMethodologyLocation,
    resetForm,
    switchResearchType,
    restoreState,
    templates,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
  }
}

// ── Fix #18: exported helpers for splitPct persistence (used by App.jsx) ──────
export function loadSplitPct(defaultPct) {
  return readFromStorage(SPLIT_PCT_STORAGE, defaultPct)
}

export function saveSplitPct(pct) {
  writeToStorage(SPLIT_PCT_STORAGE, pct)
}
