import { useState } from 'react'

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
  role: '',
  location: '',
  interpretation: '',
  totalYearsExperience: '',
  coreSkills: '',
  recommendations: '',
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useFormState() {
  const [form, setForm] = useState(defaultForm)

  // Summary table
  const [columns, setColumns] = useState(defaultColumns)
  const [summaryRows, setSummaryRows] = useState(defaultSummaryRows)
  const [nextRowId, setNextRowId] = useState(defaultSummaryRows.length + 1)
  const [nextColId, setNextColId] = useState(defaultColumns.length + 1)

  // Key Insights
  const [insights, setInsights] = useState(defaultInsights)
  const [nextInsightId, setNextInsightId] = useState(defaultInsights.length + 1)

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
    setSummaryRows(prev => [...prev, makeEmptyRow(nextRowId, columns)])
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

  // ── Reset ──
  function resetForm() {
    setForm(defaultForm)
    setColumns(defaultColumns)
    setSummaryRows(defaultSummaryRows)
    setNextRowId(defaultSummaryRows.length + 1)
    setNextColId(defaultColumns.length + 1)
    setInsights(defaultInsights)
    setNextInsightId(defaultInsights.length + 1)
  }

  const subject = `Market Capacity Report – ${form.role || '[Role]'} in ${form.location || '[Location]'}`

  return {
    form,
    columns,
    summaryRows,
    insights,
    subject,
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
    resetForm,
  }
}
