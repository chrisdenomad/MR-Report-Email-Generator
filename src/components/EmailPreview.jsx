import { useState } from 'react'
import { generatePlainText, generateHTML } from '../utils/generateEmail'

export default function EmailPreview({ form, columns, summaryRows, insights, subject }) {
  const [toast, setToast] = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  function copyPlainText() {
    const text = generatePlainText(form, columns, summaryRows, insights, subject)
    navigator.clipboard.writeText(text).then(() => showToast('Copied as plain text!'))
  }

  function copyHTML() {
    const html = generateHTML(form, columns, summaryRows, insights, subject)
    const blob = new Blob([html], { type: 'text/html' })
    const item = new ClipboardItem({ 'text/html': blob })
    navigator.clipboard.write([item]).then(() => showToast('Copied as rich HTML!'))
  }

  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const filledRows = summaryRows.filter(row =>
    columns.some(col => row.values[col.id]?.trim())
  )

  return (
    <>
      {/* Sticky header with copy buttons */}
      <div className="preview-panel-header">
        <h2>Email Preview</h2>
        <div className="copy-actions">
          {toast && <span className="copy-toast">{toast}</span>}
          <button className="btn-copy btn-copy-plain" onClick={copyPlainText}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Plain Text
          </button>
          <button className="btn-copy btn-copy-html" onClick={copyHTML}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Copy Rich HTML
          </button>
        </div>
      </div>

      <div className="preview-panel-body">
        {/* Subject line */}
        <div className="email-subject-bar">
          <strong>Subject</strong>
          <span>{subject}</span>
        </div>

        {/* Email body */}
        <div className="email-preview-box">

          {/* Greeting */}
          <p className="ep-greeting">Hi,</p>
          <p style={{ marginBottom: '16px', fontSize: '14px' }}>
            I would like to share with you the market capacity research for{' '}
            <strong>{role}</strong> in <strong>{location}</strong>.
          </p>

          {/* Research Summary */}
          <p className="ep-section-heading">Research Summary</p>
          <div style={{ overflowX: 'auto' }}>
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

          {/* Chart placeholder */}
          <span className="ep-chart-placeholder">Bar chart / Pie chart for visualization</span>

          {/* Interpretation */}
          <p className="ep-interpretation">
            <em><strong>*Interpretation: </strong></em>
            {form.interpretation || <span className="ep-empty">[Add interpretation]</span>}
          </p>

          {/* Key Insights */}
          <p className="ep-section-heading">Key Insights</p>
          {insights.filter(i => i.text.trim()).length > 0 ? (
            <ul className="ep-bullet-list">
              {insights.filter(i => i.text.trim()).map(item => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          ) : (
            <p className="ep-empty">[Add key insights]</p>
          )}

          {/* Search Methodology */}
          <p className="ep-section-heading">Search Methodology</p>
          <ul className="ep-bullet-list">
            <li><strong>Role:</strong> {role}</li>
            <li><strong>Search Platform:</strong> LinkedIn (visible profiles only)</li>
            <li><strong>Location:</strong> {location}</li>
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

          {/* Important Remarks */}
          <p className="ep-section-heading">Important Remarks</p>
          <ul className="ep-bullet-list">
            <li>
              This dataset based solely on LinkedIn database (not all professionals maintain updated
              profiles) which align to search criteria, actual availability and expertise require
              screening and direct engagement to identify the suitable candidates for the position.
            </li>
            <li>
              Results may include from NHA companies and restricted countries, in line with EPAM
              policies for external hiring intelligence.
            </li>
            <li>
              Figures represent market estimates, not exact headcounts or hiring guarantees.
            </li>
          </ul>

          {/* Recommendations */}
          <p className="ep-section-heading">Recommendations</p>
          {form.recommendations ? (
            <p className="ep-recommendations">{form.recommendations}</p>
          ) : (
            <p className="ep-empty">[Add recommendations]</p>
          )}

        </div>
      </div>
    </>
  )
}
