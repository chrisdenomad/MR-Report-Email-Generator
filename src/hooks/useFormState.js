import { useState } from 'react'

const defaultSummaryRows = [
  { id: 1, level: '', candidates: '', percent: '' },
  { id: 2, level: '', candidates: '', percent: '' },
  { id: 3, level: '', candidates: '', percent: '' },
]

const defaultForm = {
  // Header
  role: '',
  location: '',

  // Interpretation
  interpretation: '',
  whatDoesThisMean: '',
  isThisRisky: '',
  canWeScale: '',

  // Search Methodology
  totalYearsExperience: '',
  coreSkills: '',

  // Key Insights
  seniorPlusPercent: '',
  skillsAvailability: 'widely available',
  domainExperiencedPercent: '',
  talentConcentrationCity: '',
  architectNote: 'Architect-level profiles show higher competition and longer hiring cycles',

  // Recommendations
  recommendations: '',
}

export function useFormState() {
  const [form, setForm] = useState(defaultForm)
  const [summaryRows, setSummaryRows] = useState(defaultSummaryRows)
  const [nextId, setNextId] = useState(defaultSummaryRows.length + 1)

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateSummaryRow(id, field, value) {
    setSummaryRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  function addSummaryRow() {
    setSummaryRows(prev => [
      ...prev,
      { id: nextId, level: '', candidates: '', percent: '' },
    ])
    setNextId(n => n + 1)
  }

  function removeSummaryRow(id) {
    setSummaryRows(prev => prev.filter(row => row.id !== id))
  }

  function resetForm() {
    setForm(defaultForm)
    setSummaryRows(defaultSummaryRows)
    setNextId(defaultSummaryRows.length + 1)
  }

  const subject = `Market Capacity Report – ${form.role || '[Role]'} in ${form.location || '[Location]'}`

  return {
    form,
    summaryRows,
    subject,
    updateField,
    updateSummaryRow,
    addSummaryRow,
    removeSummaryRow,
    resetForm,
  }
}
