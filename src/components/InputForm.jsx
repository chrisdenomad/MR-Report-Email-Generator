import { useState, useMemo } from 'react'
import ResearchSummaryTable from './ResearchSummaryTable'

const ALL_SECTIONS = ['header', 'summary', 'interpretation', 'insights', 'methodology', 'recommendations']

// B2: Compute how many sections have content
function useProgress(form, summaryRows, columns, insights) {
  return useMemo(() => {
    const filled = [
      !!(form.role || form.location || form.recipientName),
      summaryRows.some(row => columns.some(col => row.values[col.id]?.trim())),
      !!form.interpretation.trim(),
      insights.some(i => i.text.trim()),
      // Note: role/location auto-fill from header, so only count unique fields
      !!(form.totalYearsExperience || form.coreSkills),
      !!form.recommendations.trim(),
    ]
    const count = filled.filter(Boolean).length
    return { count, total: filled.length, pct: Math.round((count / filled.length) * 100) }
  }, [form, summaryRows, columns, insights])
}

// Fix #1 + #21: Section lifted to module scope; uses <button> for keyboard accessibility
function Section({ id, title, children, isOpen, onToggle }) {
  const open = isOpen(id)
  return (
    <div className="form-section">
      <button
        type="button"
        className="form-section-header"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        aria-controls={`section-body-${id}`}
      >
        <span className="form-section-title">{title}</span>
        <span className="form-section-chevron" aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>
      <div
        id={`section-body-${id}`}
        className={`form-section-body${open ? ' open' : ''}`}
      >
        {children}
      </div>
    </div>
  )
}

export default function InputForm({
  form,
  columns,
  summaryRows,
  insights,
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
}) {
  const [openSections, setOpenSections] = useState(new Set(ALL_SECTIONS))

  function toggleSection(id) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function isOpen(id) { return openSections.has(id) }

  const progress = useProgress(form, summaryRows, columns, insights)

  return (
    <div className="form-panel">
      {/* B2: Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div className="progress-bar-label">
          <span>{progress.count}</span> / {progress.total} sections filled
        </div>
      </div>

      <div className="form-panel-scroll">

        {/* ── Header ── */}
        <Section id="header" title="Header" isOpen={isOpen} onToggle={toggleSection}>
          <div className="form-group mb-10">
            <label htmlFor="field-recipientName">Recipient Name</label>
            <input
              id="field-recipientName"
              type="text"
              value={form.recipientName}
              placeholder="e.g. Sarah"
              onChange={e => updateField('recipientName', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field-role">Role (A)</label>
              <input
                id="field-role"
                type="text"
                value={form.role}
                placeholder="e.g. Java Developer"
                onChange={e => updateField('role', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="field-location">Location (B)</label>
              <input
                id="field-location"
                type="text"
                value={form.location}
                placeholder="e.g. Poland"
                onChange={e => updateField('location', e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* ── Research Summary ── */}
        <Section id="summary" title="Research Summary" isOpen={isOpen} onToggle={toggleSection}>
          <ResearchSummaryTable
            columns={columns}
            rows={summaryRows}
            onUpdateCell={updateSummaryCell}
            onAddRow={addSummaryRow}
            onRemoveRow={removeSummaryRow}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onUpdateColumnLabel={updateColumnLabel}
          />
        </Section>

        {/* ── Interpretation ── */}
        <Section id="interpretation" title="Interpretation" isOpen={isOpen} onToggle={toggleSection}>
          <div className="form-group">
            <label htmlFor="field-interpretation">Interpretation sentence</label>
            <textarea
              id="field-interpretation"
              rows={3}
              value={form.interpretation}
              placeholder='e.g. "The market shows strong Senior-level depth, with moderate scarcity at Architect level."'
              onChange={e => updateField('interpretation', e.target.value)}
            />
          </div>
        </Section>

        {/* ── Key Insights ── */}
        <Section id="insights" title="Key Insights" isOpen={isOpen} onToggle={toggleSection}>
          <div className="insights-list">
            {insights.map((item, index) => (
              <div key={item.id} className="insight-row">
                <span className="insight-bullet" aria-hidden="true">•</span>
                <input
                  type="text"
                  className="insight-input"
                  id={`field-insight-${item.id}`}
                  aria-label={`Key insight ${index + 1}`}
                  value={item.text}
                  placeholder={`Insight ${index + 1}`}
                  onChange={e => updateInsight(item.id, e.target.value)}
                />
                <button
                  className="btn-remove-row"
                  onClick={() => removeInsight(item.id)}
                  aria-label={`Remove insight ${index + 1}`}
                  title="Remove insight"
                  disabled={insights.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button className="btn-add-row insights-add-btn" onClick={addInsight}>
            + Add Insight
          </button>
        </Section>

        {/* ── Search Methodology ── */}
        <Section id="methodology" title="Search Methodology" isOpen={isOpen} onToggle={toggleSection}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field-methodologyRole">
                Role
                {form.methodologyRoleOverridden
                  ? <button className="btn-sync-reset" onClick={resetMethodologyRole} title="Reset to header value">↺ sync</button>
                  : <span className="synced-badge">synced</span>
                }
              </label>
              <input
                id="field-methodologyRole"
                type="text"
                value={effectiveMethodologyRole}
                placeholder={form.role || 'Auto-filled from Role field'}
                onChange={e => overrideMethodologyRole(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="field-methodologyLocation">
                Location
                {form.methodologyLocationOverridden
                  ? <button className="btn-sync-reset" onClick={resetMethodologyLocation} title="Reset to header value">↺ sync</button>
                  : <span className="synced-badge">synced</span>
                }
              </label>
              <input
                id="field-methodologyLocation"
                type="text"
                value={effectiveMethodologyLocation}
                placeholder={form.location || 'Auto-filled from Location field'}
                onChange={e => overrideMethodologyLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field-experience">Total Years of Experience</label>
              <input
                id="field-experience"
                type="text"
                value={form.totalYearsExperience}
                placeholder="e.g. 5+ years"
                onChange={e => updateField('totalYearsExperience', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="field-coreSkills">Core Skills / Keywords</label>
            <input
              id="field-coreSkills"
              type="text"
              value={form.coreSkills}
              placeholder="e.g. Java, Spring Boot, Microservices"
              onChange={e => updateField('coreSkills', e.target.value)}
            />
          </div>
        </Section>

        {/* ── Recommendations ── */}
        <Section id="recommendations" title="Recommendations" isOpen={isOpen} onToggle={toggleSection}>
          <div className="form-group">
            <label htmlFor="field-recommendations">Recommendations</label>
            <textarea
              id="field-recommendations"
              rows={5}
              value={form.recommendations}
              placeholder="Enter your recommendations for the hiring manager..."
              onChange={e => updateField('recommendations', e.target.value)}
            />
          </div>
        </Section>

        {/* Reset */}
        <div className="btn-reset-container">
          <button className="btn-reset" onClick={resetForm}>
            Reset Form
          </button>
        </div>

      </div>
    </div>
  )
}
