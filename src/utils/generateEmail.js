// ── Shared boilerplate ────────────────────────────────────────────────────────
// Content suggestion #4: simplified, cleaner language for hiring managers
export const IMPORTANT_REMARKS = [
  'Data is sourced from LinkedIn and reflects publicly visible profiles matching the search criteria. Actual availability requires direct engagement and screening.',
  'Results may include profiles from restricted companies or regions, subject to EPAM hiring policies.',
  'Figures represent market estimates, not exact headcounts or hiring guarantees.',
]

export const IMPORTANT_REMARKS_SALARY = [
  'Salary data is sourced from publicly available market surveys and self-reported data (e.g. LinkedIn Salary, Glassdoor, and similar sources).',
  'Figures represent market estimates and may vary by company size, industry, and location.',
  'Data reflects market conditions at the time of research and may not capture recent compensation shifts.',
]

// ── Shared helper: filter rows that have at least one filled cell ─────────────
export function getFilledRows(rows, columns) {
  return rows.filter(row => columns.some(col => row.values[col.id]?.trim()))
}

// ── HTML escape helper ────────────────────────────────────────────────────────
export function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * generatePlainText — produces a plain-text version of the email
 */
export function generatePlainText(form, columns, summaryRows, insights, subject, effectiveMethodologyRole, effectiveMethodologyLocation) {
  const isSalary = form.researchType === 'salary'
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  const openingLine = (form.openingLine || (isSalary
    ? 'I would like to share with you the salary benchmark research for [Role] in [Location].'
    : 'I would like to share with you the market capacity research for [Role] in [Location].'))
    .replace('[Role]', role)
    .replace('[Location]', location)

  // Build table
  const colLabels = columns.map(c => c.label || '—').join(' | ')
  const colSeparator = columns.map(() => '─────────────').join('─┼─')
  const filledRows = getFilledRows(summaryRows, columns)
  const tableRows = filledRows.length > 0
    ? filledRows.map(row =>
        '  ' + columns.map(col => row.values[col.id] || '—').join(' | ')
      ).join('\n')
    : '  (no data)'

  const summaryHeading = isSalary ? 'SALARY BENCHMARK DATA' : 'RESEARCH SUMMARY'
  const chartLabel = isSalary ? '[Salary range chart for visualization]' : '[Bar chart / Pie chart for visualization]'
  const activeRemarks = isSalary ? IMPORTANT_REMARKS_SALARY : IMPORTANT_REMARKS

  const capacitySections = [
    '',
    '──────────────────────────────────────',
    'KEY INSIGHTS',
    '──────────────────────────────────────',
    insights.filter(i => i.text.trim()).map(i => `• ${i.text}`).join('\n') || '[Add key insights]',
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
  ]

  const lines = [
    `Subject: ${subject}`,
    '',
    greeting,
    '',
    openingLine,
    '',
    '──────────────────────────────────────',
    summaryHeading,
    '──────────────────────────────────────',
    `  ${colLabels}`,
    `  ${colSeparator}`,
    tableRows,
    '',
    ...(form.includeChartPlaceholder !== false ? [chartLabel, ''] : []),
    ...(!isSalary ? [form.interpretation || '[Add interpretation]', ''] : []),
    ...(!isSalary ? capacitySections : []),
    '',
    '──────────────────────────────────────',
    'RECOMMENDATIONS',
    '──────────────────────────────────────',
    form.recommendations || '[Add recommendations]',
    '',
    '──────────────────────────────────────',
    'IMPORTANT REMARKS',
    '──────────────────────────────────────',
    ...activeRemarks.map(r => `• ${r}`),
    ...(form.closingLine?.trim() ? ['', form.closingLine] : []),
  ]

  return lines.join('\n')
}

/**
 * generateHTMLFragment — produces the inner body content only (no <html>/<head>/<body> wrappers).
 *
 * Use this for clipboard "paste as formatting" into Outlook.
 * Outlook's paste handler expects an HTML fragment, not a full document.
 * Wrapping in <!--StartFragment--> / <!--EndFragment--> satisfies the CF_HTML
 * clipboard spec so Outlook knows exactly where the pasteable content begins/ends.
 *
 * The root <div> carries explicit mso-* properties so Outlook does not override
 * the font, size, or line-height after pasting.
 */
export function generateHTMLFragment(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation) {
  const _innerDiv = _buildInnerDiv(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation)
  return `<!--StartFragment-->${_innerDiv}<!--EndFragment-->`
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
export function generateHTML(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation) {
  const innerDiv = _buildInnerDiv(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation)

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
${innerDiv}
</body>
</html>`
}

// ── Private helper — builds the inner <div> shared by both generateHTML and generateHTMLFragment ──
// Not exported. All HTML content and inline styles live here.
function _buildInnerDiv(form, columns, summaryRows, insights, effectiveMethodologyRole, effectiveMethodologyLocation) {
  const isSalary = form.researchType === 'salary'
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'
  const recipientName = form.recipientName || ''
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  // Content suggestion #1: editable opening line with role/location interpolated
  const openingLine = (form.openingLine || (isSalary
    ? 'I would like to share with you the salary benchmark research for [Role] in [Location].'
    : 'I would like to share with you the market capacity research for [Role] in [Location].'))
    .replace('[Role]', role)
    .replace('[Location]', location)

  // ── Inline style constants (Outlook-safe, no shorthand) ──
  // The wrapperStyle carries explicit mso-* properties so Outlook does not
  // override font, size, or line-height when the fragment is pasted.
  const wrapperStyle = [
    'max-width: 750px',
    'margin-left: auto',
    'margin-right: auto',
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 14px',
    'color: #1a1a1a',
    'line-height: 1.6',
    'mso-line-height-rule: exactly',
    'mso-margin-top-alt: 0',
    'mso-margin-bottom-alt: 0',
  ].join(';')

  const pStyle = [
    'font-family: Arial, Helvetica, sans-serif',
    'font-size: 14px',
    'color: #1a1a1a',
    'line-height: 1.6',
    'mso-line-height-rule: exactly',
    'margin-top: 0',
    'margin-bottom: 14px',
    'mso-margin-top-alt: 0',
    'mso-margin-bottom-alt: 14px',
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
    'mso-margin-top-alt: 20px',
    'mso-margin-bottom-alt: 8px',
    'padding-top: 8px',
    'padding-bottom: 4px',
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
    'mso-margin-top-alt: 4px',
    'mso-margin-bottom-alt: 10px',
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
    'mso-margin-top-alt: 3px',
    'mso-margin-bottom-alt: 3px',
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
    'mso-table-lspace: 0pt',
    'mso-table-rspace: 0pt',
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
    'mso-margin-top-alt: 8px',
    'mso-margin-bottom-alt: 10px',
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

  const filledRows = getFilledRows(summaryRows, columns)

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

  // Handle both \n and \r\n (Windows line endings from pasted content)
  const recommendationsHtml = form.recommendations
    ? escapeHtml(form.recommendations).replace(/\r?\n/g, '<br>')
    : '[Add recommendations]'

  // Content suggestion #6: closing line HTML
  const closingLineHtml = form.closingLine?.trim()
    ? `<p style="${pStyle}">${escapeHtml(form.closingLine)}</p>`
    : ''

  const remarksHtml = (isSalary ? IMPORTANT_REMARKS_SALARY : IMPORTANT_REMARKS)
    .map(r => `<li style="${liStyle}">${escapeHtml(r)}</li>`)
    .join('')

  // Content suggestion #5: conditional chart placeholder
  const chartLabel = isSalary ? 'Salary range chart for visualization' : 'Bar chart / Pie chart for visualization'
  const chartPlaceholderHtml = form.includeChartPlaceholder !== false
    ? `\n<p style="${chartNoteStyle}">${chartLabel}</p>\n`
    : ''

  const summaryHeading = isSalary ? 'Salary Benchmark Data' : 'Research Summary'

  return `<div style="${wrapperStyle}">

<p style="${pStyle}">${greeting}</p>

<p style="${pStyle}">${escapeHtml(openingLine)}</p>

<p style="${sectionHeadingStyle}">${summaryHeading}</p>
<table style="${tableStyle}" cellpadding="0" cellspacing="0" border="0" width="100%">
  <thead>
    <tr>${theadHtml}</tr>
  </thead>
  <tbody>
    ${tbodyHtml}
  </tbody>
</table>
${chartPlaceholderHtml}
${!isSalary ? interpretationHtml : ''}

${!isSalary ? `<p style="${sectionHeadingStyle}">Key Insights</p>
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
` : ''}
<p style="${sectionHeadingStyle}">Recommendations</p>
<p style="${pStyle}">${recommendationsHtml}</p>

<p style="${sectionHeadingStyle}">Important Remarks</p>
<ul style="${ulStyle}">
  ${remarksHtml}
</ul>

${closingLineHtml}
<p style="${pStyle}">&#8203;</p>

</div>`
}
