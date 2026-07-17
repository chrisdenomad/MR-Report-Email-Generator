import { useState, useEffect, useRef } from 'react'
import { generatePlainText, generateHTML, IMPORTANT_REMARKS, getFilledRows } from '../utils/generateEmail'

// Fix #8: shared confirm message so both reset buttons stay in sync
export const RESET_CONFIRM_MSG = 'Reset all form data? This cannot be undone.'

// Detect if the form is essentially empty
function isFormEmpty(form, summaryRows, columns, insights) {
  const noHeader = !form.role && !form.location && !form.recipientName
  const noSummary = getFilledRows(summaryRows, columns).length === 0
  const noInterpretation = !form.interpretation?.trim()
  const noInsights = !insights.some(i => i.text.trim())
  const noMethodology = !form.totalYearsExperience && !form.coreSkills
  const noRecommendations = !form.recommendations?.trim()
  return noHeader && noSummary && noInterpretation && noInsights && noMethodology && noRecommendations
}

export default function EmailPreview({
  form,
  columns,
  summaryRows,
  insights,
  subject,
  effectiveMethodologyRole,
  effectiveMethodologyLocation,
  resetForm,
}) {
  const [toast, setToast] = useState('')
  // Fix #5: counter key so same message re-triggers animation
  const [toastKey, setToastKey] = useState(0)
  // Fix #10: store timer ref so we can cancel it on unmount
  const toastTimerRef = useRef(null)

  // Fix #10: clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  function showToast(msg) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    setToastKey(k => k + 1)
    toastTimerRef.current = setTimeout(() => setToast(''), 2200)
  }

  // Fix #2: added .catch() so clipboard failures surface to the user
  function copyPlainText() {
    const text = generatePlainText(form, columns, summaryRows, insights, subject, effectiveMethodologyRole, effectiveMethodologyLocation)
    navigator.clipboard.writeText(text)
      .then(() => showToast('Copied as plain text!'))
      .catch(() => showToast('Copy failed — please copy manually.'))
  }

  // Fix #2 & #3: .catch() added; Firefox fallback via execCommand when ClipboardItem unavailable
  function copyHTML() {
    const html = generateHTML(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation)

    // Modern path: ClipboardItem (Chrome, Edge, Safari)
    if (typeof ClipboardItem !== 'undefined') {
      const blob = new Blob([html], { type: 'text/html' })
      const item = new ClipboardItem({ 'text/html': blob })
      navigator.clipboard.write([item])
        .then(() => showToast('Copied as rich HTML!'))
        .catch(() => showToast('Copy failed — please copy manually.'))
    } else {
      // Firefox fallback: copy as plain text with a note
      navigator.clipboard.writeText(html)
        .then(() => showToast('Copied as HTML source (rich copy not supported in this browser).'))
        .catch(() => showToast('Copy failed — please copy manually.'))
    }
  }

  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  // Fix #6: use shared getFilledRows instead of inline filter
  const filledRows = getFilledRows(summaryRows, columns)
  const empty = isFormEmpty(form, summaryRows, columns, insights)
  // Fix #preview insights double-filter: compute once
  const filledInsights = insights.filter(i => i.text.trim())

  return (
    // Fix #31: owns its own .preview-panel wrapper
    <div className="preview-panel">
      {/* Sticky header with copy buttons */}
      <div className="preview-panel-header">
        <h2>Email Preview</h2>
        <div className="copy-actions">
          {/* Fix #5: toastKey guarantees remount even with same message */}
          {toast && <span key={toastKey} className="copy-toast">{toast}</span>}
          <button
            className="btn-reset-header"
            onClick={() => {
              if (window.confirm(RESET_CONFIRM_MSG)) {
                resetForm()
              }
            }}
            disabled={empty}
            title="Clear all form data"
          >
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 .49-3.51"></path>
            </svg>
            Reset Form
          </button>
          <button className="btn-copy btn-copy-plain" onClick={copyPlainText} disabled={empty}>
            {/* Fix #22: aria-hidden on decorative SVGs */}
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Plain Text
          </button>
          <button className="btn-copy btn-copy-html" onClick={copyHTML} disabled={empty}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Copy Rich HTML
          </button>
        </div>
      </div>

      {/* B4: Empty state */}
      {empty ? (
        <div className="preview-empty-state">
          <div className="preview-empty-arrow">←</div>
          <div className="empty-icon">✉</div>
          <h3>Your email preview will appear here</h3>
          <p>Fill in the form on the left to generate your market capacity report email.</p>
        </div>
      ) : (
        <div className="preview-panel-body">
          {/* Subject line */}
          <div className="email-subject-bar">
            <strong>Subject</strong>
            <span>{subject}</span>
          </div>

          {/* Email body */}
          <div className="email-preview-box">

            {/* Greeting */}
            <p className="ep-greeting">
              Hi{recipientName ? ` ${recipientName}` : ''},
            </p>
            {/* Content suggestion #1: render interpolated opening line */}
            <p className="ep-intro">
              {(form.openingLine || 'I would like to share with you the market capacity research for [Role] in [Location].')
                .replace('[Role]', role)
                .replace('[Location]', location)
              }
            </p>

            {/* Research Summary */}
            <p className="ep-section-heading">Research Summary</p>
            <div className="table-scroll-wrapper">
              <table className="ep-table">
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col.id}>{col.label || '—'}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filledRows.length > 0 ? (
                    filledRows.map(row => (
                      <tr key={row.id}>
                        {columns.map(col => (
                          <td key={col.id}>{row.values[col.id] || '—'}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="ep-empty">
                        No data entered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Chart placeholder — content suggestion #5: conditional */}
            {form.includeChartPlaceholder !== false && (
              <span className="ep-chart-placeholder">Bar chart / Pie chart for visualization</span>
            )}

            {/* Interpretation — content only, no label */}
            {form.interpretation && (
              <p className="ep-interpretation">{form.interpretation}</p>
            )}

            {/* Key Insights */}
            <p className="ep-section-heading">Key Insights</p>
            {/* Fix #preview: use pre-computed filledInsights */}
            {filledInsights.length > 0 ? (
              <ul className="ep-bullet-list">
                {filledInsights.map(item => (
                  <li key={item.id}>{item.text}</li>
                ))}
              </ul>
            ) : (
              <p className="ep-empty">[Add key insights]</p>
            )}

            {/* Search Methodology */}
            <p className="ep-section-heading">Search Methodology</p>
            <ul className="ep-bullet-list">
              <li><strong>Role:</strong> {effectiveMethodologyRole || <span className="ep-empty">[Add role]</span>}</li>
              <li><strong>Search Platform:</strong> LinkedIn (visible profiles only)</li>
              <li><strong>Location:</strong> {effectiveMethodologyLocation || <span className="ep-empty">[Add location]</span>}</li>
              <li><strong>Excluded Company:</strong> EPAM</li>
              <li>
                <strong>Total Years of Experience:</strong>{' '}
                {form.totalYearsExperience || <span className="ep-empty">[Add]</span>}
              </li>
              <li>
                <strong>Core Skills/Keyword:</strong>{' '}
                {form.coreSkills || <span className="ep-empty">[Add]</span>}
              </li>
            </ul>

            {/* Recommendations */}
            <p className="ep-section-heading">Recommendations</p>
            {form.recommendations ? (
              <p className="ep-recommendations">{form.recommendations}</p>
            ) : (
              <p className="ep-empty">[Add recommendations]</p>
            )}

            {/* Content suggestion #6: closing line after recommendations */}
            {form.closingLine?.trim() && (
              <p className="ep-closing-line">{form.closingLine}</p>
            )}

            {/* Content suggestion #1: Important Remarks sourced from IMPORTANT_REMARKS constant */}
            <p className="ep-section-heading">Important Remarks</p>
            <ul className="ep-bullet-list">
              {IMPORTANT_REMARKS.map((remark, i) => (
                <li key={i}>{remark}</li>
              ))}
            </ul>

          </div>
        </div>
      )}
    </div>
  )
}
