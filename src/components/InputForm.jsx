import { useState, useMemo } from 'react'
import ResearchSummaryTable from './ResearchSummaryTable'

const ALL_SECTIONS = ['header', 'summary', 'interpretation', 'insights', 'methodology', 'recommendations']

// B2: Compute how many sections have content
function useProgress(form, summaryRows, columns, insights) {
  return useMemo(() => {
    const filled = [
      // Header
      !!(form.role || form.location || form.recipientName),
      // Research Summary
      summaryRows.some(row => columns.some(col => row.values[col.id]?.trim())),
      // Interpretation
      !!form.interpretation.trim(),
      // Key Insights
      insights.some(i => i.text.trim()),
      // Search Methodology
      !!(form.totalYearsExperience || form.coreSkills),
      // Recommendations
      !!form.recommendations.trim(),
    ]
    const count = filled.filter(Boolean).length
    return { count, total: filled.length, pct: Math.round((count / filled.length) * 100) }
  }, [form, summaryRows, columns, insights])
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
  // B1: Collapsible — all open by default
  const [openSections, setOpenSections] = useState(new Set(ALL_SECTIONS))

  function toggleSection(id) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function isOpen(id) { return openSections.has(id) }

  // B2: Progress
  const progress = useProgress(form, summaryRows, columns, insights)

  // Helper: render a collapsible section
  function Section({ id, title, children }) {
    const open = isOpen(id)
    return (
      <div className="form-section">
        <div className="form-section-header" onClick={() => toggleSection(id)}>
          <span className="form-section-title">{title}</span>
          <span className={`form-section-chevron${open ? ' open' : ''}`}>▼</span>
        </div>
        <div className={`form-section-body${open ? ' open' : ''}`}>
          {children}
        </div>
      </div>
    )
  }

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
        <Section id="header" title="Header">
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Recipient Name</label>
            <input
              type="text"
              value={form.recipientName}
              placeholder="e.g. Sarah"
              onChange={e => updateField('recipientName', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role (A)</label>
              <input
                type="text"
                value={form.role}
                placeholder="e.g. Java Developer"
                onChange={e => updateField('role', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Location (B)</label>
              <input
                type="text"
                value={form.location}
                placeholder="e.g. Poland"
                onChange={e => updateField('location', e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* ── Research Summary ── */}
        <Section id="summary" title="Research Summary">
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
        <Section id="interpretation" title="Interpretation">
          <div className="form-group">
            <label>Interpretation sentence</label>
            <textarea
              rows={3}
              value={form.interpretation}
              placeholder='e.g. "The market shows strong Senior-level depth, with moderate scarcity at Architect level."'
              onChange={e => updateField('interpretation', e.target.value)}
            />
          </div>
        </Section>

        {/* ── Key Insights ── */}
        <Section id="insights" title="Key Insights">
          <div className="insights-list">
            {insights.map((item, index) => (
              <div key={item.id} className="insight-row">
                <span className="insight-bullet">•</span>
                <input
                  type="text"
                  className="insight-input"
                  value={item.text}
                  placeholder={`Insight ${index + 1}`}
                  onChange={e => updateInsight(item.id, e.target.value)}
                />
                <button
                  className="btn-remove-row"
                  onClick={() => removeInsight(item.id)}
                  title="Remove insight"
                  disabled={insights.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button className="btn-add-row" style={{ marginTop: '8px' }} onClick={addInsight}>
            + Add Insight
          </button>
        </Section>

        {/* ── Search Methodology ── */}
        <Section id="methodology" title="Search Methodology">
          <div className="form-row" style={{ marginBottom: '10px' }}>
            {/* Role — synced from header */}
            <div className="form-group">
              <label>
                Role
                {form.methodologyRoleOverridden
                  ? <button className="btn-sync-reset" onClick={resetMethodologyRole} title="Reset to header value">↺ sync</button>
                  : <span className="synced-badge">synced</span>
                }
              </label>
              <input
                type="text"
                value={effectiveMethodologyRole}
                placeholder={form.role || 'Auto-filled from header'}
                onChange={e => overrideMethodologyRole(e.target.value)}
              />
            </div>
            {/* Location — synced from header, editable for city/region */}
            <div className="form-group">
              <label>
                Location
                {form.methodologyLocationOverridden
                  ? <button className="btn-sync-reset" onClick={resetMethodologyLocation} title="Reset to header value">↺ sync</button>
                  : <span className="synced-badge">synced</span>
                }
              </label>
              <input
                type="text"
                value={effectiveMethodologyLocation}
                placeholder={form.location || 'Auto-filled from header'}
                onChange={e => overrideMethodologyLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Total Years of Experience</label>
              <input
                type="text"
                value={form.totalYearsExperience}
                placeholder="e.g. 5+ years"
                onChange={e => updateField('totalYearsExperience', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Core Skills / Keywords</label>
            <input
              type="text"
              value={form.coreSkills}
              placeholder="e.g. Java, Spring Boot, Microservices"
              onChange={e => updateField('coreSkills', e.target.value)}
            />
          </div>
        </Section>

        {/* ── Recommendations ── */}
        <Section id="recommendations" title="Recommendations">
          <div className="form-group">
            <label>Recommendations</label>
            <textarea
              rows={5}
              value={form.recommendations}
              placeholder="Enter your recommendations for the hiring manager..."
              onChange={e => updateField('recommendations', e.target.value)}
            />
          </div>
        </Section>

        {/* A1: Reset button with proper CSS class */}
        <div style={{ paddingTop: '14px', paddingBottom: '8px' }}>
          <button className="btn-reset" onClick={resetForm}>
            Reset Form
          </button>
        </div>

      </div>
    </div>
  )
}
