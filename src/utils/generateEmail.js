// ── Shared boilerplate ────────────────────────────────────────────────────────
export const IMPORTANT_REMARKS = [
  'This dataset is based solely on LinkedIn database (not all professionals maintain updated profiles) which align to search criteria, actual availability and expertise require screening and direct engagement to identify the suitable candidates for the position.',
  'Results may include from NHA companies and restricted countries, in line with EPAM policies for external hiring intelligence.',
  'Figures represent market estimates, not exact headcounts or hiring guarantees.',
]

/**
 * generatePlainText — produces a plain-text version of the email
 */
export function generatePlainText(form, columns, summaryRows, insights, subject, effectiveMethodologyRole, effectiveMethodologyLocation) {
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  // Build table header
  const colLabels = columns.map(c => c.label || '—').join(' | ')
  const colSeparator = columns.map(() => '─────────────').join('─┼─')

  // Build table rows
  const filledRows = summaryRows.filter(row =>
    columns.some(col => row.values[col.id]?.trim())
  )
  const tableRows = filledRows.length > 0
    ? filledRows.map(row =>
        '  ' + columns.map(col => row.values[col.id] || '—').join(' | ')
      ).join('\n')
    : '  (no data)'

  // Key insights
  const insightLines = insights
    .filter(i => i.text.trim())
    .map(i => `• ${i.text}`)
    .join('\n')

  const lines = [
    `Subject: ${subject}`,
    '',
    greeting,
    '',
    `I would like to share with you the market capacity research for ${role} in ${location}.`,
    '',
    '──────────────────────────────────────',
    'RESEARCH SUMMARY',
    '──────────────────────────────────────',
    `  ${colLabels}`,
    `  ${colSeparator}`,
    tableRows,
    '',
    '[Bar chart / Pie chart for visualization]',
    '',
    form.interpretation || '[Add interpretation]',
    '',
    '──────────────────────────────────────',
    'KEY INSIGHTS',
    '──────────────────────────────────────',
    insightLines || '[Add key insights]',
    '',
    '──────────────────────────────────────',
    'SEARCH METHODOLOGY',
    '──────────────────────────────────────',
    `• Role: ${effectiveMethodologyRole || '[Add role]'}`,
    '• Search Platform: LinkedIn (visible profiles only)',
    `• Location: ${effectiveMethodologyLocation || '[Add location]'}`,
    '• Excluded Company: EPAM',
    `• Total Years of Experience: ${form.totalYearsExperience || '[Add]'}`,
    `• Core Skills/Keyword: ${form.coreSkills || '[Add]'}`,
    '',
    '──────────────────────────────────────',
    'IMPORTANT REMARKS',
    '──────────────────────────────────────',
    ...IMPORTANT_REMARKS.map(r => `• ${r}`),
    '',
    '──────────────────────────────────────',
    'RECOMMENDATIONS',
    '──────────────────────────────────────',
    form.recommendations || '[Add recommendations]',
  ]

  return lines.join('\n')
}

/**
 * generateHTML — produces a fully Outlook-compatible HTML email.
 *
 * Rules followed for Outlook compatibility:
 *  - Every style is 100% inline — no <style> blocks, no CSS classes
 *  - No CSS shorthand (e.g. font: ... or border: ...) — always explicit properties
 *  - No CSS variables
 *  - Tables use cellpadding/cellspacing/border HTML attributes (not just CSS)
 *  - Explicit font-family on every text element (Outlook strips inherited fonts)
 *  - No flexbox / grid — tables only for layout
 *  - mso-line-height-rule for Outlook line-height consistency
 */
export function generateHTML(form, columns, summaryRows, insights, subject, effectiveMethodologyRole, effectiveMethodologyLocation) {
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  // ── Inline style constants (Outlook-safe, no shorthand) ──
  const bodyStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 14px',
    'color: #1a1a1a',
    'line-height: 1.6',
    'mso-line-height-rule: exactly',
    'margin: 0',
    'padding: 20px',
    'background-color: #ffffff',
  ].join(';')

  const wrapperStyle = [
    'max-width: 750px',
    'margin-left: auto',
    'margin-right: auto',
  ].join(';')

  const pStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 14px',
    'color: #1a1a1a',
    'line-height: 1.6',
    'mso-line-height-rule: exactly',
    'margin-top: 0',
    'margin-bottom: 14px',
  ].join(';')

  const sectionHeadingStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 12px',
    'font-weight: bold',
    'color: #7a6e00',
    'text-transform: uppercase',
    'letter-spacing: 0.4px',
    'margin-top: 20px',
    'margin-bottom: 8px',
    'margin-left: 0',
    'margin-right: 0',
    'padding-top: 8px',
    'border-top-width: 1px',
    'border-top-style: solid',
    'border-top-color: #e0e0e0',
  ].join(';')

  const ulStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 13px',
    'color: #1a1a1a',
    'margin-top: 4px',
    'margin-bottom: 10px',
    'margin-left: 0',
    'margin-right: 0',
    'padding-left: 20px',
  ].join(';')

  const liStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 13px',
    'color: #1a1a1a',
    'line-height: 1.6',
    'mso-line-height-rule: exactly',
    'margin-top: 3px',
    'margin-bottom: 3px',
  ].join(';')

  const thStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 12px',
    'font-weight: bold',
    'color: #1a1a1a',
    'background-color: #f0f0f0',
    'padding-top: 6px',
    'padding-bottom: 6px',
    'padding-left: 10px',
    'padding-right: 10px',
    'text-align: left',
    'border-top-width: 1px',
    'border-top-style: solid',
    'border-top-color: #cccccc',
    'border-bottom-width: 1px',
    'border-bottom-style: solid',
    'border-bottom-color: #cccccc',
    'border-left-width: 1px',
    'border-left-style: solid',
    'border-left-color: #cccccc',
    'border-right-width: 1px',
    'border-right-style: solid',
    'border-right-color: #cccccc',
  ].join(';')

  const tdStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 12px',
    'color: #1a1a1a',
    'padding-top: 5px',
    'padding-bottom: 5px',
    'padding-left: 10px',
    'padding-right: 10px',
    'border-top-width: 1px',
    'border-top-style: solid',
    'border-top-color: #cccccc',
    'border-bottom-width: 1px',
    'border-bottom-style: solid',
    'border-bottom-color: #cccccc',
    'border-left-width: 1px',
    'border-left-style: solid',
    'border-left-color: #cccccc',
    'border-right-width: 1px',
    'border-right-style: solid',
    'border-right-color: #cccccc',
  ].join(';')

  const tableStyle = [
    'width: 100%',
    'border-collapse: collapse',
    'border-spacing: 0',
    'font-size: 12px',
    'margin-bottom: 10px',
  ].join(';')

  const chartNoteStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 12px',
    'color: #2e9e74',
    'font-style: italic',
    'text-decoration: underline',
    'margin-top: 8px',
    'margin-bottom: 10px',
    'margin-left: 0',
    'margin-right: 0',
  ].join(';')

  const strongStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-weight: bold',
    'color: #1a1a1a',
  ].join(';')

  // ── Table HTML ──
  const theadHtml = columns
    .map(col => `<th style="${thStyle}">${escapeHtml(col.label || '—')}</th>`)
    .join('')

  const filledRows = summaryRows.filter(row =>
    columns.some(col => row.values[col.id]?.trim())
  )

  const tdEmptyStyle = tdStyle + ';color:#aaaaaa;'
  const tbodyHtml = filledRows.length > 0
    ? filledRows.map(row =>
        `<tr>${columns.map(col =>
          `<td style="${tdStyle}">${escapeHtml(row.values[col.id] || '—')}</td>`
        ).join('')}</tr>`
      ).join('')
    : `<tr><td colspan="${columns.length}" style="${tdEmptyStyle}">No data</td></tr>`

  // ── Insights HTML ──
  const insightItemsHtml = insights
    .filter(i => i.text.trim())
    .map(i => `<li style="${liStyle}">${escapeHtml(i.text)}</li>`)
    .join('')

  const interpretationHtml = form.interpretation
    ? `<p style="${pStyle}">${escapeHtml(form.interpretation)}</p>`
    : ''

  const recommendationsHtml = form.recommendations
    ? escapeHtml(form.recommendations).replace(/\n/g, '<br>')
    : '[Add recommendations]'

  // ── Remarks HTML ──
  const remarksHtml = IMPORTANT_REMARKS
    .map(r => `<li style="${liStyle}">${r}</li>`)
    .join('')

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
</head>
<body style="${bodyStyle}">
<div style="${wrapperStyle}">

<p style="${pStyle}">${greeting}</p>

<p style="${pStyle}">
  I would like to share with you the market capacity research for
  <strong style="${strongStyle}">${escapeHtml(role)}</strong> in <strong style="${strongStyle}">${escapeHtml(location)}</strong>.
</p>

<p style="${sectionHeadingStyle}">Research Summary</p>
<table style="${tableStyle}" cellpadding="0" cellspacing="0" border="0" width="100%">
  <thead>
    <tr>${theadHtml}</tr>
  </thead>
  <tbody>
    ${tbodyHtml}
  </tbody>
</table>

<p style="${chartNoteStyle}">Bar chart / Pie chart for visualization</p>

${interpretationHtml}

<p style="${sectionHeadingStyle}">Key Insights</p>
<ul style="${ulStyle}">
  ${insightItemsHtml || `<li style="${liStyle};color:#aaaaaa;">[Add key insights]</li>`}
</ul>

<p style="${sectionHeadingStyle}">Search Methodology</p>
<ul style="${ulStyle}">
  <li style="${liStyle}"><strong style="${strongStyle}">Role:</strong> ${escapeHtml(effectiveMethodologyRole || '[Add role]')}</li>
  <li style="${liStyle}"><strong style="${strongStyle}">Search Platform:</strong> LinkedIn (visible profiles only)</li>
  <li style="${liStyle}"><strong style="${strongStyle}">Location:</strong> ${escapeHtml(effectiveMethodologyLocation || '[Add location]')}</li>
  <li style="${liStyle}"><strong style="${strongStyle}">Excluded Company:</strong> EPAM</li>
  <li style="${liStyle}"><strong style="${strongStyle}">Total Years of Experience:</strong> ${escapeHtml(form.totalYearsExperience || '[Add]')}</li>
  <li style="${liStyle}"><strong style="${strongStyle}">Core Skills/Keyword:</strong> ${escapeHtml(form.coreSkills || '[Add]')}</li>
</ul>

<p style="${sectionHeadingStyle}">Important Remarks</p>
<ul style="${ulStyle}">
  ${remarksHtml}
</ul>

<p style="${sectionHeadingStyle}">Recommendations</p>
<p style="${pStyle}">${recommendationsHtml}</p>

</div>
</body>
</html>`
}

// ── HTML escape helper ────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
