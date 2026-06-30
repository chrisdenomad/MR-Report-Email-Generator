import { useState, useMemo } from 'react'
import ResearchSummaryTable from './ResearchSummaryTable'
import {
  generateInterpretation,
  generateKeyInsights,
  generateRecommendations,
} from '../utils/aiAssist'

const ALL_SECTIONS = ['header', 'summary', 'interpretation', 'insights', 'methodology', 'recommendations']

// Compute how many sections have content
function useProgress(form, summaryRows, columns, insights) {
  return useMemo(() => {
    const filled = [
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

// AI Assist button — shows spinner while loading, error on failure
function AiButton({ label, onClick, loading, disabled }) {
  return (
    <button
      type="button"
      className={`btn-ai-assist${loading ? ' loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={`AI: ${label}`}
    >
      {loading ? (
        <span className="ai-spinner" aria-hidden="true" />
      ) : (
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a1 1 0 0 1 .894.553l2.618 5.302 5.85.85a1 1 0 0 1 .555 1.706l-4.234 4.126.999 5.827a1 1 0 0 1-1.451 1.054L12 18.902l-5.231 2.75a1 1 0 0 1-1.451-1.054l.999-5.827L2.083 10.41a1 1 0 0 1 .555-1.706l5.85-.85L11.106 2.553A1 1 0 0 1 12 2z"/>
        </svg>
      )}
      {label}
    </button>
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
          {/* Save current as template */}
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

          {/* Saved templates list */}
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

// ── API Key Note Modal ────────────────────────────────────────────────────────
function NoteModal({ note, onSave, onClose }) {
  const [draft, setDraft] = useState(note)
  const [mode, setMode] = useState(note ? 'preview' : 'edit')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave(draft)
    setSaved(true)
    setMode('preview')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="note-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="note-modal">
        <div className="note-modal-header">
          <span className="note-modal-title">API Key Note</span>
          <div className="note-modal-tabs">
            <button
              type="button"
              className={`note-tab${mode === 'edit' ? ' active' : ''}`}
              onClick={() => setMode('edit')}
            >Edit</button>
            <button
              type="button"
              className={`note-tab${mode === 'preview' ? ' active' : ''}`}
              onClick={() => setMode('preview')}
              disabled={!draft.trim()}
            >Preview</button>
          </div>
          <button type="button" className="note-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="note-modal-body">
          {mode === 'edit' ? (
            <textarea
              className="note-textarea"
              value={draft}
              onChange={e => { setDraft(e.target.value); setSaved(false) }}
              placeholder={'Write a note for your teammates here...\n\nExample:\nTo use AI features:\n1. Go to github.com/settings/tokens\n2. Generate new token (classic) — no scopes needed\n3. Paste the token in the field below and hit Save'}
              autoFocus
            />
          ) : (
            <div className="note-preview">
              {draft.trim()
                ? draft.split('\n').map((line, i) => (
                    line.trim() === ''
                      ? <br key={i} />
                      : <p key={i}>{line}</p>
                  ))
                : <span className="note-preview-empty">No note yet. Switch to Edit to write one.</span>
              }
            </div>
          )}
        </div>

        <div className="note-modal-footer">
          {mode === 'edit' && (
            <button
              type="button"
              className="btn-save-note"
              onClick={handleSave}
              disabled={draft === note}
            >
              {saved ? 'Saved!' : 'Save Note'}
            </button>
          )}
          <button type="button" className="btn-close-note" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── AI Key Panel ──────────────────────────────────────────────────────────────
function AiKeyPanel({ apiKey, onSave, apiKeyNote, onSaveNote }) {
  const [draft, setDraft] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showNote, setShowNote] = useState(false)

  function handleSave() {
    onSave(draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    setDraft('')
    onSave('')
    setSaved(false)
  }

  const isActive = !!apiKey
  const hasNote = !!apiKeyNote.trim()

  return (
    <div className={`ai-key-panel${isActive ? ' ai-key-panel--active' : ''}`}>
      <div className="ai-key-panel-header">
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
        <span className="ai-key-panel-title">GitHub API Key</span>
        {isActive
          ? <span className="ai-key-badge ai-key-badge--set">active</span>
          : <span className="ai-key-badge ai-key-badge--missing">required for AI</span>
        }
        <button
          type="button"
          className={`btn-note-trigger${hasNote ? ' btn-note-trigger--has-note' : ''}`}
          onClick={() => setShowNote(true)}
          title={hasNote ? 'View / edit note' : 'Add a note for teammates'}
          aria-label="Open note"
        >
          {hasNote ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          <span>{hasNote ? 'Note' : 'Add note'}</span>
        </button>
      </div>

      <p className="ai-key-hint">
        Paste a{' '}
        <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="ai-key-link">
          GitHub Personal Access Token
        </a>
        {' '}(classic, no scopes needed). Your account must have access to{' '}
        <a href="https://github.com/marketplace/models" target="_blank" rel="noreferrer" className="ai-key-link">
          GitHub Models
        </a>
        . Key is saved only in your browser.
      </p>

      <div className="ai-key-row">
        <div className="ai-key-input-wrap">
          <input
            type={showKey ? 'text' : 'password'}
            className="ai-key-input"
            placeholder="Paste your token here (ghp_…)"
            value={draft}
            onChange={e => { setDraft(e.target.value); setSaved(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="btn-toggle-key-visibility"
            onClick={() => setShowKey(v => !v)}
            title={showKey ? 'Hide key' : 'Show key'}
            aria-label={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <button
          type="button"
          className="btn-save-api-key"
          onClick={handleSave}
          disabled={draft.trim() === apiKey || !draft.trim()}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
        {isActive && (
          <button
            type="button"
            className="btn-clear-api-key"
            onClick={handleClear}
            title="Remove saved key"
          >
            Clear
          </button>
        )}
      </div>

      {showNote && (
        <NoteModal
          note={apiKeyNote}
          onSave={onSaveNote}
          onClose={() => setShowNote(false)}
        />
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
  templates,
  saveTemplate,
  deleteTemplate,
  loadTemplate,
  apiKey,
  saveApiKey,
  apiKeyNote,
  saveApiKeyNote,
}) {
  const [openSections, setOpenSections] = useState(new Set(ALL_SECTIONS))
  const [aiLoading, setAiLoading] = useState({ interpretation: false, insights: false, recommendations: false })
  const [aiError, setAiError] = useState('')

  function toggleSection(id) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function isOpen(id) { return openSections.has(id) }

  const progress = useProgress(form, summaryRows, columns, insights)

  // ── AI handlers ──
  async function handleAiInterpretation() {
    setAiError('')
    setAiLoading(p => ({ ...p, interpretation: true }))
    try {
      const text = await generateInterpretation(form, columns, summaryRows, apiKey)
      updateField('interpretation', text)
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(p => ({ ...p, interpretation: false }))
    }
  }

  async function handleAiInsights() {
    setAiError('')
    setAiLoading(p => ({ ...p, insights: true }))
    try {
      const bullets = await generateKeyInsights(form, columns, summaryRows, apiKey)
      // Replace insights list with AI-generated ones
      bullets.forEach((text, idx) => {
        if (idx < insights.length) {
          updateInsight(insights[idx].id, text)
        } else {
          addInsight()
        }
      })
      // Trim any extra existing insights beyond what AI returned
      insights.slice(bullets.length).forEach(item => removeInsight(item.id))
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(p => ({ ...p, insights: false }))
    }
  }

  async function handleAiRecommendations() {
    setAiError('')
    setAiLoading(p => ({ ...p, recommendations: true }))
    try {
      const text = await generateRecommendations(form, columns, summaryRows, apiKey)
      updateField('recommendations', text)
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(p => ({ ...p, recommendations: false }))
    }
  }

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

        {/* AI Key panel */}
        <AiKeyPanel apiKey={apiKey} onSave={saveApiKey} apiKeyNote={apiKeyNote} onSaveNote={saveApiKeyNote} />

        {/* AI error banner */}
        {aiError && (
          <div className="ai-error-banner" role="alert">
            <strong>AI error:</strong> {aiError}
            <button type="button" className="ai-error-dismiss" onClick={() => setAiError('')}>×</button>
          </div>
        )}

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
            <div className="field-label-row">
              <label htmlFor="field-interpretation">Interpretation sentence</label>
              <AiButton
                label="AI Draft"
                loading={aiLoading.interpretation}
                onClick={handleAiInterpretation}
              />
            </div>
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
          <div className="insights-list-header">
            <AiButton
              label="AI Generate All"
              loading={aiLoading.insights}
              onClick={handleAiInsights}
            />
          </div>
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
            <div className="field-label-row">
              <label htmlFor="field-recommendations">Recommendations</label>
              <AiButton
                label="AI Draft"
                loading={aiLoading.recommendations}
                onClick={handleAiRecommendations}
              />
            </div>
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
