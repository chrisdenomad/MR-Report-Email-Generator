/**
 * generatePlainText — produces a plain-text version of the email
 */
export function generatePlainText(form, columns, summaryRows, insights, subject) {
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'

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
    'Hi,',
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
    `*Interpretation: ${form.interpretation || '[Add interpretation]'}`,
    '',
    '──────────────────────────────────────',
    'KEY INSIGHTS',
    '──────────────────────────────────────',
    insightLines || '[Add key insights]',
    '',
    '──────────────────────────────────────',
    'SEARCH METHODOLOGY',
    '──────────────────────────────────────',
    `• Role: ${role}`,
    '• Search Platform: LinkedIn (visible profiles only)',
    `• Location: ${location}`,
    '• Excluded Company: EPAM',
    `• Total Years of Experience: ${form.totalYearsExperience || '[Add]'}`,
    `• Core Skills/Keyword: ${form.coreSkills || '[Add]'}`,
    '',
    '──────────────────────────────────────',
    'IMPORTANT REMARKS',
    '──────────────────────────────────────',
    '• This dataset based solely on LinkedIn database (not all professionals maintain updated profiles) which align to search criteria, actual availability and expertise require screening and direct engagement to identify the suitable candidates for the position.',
    '• Results may include from NHA companies and restricted countries, in line with EPAM policies for external hiring intelligence.',
    '• Figures represent market estimates, not exact headcounts or hiring guarantees.',
    '',
    '──────────────────────────────────────',
    'RECOMMENDATIONS',
    '──────────────────────────────────────',
    form.recommendations || '[Add recommendations]',
  ]

  return lines.join('\n')
}

/**
 * generateHTML — produces an HTML version of the email for rich paste
 */
export function generateHTML(form, columns, summaryRows, insights, subject) {
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'

  const sectionHeadingStyle =
    'font-weight:700;font-size:13px;color:#7a6e00;text-transform:uppercase;margin:20px 0 8px 0;letter-spacing:0.4px;'
  const bulletStyle = 'margin:3px 0;font-size:13px;'

  // Table header
  const thStyle = 'background:#f0f0f0;font-weight:700;padding:6px 10px;text-align:left;border:1px solid #ccc;'
  const tdStyle = 'padding:5px 10px;border:1px solid #ccc;'

  const theadHtml = columns
    .map(col => `<th style="${thStyle}">${col.label || '—'}</th>`)
    .join('')

  const filledRows = summaryRows.filter(row =>
    columns.some(col => row.values[col.id]?.trim())
  )
  const tbodyHtml = filledRows.length > 0
    ? filledRows.map(row =>
        `<tr>${columns.map(col => `<td style="${tdStyle}">${row.values[col.id] || '—'}</td>`).join('')}</tr>`
      ).join('')
    : `<tr><td colspan="${columns.length}" style="${tdStyle}color:#aaa;">No data</td></tr>`

  // Key insights
  const insightItemsHtml = insights
    .filter(i => i.text.trim())
    .map(i => `<li style="${bulletStyle}">${i.text}</li>`)
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.6;max-width:800px;">

<p style="margin-bottom:14px;">Hi,</p>

<p style="margin-bottom:18px;">
  I would like to share with you the market capacity research for
  <strong>${role}</strong> in <strong>${location}</strong>.
</p>

<p style="${sectionHeadingStyle}">Research Summary</p>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px;">
  <thead><tr>${theadHtml}</tr></thead>
  <tbody>${tbodyHtml}</tbody>
</table>

<p style="color:#2e9e74;font-style:italic;text-decoration:underline;font-size:13px;margin:8px 0 10px 0;">
  Bar chart / Pie chart for visualization
</p>

<p style="font-size:13px;margin-bottom:14px;">
  <em><strong>*Interpretation:</strong></em> ${form.interpretation || '[Add interpretation]'}
</p>

<p style="${sectionHeadingStyle}">Key Insights</p>
<ul style="padding-left:20px;margin:4px 0 10px 0;">
  ${insightItemsHtml || `<li style="${bulletStyle}color:#aaa;">[Add key insights]</li>`}
</ul>

<p style="${sectionHeadingStyle}">Search Methodology</p>
<ul style="padding-left:20px;margin:4px 0 10px 0;">
  <li style="${bulletStyle}"><strong>Role:</strong> ${role}</li>
  <li style="${bulletStyle}"><strong>Search Platform:</strong> LinkedIn (visible profiles only)</li>
  <li style="${bulletStyle}"><strong>Location:</strong> ${location}</li>
  <li style="${bulletStyle}"><strong>Excluded Company:</strong> EPAM</li>
  <li style="${bulletStyle}"><strong>Total Years of Experience:</strong> ${form.totalYearsExperience || '[Add]'}</li>
  <li style="${bulletStyle}"><strong>Core Skills/Keyword:</strong> ${form.coreSkills || '[Add]'}</li>
</ul>

<p style="${sectionHeadingStyle}">Important Remarks</p>
<ul style="padding-left:20px;margin:4px 0 10px 0;">
  <li style="${bulletStyle}">This dataset based solely on LinkedIn database (not all professionals maintain updated profiles) which align to search criteria, actual availability and expertise require screening and direct engagement to identify the suitable candidates for the position.</li>
  <li style="${bulletStyle}">Results may include from NHA companies and restricted countries, in line with EPAM policies for external hiring intelligence.</li>
  <li style="${bulletStyle}">Figures represent market estimates, not exact headcounts or hiring guarantees.</li>
</ul>

<p style="${sectionHeadingStyle}">Recommendations</p>
<p style="font-size:13px;white-space:pre-wrap;">${form.recommendations || '[Add recommendations]'}</p>

</body>
</html>`
}
