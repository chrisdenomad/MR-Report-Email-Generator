/**
 * generatePlainText — produces a plain-text version of the email
 */
export function generatePlainText(form, summaryRows, subject) {
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'

  const tableRows = summaryRows
    .filter(r => r.level || r.candidates || r.percent)
    .map(r => `  ${r.level || '—'} | ${r.candidates || '—'} | ${r.percent ? r.percent + '%' : '—'}`)
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
    '  Level / Category | Candidates Found | %',
    tableRows || '  (no data)',
    '',
    '[Bar chart / Pie chart for visualization]',
    '',
    `*Interpretation: ${form.interpretation || '[Add interpretation]'}`,
    `• What does this mean? ${form.whatDoesThisMean || '[Add answer]'}`,
    `• Is this risky? ${form.isThisRisky || '[Add answer]'}`,
    `• Can we scale? ${form.canWeScale || '[Add answer]'}`,
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
    'KEY INSIGHTS',
    '──────────────────────────────────────',
    `• ~${form.seniorPlusPercent || 'XX'}% of profiles meet Senior+ criteria`,
    `• Core technical skills are ${form.skillsAvailability}`,
    `• Domain-experienced talent represents ~${form.domainExperiencedPercent || 'XX'}% of the total pool`,
    `• Talent concentration is highest in ${form.talentConcentrationCity || '[City / Cities]'}`,
    `• ${form.architectNote}`,
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
export function generateHTML(form, summaryRows, subject) {
  const role = form.role || '[Role]'
  const location = form.location || '[Location]'

  const tableRowsHtml = summaryRows
    .filter(r => r.level || r.candidates || r.percent)
    .map(
      r => `
      <tr>
        <td style="padding:5px 10px;border:1px solid #ccc;">${r.level || '—'}</td>
        <td style="padding:5px 10px;border:1px solid #ccc;">${r.candidates || '—'}</td>
        <td style="padding:5px 10px;border:1px solid #ccc;">${r.percent ? r.percent + '%' : '—'}</td>
      </tr>`
    )
    .join('')

  const sectionHeadingStyle =
    'font-weight:700;font-size:13px;color:#7a6e00;text-transform:uppercase;margin:20px 0 8px 0;letter-spacing:0.4px;'
  const bulletStyle = 'margin:3px 0;font-size:13px;'

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
  <thead>
    <tr>
      <th style="background:#f0f0f0;font-weight:700;padding:6px 10px;text-align:left;border:1px solid #ccc;">Level / Category</th>
      <th style="background:#f0f0f0;font-weight:700;padding:6px 10px;text-align:left;border:1px solid #ccc;">Candidates Found</th>
      <th style="background:#f0f0f0;font-weight:700;padding:6px 10px;text-align:left;border:1px solid #ccc;">%</th>
    </tr>
  </thead>
  <tbody>
    ${tableRowsHtml || '<tr><td colspan="3" style="padding:5px 10px;border:1px solid #ccc;color:#aaa;">No data</td></tr>'}
  </tbody>
</table>

<p style="color:#2e9e74;font-style:italic;text-decoration:underline;font-size:13px;margin:8px 0 10px 0;">
  Bar chart / Pie chart for visualization
</p>

<p style="font-size:13px;margin-bottom:6px;">
  <em><strong>*Interpretation:</strong></em> ${form.interpretation || '[Add interpretation]'}
</p>
<ul style="padding-left:20px;margin:4px 0 10px 0;">
  <li style="${bulletStyle}">What does this mean? ${form.whatDoesThisMean || '[Add answer]'}</li>
  <li style="${bulletStyle}">Is this risky? ${form.isThisRisky || '[Add answer]'}</li>
  <li style="${bulletStyle}">Can we scale? ${form.canWeScale || '[Add answer]'}</li>
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

<p style="${sectionHeadingStyle}">Key Insights</p>
<ul style="padding-left:20px;margin:4px 0 10px 0;">
  <li style="${bulletStyle}">~${form.seniorPlusPercent || 'XX'}% of profiles meet Senior+ criteria</li>
  <li style="${bulletStyle}">Core technical skills are ${form.skillsAvailability}</li>
  <li style="${bulletStyle}">Domain-experienced talent represents ~${form.domainExperiencedPercent || 'XX'}% of the total pool</li>
  <li style="${bulletStyle}">Talent concentration is highest in ${form.talentConcentrationCity || '[City / Cities]'}</li>
  <li style="${bulletStyle}">${form.architectNote}</li>
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
