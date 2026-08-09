import { useState, useMemo } from 'react'
import ResearchSummaryTable from './ResearchSummaryTable'
import { RESET_CONFIRM_MSG } from './EmailPreview'

// ── Preset examples for opening & closing lines ───────────────────────────────
const CAPACITY_OPENING_LINE_EXAMPLES = [
  'I would like to share with you the market capacity research for [Role] in [Location].',
  'As requested, here is the market capacity research for [Role] in [Location].',
  'Please find below the market capacity research for [Role] positions in [Location].',
  'I wanted to share the latest talent market insights for [Role] in [Location].',
  'Here is an overview of the available talent pool for [Role] in [Location].',
]

const SALARY_OPENING_LINE_EXAMPLES = [
  'I would like to share with you the salary benchmark research for [Role] in [Location].',
  'As requested, here is the salary benchmark data for [Role] in [Location].',
  'Please find below the salary benchmark research for [Role] positions in [Location].',
  'I wanted to share the latest compensation insights for [Role] in [Location].',
  'Here is an overview of the salary benchmark for [Role] in [Location].',
]

const CLOSING_LINE_EXAMPLES = [
  'Please let me know if you have any questions or would like to explore additional criteria.',
  'Happy to discuss these findings further — feel free to reach out anytime.',
  'Let me know if you would like to adjust the search criteria or explore other locations.',
  'I am available to walk you through the findings in more detail if needed.',
  'Looking forward to your feedback and happy to refine the search further.',
]

// ── Salary column type definitions ────────────────────────────────────────────
const SENIORITY_OPTIONS = ['A1','A2','A3','B1','B2','B3','C1','C2','C3','D1','D2','D3']
const BASIS_OPTIONS = ['Monthly', 'Yearly']
const CURRENCY_OPTIONS = ['USD','VND','PLN','HKD','AUD','JPY','MYR','SGD','CNY']

const SALARY_COLUMN_TYPES = {
  scol3: { type: 'select', options: SENIORITY_OPTIONS },
  scol6: { type: 'select', options: BASIS_OPTIONS },
  scol7: { type: 'select', options: CURRENCY_OPTIONS, allowCustom: true },
}

// ── LineFieldWithExamples ─────────────────────────────────────────────────────
function LineFieldWithExamples({ id, label, value, onChange, examples, hint }) {
  const [open, setOpen] = useState(false)

  function pick(example) {
    onChange(example)
    setOpen(false)
  }

  return (
    <div className="form-group line-field-wrap">
      <div className="field-label-row">
        <label htmlFor={id}>
          {label}
          {hint && <span className="synced-badge" title={hint}>{hint}</span>}
        </label>
        <button
          type="button"
          className={`btn-examples-toggle${open ? ' active' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          title="Show example phrases"
        >
          <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Examples
          <span className="examples-chevron" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </button>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={examples[0]}
      />
      {open && (
        <ul className="examples-list">
          {examples.map((ex, i) => (
            <li
              key={i}
              className={`examples-option${value === ex ? ' selected' : ''}`}
              onMouseDown={e => { e.preventDefault(); pick(ex) }}
              title={ex}
            >
              {value === ex && <span className="examples-check">✓</span>}
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Research type switcher ────────────────────────────────────────────────────
function ResearchTypeSwitcher({ current, onSwitch }) {
  // pendingType: set when user clicks the other type, triggers inline confirm
  const [pendingType, setPendingType] = useState(null)

  function handleClick(type) {
    if (type === current) return
    setPendingType(type)
  }

  function handleKeep() {
    onSwitch(pendingType, true)
    setPendingType(null)
  }

  function handleReset() {
    onSwitch(pendingType, false)
    setPendingType(null)
  }

  function handleCancel() {
    setPendingType(null)
  }

  return (
    <div className="research-type-switcher">
      <div className="research-type-toggle">
        <button
          type="button"
          className={`btn-research-type${current === 'capacity' ? ' active' : ''}`}
          onClick={() => handleClick('capacity')}
        >
          Market Capacity
        </button>
        <button
          type="button"
          className={`btn-research-type${current === 'salary' ? ' active' : ''}`}
          onClick={() => handleClick('salary')}
        >
          Salary Benchmark
        </button>
      </div>

      {pendingType && (
        <div className="switch-confirm">
          <span className="switch-confirm-text">
            Switching to <strong>{pendingType === 'salary' ? 'Salary Benchmark' : 'Market Capacity'}</strong>. What about the table?
          </span>
          <div className="switch-confirm-actions">
            <button type="button" className="btn-switch-reset" onClick={handleReset}>
              Reset to new defaults
            </button>
            <button type="button" className="btn-switch-keep" onClick={handleKeep}>
              Keep existing data
            </button>
            <button type="button" className="btn-switch-cancel" onClick={handleCancel} aria-label="Cancel">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const ALL_SECTIONS = ['header', 'summary', 'interpretation', 'insights', 'methodology', 'recommendations', 'closing']

// Compute how many relevant sections have content — varies by research type
function useProgress(form, summaryRows, columns, insights) {
  return useMemo(() => {
    const isSalary = form.researchType === 'salary'
    const filled = isSalary
      ? [
          !!(form.role || form.location || form.recipientName),
          summaryRows.some(row => columns.some(col => row.values[col.id]?.trim())),
          !!form.recommendations.trim(),
        ]
      : [
          !!(form.role || form.location || form.recipientName),
          summaryRows.some(row => columns.some(col => row.values[col.id]?.trim())),
          !!form.interpretation.trim(),
          insights.some(i => i.text.trim()),
          !!(form.totalYearsExperience || form.coreSkills),
          !!form.recommendations.trim(),
        ]
    const count = filled.filter(Boolean).length
    return { count, total: filled.length, pct: Math.round((count / filled.length) * 100) }
  }, [form, summaryRows, columns, insights])
}

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

// ── Templates panel ───────────────────────────────────────────────────────────
function TemplatesPanel({ templates, onSave, onLoad, onDelete }) {
  const [newName, setNewName] = useState('')
  const [open, setOpen] = useState(false)

  function handleSave() {
    const name = newName.trim()
    if (!name) return
    onSave(name)
    setNewName('')
  }

  return (
    <div className="templates-panel">
      <button
        type="button"
        className="templates-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Templates
        {templates.length > 0 && <span className="templates-count">{templates.length}</span>}
        <span className="form-section-chevron" aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 'auto' }}>▼</span>
      </button>

      {open && (
        <div className="templates-body">
          <div className="templates-save-row">
            <input
              type="text"
              className="templates-name-input"
              placeholder="Template name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button
              type="button"
              className="btn-save-template"
              onClick={handleSave}
              disabled={!newName.trim()}
            >
              Save
            </button>
          </div>

          {templates.length === 0 ? (
            <p className="templates-empty">No saved templates yet.</p>
          ) : (
            <ul className="templates-list">
              {templates.map(tpl => (
                <li key={tpl.name} className="template-item">
                  <button
                    type="button"
                    className="btn-load-template"
                    onClick={() => onLoad(tpl.name)}
                    title={`Load: ${tpl.name}`}
                  >
                    {tpl.name}
                  </button>
                  <button
                    type="button"
                    className="btn-delete-template"
                    onClick={() => onDelete(tpl.name)}
                    aria-label={`Delete template: ${tpl.name}`}
                    title="Delete template"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}


export default function InputForm({
  style,
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
  switchResearchType,
  templates,
  saveTemplate,
  deleteTemplate,
  loadTemplate,
}) {
  const [openSections, setOpenSections] = useState(new Set(ALL_SECTIONS))

  function toggleSection(id) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function isOpen(id) { return openSections.has(id) }

  const progress = useProgress(form, summaryRows, columns, insights)

  const isSalary = form.researchType === 'salary'
  const openingLineExamples = isSalary ? SALARY_OPENING_LINE_EXAMPLES : CAPACITY_OPENING_LINE_EXAMPLES
  // columnTypes only applies in salary mode — capacity table uses plain text everywhere
  const activeColumnTypes = isSalary ? SALARY_COLUMN_TYPES : {}

  return (
    <div className="form-panel" style={style}>
      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div className="progress-bar-label">
          <span>{progress.count}</span> / {progress.total} sections filled
        </div>
      </div>

      <div className="form-panel-scroll">

        {/* Templates panel */}
        <TemplatesPanel
          templates={templates}
          onSave={saveTemplate}
          onLoad={loadTemplate}
          onDelete={deleteTemplate}
        />

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
          {/* Content suggestion #1: editable opening line with examples */}
          <LineFieldWithExamples
            id="field-openingLine"
            label="Opening line"
            value={form.openingLine}
            onChange={val => updateField('openingLine', val)}
            examples={openingLineExamples}
            hint="[Role] & [Location] auto-filled"
          />
        </Section>

        {/* ── Research Summary ── */}
        <Section id="summary" title="Research Summary" isOpen={isOpen} onToggle={toggleSection}>
          {/* Research type switcher */}
          <ResearchTypeSwitcher
            current={form.researchType || 'capacity'}
            onSwitch={switchResearchType}
          />

          <ResearchSummaryTable
            columns={columns}
            rows={summaryRows}
            onUpdateCell={updateSummaryCell}
            onAddRow={addSummaryRow}
            onRemoveRow={removeSummaryRow}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onUpdateColumnLabel={updateColumnLabel}
            columnTypes={activeColumnTypes}
          />
          {/* Content suggestion #5: chart placeholder toggle */}
          <div className="form-group chart-toggle-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.includeChartPlaceholder !== false}
                onChange={e => updateField('includeChartPlaceholder', e.target.checked)}
              />
              Include chart placeholder in email
            </label>
          </div>
        </Section>

        {/* ── Interpretation — capacity only ── */}
        {!isSalary && (
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
        )}

        {/* ── Key Insights — capacity only ── */}
        {!isSalary && (
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
        )}

        {/* ── Search Methodology — capacity only ── */}
        {!isSalary && (
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
        )}

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

        {/* ── Closing Line ── */}
        <Section id="closing" title="Closing Line" isOpen={isOpen} onToggle={toggleSection}>
          {/* Content suggestion #6: editable closing line with examples */}
          <LineFieldWithExamples
            id="field-closingLine"
            label="Closing line"
            value={form.closingLine}
            onChange={val => updateField('closingLine', val)}
            examples={CLOSING_LINE_EXAMPLES}
          />
        </Section>

        {/* Reset */}
        <div className="btn-reset-container">
          <button className="btn-reset" onClick={() => {
            if (window.confirm(RESET_CONFIRM_MSG)) {
              resetForm()
            }
          }}>
            Reset Form
          </button>
        </div>

      </div>
    </div>
  )
}
