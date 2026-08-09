import { useState, useEffect, useRef } from 'react'
import { generatePlainText, generateHTML, generateHTMLFragment, IMPORTANT_REMARKS, IMPORTANT_REMARKS_SALARY, IMPORTANT_REMARKS_COMBINED, getFilledRows } from '../utils/generateEmail'

// Fix #8: shared confirm message so both reset buttons stay in sync
export const RESET_CONFIRM_MSG = 'Reset all form data? This cannot be undone.'

// Detect if the form is essentially empty
function isFormEmpty(form, summaryRows, columns, salaryRows, salaryColumns, insights) {
  const noHeader = !form.role && !form.location && !form.recipientName
  const noSummary = getFilledRows(summaryRows, columns).length === 0
  const noRecommendations = !form.recommendations?.trim()
  if (form.researchType === 'salary') {
    return noHeader && noSummary && noRecommendations
  }
  if (form.researchType === 'combined') {
    const noSalary = getFilledRows(salaryRows, salaryColumns).length === 0
    const noInterpretation = !form.interpretation?.trim()
    const noInsights = !insights.some(i => i.text.trim())
    const noMethodology = !form.totalYearsExperience && !form.coreSkills
    return noHeader && noSummary && noSalary && noInterpretation && noInsights && noMethodology && noRecommendations
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
  salaryColumns,
  salaryRows,
  resetForm,
}) {
  const [toast, setToast] = useState('')
  const [toastKey, setToastKey] = useState(0)
  const toastTimerRef = useRef(null)

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

  function copyPlainText() {
    const text = generatePlainText(form, columns, summaryRows, insights, subject, effectiveMethodologyRole, effectiveMethodologyLocation, salaryColumns, salaryRows)
    navigator.clipboard.writeText(text)
      .then(() => showToast('Copied as plain text!'))
      .catch(() => showToast('Copy failed — please copy manually.'))
  }

  function copyHTML() {
    if (typeof ClipboardItem !== 'undefined') {
      const fragment = generateHTMLFragment(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation, salaryColumns, salaryRows)
      const blob = new Blob([fragment], { type: 'text/html' })
      const item = new ClipboardItem({ 'text/html': blob })
      navigator.clipboard.write([item])
        .then(() => showToast('Copied as rich HTML!'))
        .catch(() => showToast('Copy failed — please copy manually.'))
    } else {
      const html = generateHTML(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation, salaryColumns, salaryRows)
      navigator.clipboard.writeText(html)
        .then(() => showToast('Copied as HTML source (rich copy not supported in this browser).'))
        .catch(() => showToast('Copy failed — please copy manually.'))
    }
  }

  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  const isSalary = form.researchType === 'salary'
  const isCombined = form.researchType === 'combined'
  const filledRows = getFilledRows(summaryRows, columns)
  const filledSalaryRows = getFilledRows(salaryRows ?? [], salaryColumns ?? [])
  const empty = isFormEmpty(form, summaryRows, columns, salaryRows ?? [], salaryColumns ?? [], insights)
  const filledInsights = insights.filter(i => i.text.trim())
  const activeRemarks = isCombined
    ? IMPORTANT_REMARKS_COMBINED
    : isSalary ? IMPORTANT_REMARKS_SALARY : IMPORTANT_REMARKS
  const chartLabel = isSalary ? 'Salary range chart for visualization' : 'Bar chart / Pie chart for visualization'
  const defaultOpeningLine = isCombined
    ? 'I would like to share with you the market capacity and salary benchmark research for [Role] in [Location].'
    : isSalary
      ? 'I would like to share with you the salary benchmark research for [Role] in [Location].'
      : 'I would like to share with you the market capacity research for [Role] in [Location].'

  return (
    <div className="preview-panel">
      {/* Sticky header with copy buttons */}
      <div className="preview-panel-header">
        <h2>Email Preview</h2>
        <div className="copy-actions">
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

      <div className="preview-panel-body">
        {/* Email client header */}
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

          <p className="ep-greeting">
            Hi{recipientName ? ` ${recipientName}` : ''},
          </p>
          <p className="ep-intro">
            {(form.openingLine || defaultOpeningLine)
              .replace('[Role]', role)
              .replace('[Location]', location)
            }
          </p>

          {/* ── Research Summary block ── */}

          {/* Capacity table (capacity + combined) */}
          {!isSalary && (
            <>
              <p className="ep-section-heading">
                {isCombined ? 'Market Capacity' : 'Research Summary'}
              </p>
              <div className="table-scroll-wrapper">
                <table className="ep-table">
                  <thead>
                    <tr>{columns.map(col => <th key={col.id}>{col.label || '—'}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filledRows.length > 0 ? (
                      filledRows.map(row => (
                        <tr key={row.id}>
                          {columns.map(col => <td key={col.id}>{row.values[col.id] || '—'}</td>)}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={columns.length} className="ep-empty">No data entered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {form.includeChartPlaceholder !== false && (
                <span className="ep-chart-placeholder">Bar chart / Pie chart for visualization</span>
              )}
            </>
          )}

          {/* Salary table (salary + combined) — immediately after capacity in combined */}
          {(isSalary || isCombined) && (
            <>
              <p className="ep-section-heading">Salary Benchmark Data</p>
              <div className="table-scroll-wrapper">
                <table className="ep-table">
                  <thead>
                    <tr>{(salaryColumns ?? []).map(col => <th key={col.id}>{col.label || '—'}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filledSalaryRows.length > 0 ? (
                      filledSalaryRows.map(row => (
                        <tr key={row.id}>
                          {(salaryColumns ?? []).map(col => <td key={col.id}>{row.values[col.id] || '—'}</td>)}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={(salaryColumns ?? []).length} className="ep-empty">No data entered yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {form.includeChartPlaceholder !== false && (
                <span className="ep-chart-placeholder">Salary range chart for visualization</span>
              )}
            </>
          )}

          {/* Interpretation — capacity + combined */}
          {!isSalary && form.interpretation && (
            <p className="ep-interpretation">{form.interpretation}</p>
          )}

          {/* Key Insights — capacity + combined */}
          {!isSalary && (
            <>
              <p className="ep-section-heading">Key Insights</p>
              {filledInsights.length > 0 ? (
                <ul className="ep-bullet-list">
                  {filledInsights.map(item => <li key={item.id}>{item.text}</li>)}
                </ul>
              ) : (
                <p className="ep-empty">[Add key insights]</p>
              )}
            </>
          )}

          {/* Search Methodology — capacity + combined */}
          {!isSalary && (
            <>
              <p className="ep-section-heading">Search Methodology</p>
              <ul className="ep-bullet-list">
                <li><strong>Role:</strong> {effectiveMethodologyRole || <span className="ep-empty-inline">[Add role]</span>}</li>
                <li><strong>Search Platform:</strong> LinkedIn (visible profiles only)</li>
                <li><strong>Location:</strong> {effectiveMethodologyLocation || <span className="ep-empty-inline">[Add location]</span>}</li>
                <li><strong>Excluded Company:</strong> EPAM</li>
                <li><strong>Total Years of Experience:</strong>{' '}{form.totalYearsExperience || <span className="ep-empty-inline">[Add]</span>}</li>
                <li><strong>Core Skills/Keyword:</strong>{' '}{form.coreSkills || <span className="ep-empty-inline">[Add]</span>}</li>
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

          {/* Important Remarks — merged for combined */}
          <p className="ep-section-heading">Important Remarks</p>
          <ul className="ep-bullet-list">
            {activeRemarks.map((remark, i) => <li key={i}>{remark}</li>)}
          </ul>

          {/* Closing line */}
          {form.closingLine?.trim() && (
            <p className="ep-closing-line">{form.closingLine}</p>
          )}

        </div>
      </div>
    </div>
  )
}
