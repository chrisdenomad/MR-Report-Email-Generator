import { useState, useEffect, useRef } from 'react'
import { generatePlainText, generateHTML, generateHTMLFragment, IMPORTANT_REMARKS, IMPORTANT_REMARKS_SALARY, getFilledRows } from '../utils/generateEmail'

// Fix #8: shared confirm message so both reset buttons stay in sync
export const RESET_CONFIRM_MSG = 'Reset all form data? This cannot be undone.'

// Detect if the form is essentially empty
function isFormEmpty(form, summaryRows, columns, insights) {
  const noHeader = !form.role && !form.location && !form.recipientName
  const noSummary = getFilledRows(summaryRows, columns).length === 0
  const noRecommendations = !form.recommendations?.trim()
  if (form.researchType === 'salary') {
    return noHeader && noSummary && noRecommendations
  }
  const noInterpretation = !form.interpretation?.trim()
  const noInsights = !insights.some(i => i.text.trim())
  const noMethodology = !form.totalYearsExperience && !form.coreSkills
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
    // Modern path: ClipboardItem (Chrome, Edge, Safari)
    // Use the HTML fragment (no <html>/<head>/<body> wrappers) so Outlook's
    // "Paste Special → Keep Source Formatting" receives a clean body fragment
    // with CF_HTML StartFragment/EndFragment markers instead of a full document.
    // This preserves font, size, table borders, and paragraph spacing after paste.
    if (typeof ClipboardItem !== 'undefined') {
      const fragment = generateHTMLFragment(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation)
      const blob = new Blob([fragment], { type: 'text/html' })
      const item = new ClipboardItem({ 'text/html': blob })
      navigator.clipboard.write([item])
        .then(() => showToast('Copied as rich HTML!'))
        .catch(() => showToast('Copy failed — please copy manually.'))
    } else {
      // Firefox fallback: copy full HTML source as plain text (rich copy not supported)
      const html = generateHTML(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation)
      navigator.clipboard.writeText(html)
        .then(() => showToast('Copied as HTML source (rich copy not supported in this browser).'))
        .catch(() => showToast('Copy failed — please copy manually.'))
    }
  }

  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  const isSalary = form.researchType === 'salary'
  // Fix #6: use shared getFilledRows instead of inline filter
  const filledRows = getFilledRows(summaryRows, columns)
  const empty = isFormEmpty(form, summaryRows, columns, insights)
  // Fix #preview insights double-filter: compute once
  const filledInsights = insights.filter(i => i.text.trim())
  const activeRemarks = isSalary ? IMPORTANT_REMARKS_SALARY : IMPORTANT_REMARKS
  const summaryHeading = isSalary ? 'Salary Benchmark Data' : 'Research Summary'
  const chartLabel = isSalary ? 'Salary range chart for visualization' : 'Bar chart / Pie chart for visualization'
  const defaultOpeningLine = isSalary
    ? 'I would like to share with you the salary benchmark research for [Role] in [Location].'
    : 'I would like to share with you the market capacity research for [Role] in [Location].'

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
          {/* Email client header — From / To / Subject */}
          <div className="email-client-header">
            <div className="email-client-row">
              <span className="email-client-label">From</span>
              <span className="email-client-value">Market Research &lt;mr@epam.com&gt;</span>
            </div>
            <div className="email-client-row">
              <span className="email-client-label">To</span>
              <span className="email-client-value">
                {recipientName || <span className="ep-empty-inline">[Recipient Name]</span>}
              </span>
            </div>
            <div className="email-client-row email-client-subject-row">
              <span className="email-client-label">Subject</span>
              <span className="email-client-subject">{subject}</span>
            </div>
          </div>

          {/* Email body */}
          <div className="email-preview-box">

            {/* Greeting */}
            <p className="ep-greeting">
              Hi{recipientName ? ` ${recipientName}` : ''},
            </p>
            {/* Content suggestion #1: render interpolated opening line */}
            <p className="ep-intro">
              {(form.openingLine || defaultOpeningLine)
                .replace('[Role]', role)
                .replace('[Location]', location)
              }
            </p>

            {/* Research Summary / Salary Benchmark Data */}
            <p className="ep-section-heading">{summaryHeading}</p>
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
              <span className="ep-chart-placeholder">{chartLabel}</span>
            )}

            {/* Interpretation — capacity only */}
            {!isSalary && form.interpretation && (
              <p className="ep-interpretation">{form.interpretation}</p>
            )}

            {/* Key Insights — capacity only */}
            {!isSalary && (
              <>
                <p className="ep-section-heading">Key Insights</p>
                {filledInsights.length > 0 ? (
                  <ul className="ep-bullet-list">
                    {filledInsights.map(item => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ep-empty">[Add key insights]</p>
                )}
              </>
            )}

            {/* Search Methodology — capacity only */}
            {!isSalary && (
              <>
                <p className="ep-section-heading">Search Methodology</p>
                <ul className="ep-bullet-list">
                  <li><strong>Role:</strong> {effectiveMethodologyRole || <span className="ep-empty-inline">[Add role]</span>}</li>
                  <li><strong>Search Platform:</strong> LinkedIn (visible profiles only)</li>
                  <li><strong>Location:</strong> {effectiveMethodologyLocation || <span className="ep-empty-inline">[Add location]</span>}</li>
                  <li><strong>Excluded Company:</strong> EPAM</li>
                  <li>
                    <strong>Total Years of Experience:</strong>{' '}
                    {form.totalYearsExperience || <span className="ep-empty-inline">[Add]</span>}
                  </li>
                  <li>
                    <strong>Core Skills/Keyword:</strong>{' '}
                    {form.coreSkills || <span className="ep-empty-inline">[Add]</span>}
                  </li>
                </ul>
              </>
            )}

            {/* Recommendations */}
            <p className="ep-section-heading">Recommendations</p>
            {form.recommendations ? (
              <p className="ep-recommendations">{form.recommendations}</p>
            ) : (
              <p className="ep-empty">[Add recommendations]</p>
            )}

            {/* Important Remarks */}
            <p className="ep-section-heading">Important Remarks</p>
            <ul className="ep-bullet-list">
              {activeRemarks.map((remark, i) => (
                <li key={i}>{remark}</li>
              ))}
            </ul>

            {/* Closing line — after Important Remarks */}
            {form.closingLine?.trim() && (
              <p className="ep-closing-line">{form.closingLine}</p>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
