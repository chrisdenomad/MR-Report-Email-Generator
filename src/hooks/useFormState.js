import { useState, useEffect } from 'react'

const STORAGE_KEY = 'mr_report_form_state'
const TEMPLATES_KEY = 'mr_report_templates'
const MAX_TEMPLATES = 10

// ── Default columns ──────────────────────────────────────────────────────────
const defaultColumns = [
  { id: 'col1', label: 'Level / Category' },
  { id: 'col2', label: 'Candidates Found' },
  { id: 'col3', label: '%' },
]

function makeEmptyRow(id, columns) {
  const values = {}
  columns.forEach(col => { values[col.id] = '' })
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

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage quota exceeded or unavailable — fail silently
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // fail silently
  }
}

// ── Template helpers ─────────────────────────────────────────────────────────
function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveTemplates(templates) {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  } catch {
    // fail silently
  }
}

// ── Restore or fall back to defaults ────────────────────────────────────────
function getInitialState() {
  const saved = loadFromStorage()
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
  const initial = getInitialState()

  const [form, setForm] = useState(initial.form)
  const [columns, setColumns] = useState(initial.columns)
  const [summaryRows, setSummaryRows] = useState(initial.summaryRows)
  const [nextRowId, setNextRowId] = useState(initial.nextRowId)
  const [nextColId, setNextColId] = useState(initial.nextColId)
  const [insights, setInsights] = useState(initial.insights)
  const [nextInsightId, setNextInsightId] = useState(initial.nextInsightId)

  // ── Auto-save on every change ──
  useEffect(() => {
    saveToStorage({ form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId })
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
      const values = {}
      colIds.forEach(id => { values[id] = '' })
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
        const values = { ...row.values }
        delete values[colId]
        return { ...row, values }
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
    clearStorage()
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
  const [templates, setTemplates] = useState(() => loadTemplates())

  function saveTemplate(name) {
    if (!name.trim()) return
    const snapshot = { form, columns, summaryRows, nextRowId, nextColId, insights, nextInsightId }
    setTemplates(prev => {
      const filtered = prev.filter(t => t.name !== name.trim())
      const updated = [{ name: name.trim(), snapshot, savedAt: Date.now() }, ...filtered].slice(0, MAX_TEMPLATES)
      saveTemplates(updated)
      return updated
    })
  }

  function deleteTemplate(name) {
    setTemplates(prev => {
      const updated = prev.filter(t => t.name !== name)
      saveTemplates(updated)
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
  }
}
