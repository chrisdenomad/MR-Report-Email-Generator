import { useState, useCallback, useRef, useEffect } from 'react'
import { useFormState, loadSplitPct, saveSplitPct } from './hooks/useFormState'
import InputForm from './components/InputForm'
import EmailPreview from './components/EmailPreview'
import './index.css'

const MIN_PCT = 20   // minimum panel width in percent
const MAX_PCT = 80   // maximum panel width in percent
const DEFAULT_PCT = 46

export default function App() {
  const {
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
    templates,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
  } = useFormState()

  // ── Theme toggle (light default) ──
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mr_report_theme') || 'light' } catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('mr_report_theme', theme) } catch {}
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  // Fix #18: restore last used split ratio from localStorage
  const [splitPct, setSplitPct] = useState(() => loadSplitPct(DEFAULT_PCT))
  const [isDragging, setIsDragging] = useState(false)
  const bodyRef = useRef(null)

  const onMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isDragging || !bodyRef.current) return
    const rect = bodyRef.current.getBoundingClientRect()
    const rawPct = ((e.clientX - rect.left) / rect.width) * 100
    const clamped = Math.min(MAX_PCT, Math.max(MIN_PCT, rawPct))
    setSplitPct(clamped)
    saveSplitPct(clamped)
  }, [isDragging])

  const onMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch support
  const onTouchMove = useCallback((e) => {
    if (!isDragging || !bodyRef.current) return
    const touch = e.touches[0]
    const rect = bodyRef.current.getBoundingClientRect()
    const rawPct = ((touch.clientX - rect.left) / rect.width) * 100
    const clamped = Math.min(MAX_PCT, Math.max(MIN_PCT, rawPct))
    setSplitPct(clamped)
    saveSplitPct(clamped)
  }, [isDragging])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('touchend', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [isDragging, onMouseMove, onMouseUp, onTouchMove])

  // Double-click to reset to default split
  const onDoubleClick = useCallback(() => {
    setSplitPct(DEFAULT_PCT)
    saveSplitPct(DEFAULT_PCT)
  }, [])

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="logo-bar" />
        <h1>
          MR Report <span>Email Generator</span>
        </h1>
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            /* Moon icon — click to go dark */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            /* Sun icon — click to go light */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          )}
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <div
        className={`app-body${isDragging ? ' is-dragging' : ''}`}
        ref={bodyRef}
      >
        {/* InputForm owns its .form-panel wrapper; width driven by splitPct */}
        <InputForm
          style={{ width: `${splitPct}%` }}
          form={form}
          columns={columns}
          summaryRows={summaryRows}
          insights={insights}
          salaryColumns={salaryColumns}
          salaryRows={salaryRows}
          effectiveMethodologyRole={effectiveMethodologyRole}
          effectiveMethodologyLocation={effectiveMethodologyLocation}
          updateField={updateField}
          updateSummaryCell={updateSummaryCell}
          addSummaryRow={addSummaryRow}
          removeSummaryRow={removeSummaryRow}
          addColumn={addColumn}
          removeColumn={removeColumn}
          updateColumnLabel={updateColumnLabel}
          updateSalaryCell={updateSalaryCell}
          addSalaryRow={addSalaryRow}
          removeSalaryRow={removeSalaryRow}
          addSalaryColumn={addSalaryColumn}
          removeSalaryColumn={removeSalaryColumn}
          updateSalaryColumnLabel={updateSalaryColumnLabel}
          addInsight={addInsight}
          removeInsight={removeInsight}
          updateInsight={updateInsight}
          overrideMethodologyRole={overrideMethodologyRole}
          resetMethodologyRole={resetMethodologyRole}
          overrideMethodologyLocation={overrideMethodologyLocation}
          resetMethodologyLocation={resetMethodologyLocation}
          resetForm={resetForm}
          switchResearchType={switchResearchType}
          templates={templates}
          saveTemplate={saveTemplate}
          deleteTemplate={deleteTemplate}
          loadTemplate={loadTemplate}
        />

        {/* Drag handle */}
        <div
          className={`panel-divider${isDragging ? ' active' : ''}`}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          onDoubleClick={onDoubleClick}
          title="Drag to resize · Double-click to reset"
          role="separator"
          aria-label="Resize panels"
          aria-orientation="vertical"
        >
          <div className="panel-divider-grip" />
        </div>

        {/* EmailPreview owns its .preview-panel wrapper; takes remaining space */}
        <EmailPreview
          form={form}
          columns={columns}
          summaryRows={summaryRows}
          insights={insights}
          subject={subject}
          effectiveMethodologyRole={effectiveMethodologyRole}
          effectiveMethodologyLocation={effectiveMethodologyLocation}
          salaryColumns={salaryColumns}
          salaryRows={salaryRows}
          resetForm={resetForm}
        />
      </div>
    </div>
  )
}
