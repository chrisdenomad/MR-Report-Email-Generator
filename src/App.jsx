import { useState, useCallback, useRef, useEffect } from 'react'
import { useFormState } from './hooks/useFormState'
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
    addInsight,
    removeInsight,
    updateInsight,
    overrideMethodologyRole,
    resetMethodologyRole,
    overrideMethodologyLocation,
    resetMethodologyLocation,
    resetForm,
    templates,
    saveTemplate,
    deleteTemplate,
    loadTemplate,
  } = useFormState()

  const [splitPct, setSplitPct] = useState(DEFAULT_PCT)
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
    setSplitPct(Math.min(MAX_PCT, Math.max(MIN_PCT, rawPct)))
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
    setSplitPct(Math.min(MAX_PCT, Math.max(MIN_PCT, rawPct)))
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
  }, [])

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="logo-bar" />
        <h1>
          MR Report <span>Email Generator</span>
        </h1>
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
          effectiveMethodologyRole={effectiveMethodologyRole}
          effectiveMethodologyLocation={effectiveMethodologyLocation}
          updateField={updateField}
          updateSummaryCell={updateSummaryCell}
          addSummaryRow={addSummaryRow}
          removeSummaryRow={removeSummaryRow}
          addColumn={addColumn}
          removeColumn={removeColumn}
          updateColumnLabel={updateColumnLabel}
          addInsight={addInsight}
          removeInsight={removeInsight}
          updateInsight={updateInsight}
          overrideMethodologyRole={overrideMethodologyRole}
          resetMethodologyRole={resetMethodologyRole}
          overrideMethodologyLocation={overrideMethodologyLocation}
          resetMethodologyLocation={resetMethodologyLocation}
          resetForm={resetForm}
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
        />
      </div>
    </div>
  )
}
