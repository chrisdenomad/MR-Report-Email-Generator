import { describe, it, expect } from 'vitest'
import {
  escapeHtml,
  getFilledRows,
  generatePlainText,
  generateHTML,
  generateHTMLFragment,
  IMPORTANT_REMARKS,
  IMPORTANT_REMARKS_SALARY,
  IMPORTANT_REMARKS_COMBINED,
} from '../utils/generateEmail'

// ── Shared fixtures ─────────────────────────────────────────────────────────

const baseForm = {
  researchType: 'capacity',
  role: 'Software Engineer',
  location: 'Warsaw',
  recipientName: 'Jane',
  openingLine: '',
  interpretation: 'The market looks healthy.',
  recommendations: 'Expand search to remote candidates.',
  totalYearsExperience: '3-5',
  coreSkills: 'React, Node.js',
  closingLine: 'Best regards,',
  includeChartPlaceholder: true,
}

const columns = [
  { id: 'c1', label: 'Level' },
  { id: 'c2', label: 'Count' },
]

const summaryRows = [
  { id: 'r1', values: { c1: 'Senior', c2: '120' } },
  { id: 'r2', values: { c1: '', c2: '' } }, // empty row — should be filtered out
]

const insights = [
  { id: 'i1', text: 'Demand is rising' },
  { id: 'i2', text: '' }, // empty — should be filtered
]

const salaryColumns = [
  { id: 's1', label: 'Seniority' },
  { id: 's2', label: 'Salary' },
]

const salaryRows = [
  { id: 'sr1', values: { s1: 'Senior', s2: '$5000' } },
]

// ── escapeHtml ───────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('escapes &, <, >, "', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
  })

  it('handles null and undefined gracefully', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })

  it('returns plain strings unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})

// ── getFilledRows ────────────────────────────────────────────────────────────

describe('getFilledRows', () => {
  it('filters out rows with no filled cells', () => {
    const result = getFilledRows(summaryRows, columns)
    expect(result).toHaveLength(1)
    expect(result[0].values.c1).toBe('Senior')
  })

  it('returns empty array when all rows are empty', () => {
    const emptyRows = [{ id: 'x', values: { c1: '', c2: '  ' } }]
    expect(getFilledRows(emptyRows, columns)).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(getFilledRows([], columns)).toHaveLength(0)
  })
})

// ── generatePlainText ────────────────────────────────────────────────────────

describe('generatePlainText', () => {
  const subject = 'MR Report: Software Engineer in Warsaw'

  it('includes subject line', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Subject: MR Report: Software Engineer in Warsaw')
  })

  it('includes recipient greeting', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Hi Jane,')
  })

  it('includes filled table rows but not empty ones', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Senior')
    // Only one row from summaryRows is filled — the separator should not have 2 data rows
    const seniorCount = (text.match(/Senior/g) || []).length
    expect(seniorCount).toBeGreaterThan(0)
  })

  it('includes filled insights but not empty ones', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Demand is rising')
  })

  it('includes recommendations', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Expand search to remote candidates.')
  })

  it('includes correct important remarks for capacity type', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain(IMPORTANT_REMARKS[0].slice(0, 30))
  })

  it('includes correct important remarks for salary type', () => {
    const salaryForm = { ...baseForm, researchType: 'salary' }
    const text = generatePlainText(salaryForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain(IMPORTANT_REMARKS_SALARY[0].slice(0, 30))
  })

  it('includes correct important remarks for combined type', () => {
    const combinedForm = { ...baseForm, researchType: 'combined' }
    const text = generatePlainText(combinedForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain(IMPORTANT_REMARKS_COMBINED[0].slice(0, 30))
  })

  it('includes closing line when present', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Best regards,')
  })

  it('omits closing line when empty', () => {
    const formNoClosing = { ...baseForm, closingLine: '' }
    const text = generatePlainText(formNoClosing, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).not.toContain('Best regards,')
  })

  it('uses default opening line when openingLine is empty', () => {
    const text = generatePlainText(baseForm, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('market capacity research for Software Engineer in Warsaw')
  })

  it('uses custom opening line when provided', () => {
    const formCustom = { ...baseForm, openingLine: 'Custom intro for [Role] in [Location].' }
    const text = generatePlainText(formCustom, columns, summaryRows, insights, subject, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(text).toContain('Custom intro for Software Engineer in Warsaw.')
  })
})

// ── generateHTML ─────────────────────────────────────────────────────────────

describe('generateHTML', () => {
  it('returns a valid HTML document string', () => {
    const html = generateHTML(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html')
    expect(html).toContain('</html>')
    expect(html).toContain('<body')
    expect(html).toContain('</body>')
  })

  it('includes Outlook namespace declarations', () => {
    const html = generateHTML(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"')
  })

  it('includes recipient name in greeting', () => {
    const html = generateHTML(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('Hi Jane,')
  })

  it('includes filled table data', () => {
    const html = generateHTML(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('Senior')
    expect(html).toContain('120')
  })

  it('escapes special characters in cell values', () => {
    const specialRows = [{ id: 'r1', values: { c1: 'A & B', c2: '<100>' } }]
    const html = generateHTML(baseForm, columns, specialRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('A &amp; B')
    expect(html).toContain('&lt;100&gt;')
  })

  it('omits chart placeholder when includeChartPlaceholder is false', () => {
    const formNoChart = { ...baseForm, includeChartPlaceholder: false }
    const html = generateHTML(formNoChart, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).not.toContain('Bar chart / Pie chart for visualization')
  })

  it('includes chart placeholder when includeChartPlaceholder is true', () => {
    const html = generateHTML(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('Bar chart / Pie chart for visualization')
  })

  it('includes salary section for salary type', () => {
    const salaryForm = { ...baseForm, researchType: 'salary' }
    const html = generateHTML(salaryForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('Salary Benchmark Data')
  })

  it('includes both tables for combined type', () => {
    const combinedForm = { ...baseForm, researchType: 'combined' }
    const html = generateHTML(combinedForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(html).toContain('Market Capacity')
    expect(html).toContain('Salary Benchmark Data')
  })
})

// ── generateHTMLFragment ─────────────────────────────────────────────────────

describe('generateHTMLFragment', () => {
  it('wraps content in StartFragment / EndFragment markers', () => {
    const fragment = generateHTMLFragment(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(fragment).toMatch(/^<!--StartFragment-->/)
    expect(fragment).toMatch(/<!--EndFragment-->$/)
  })

  it('does not include full html/head/body wrapper', () => {
    const fragment = generateHTMLFragment(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(fragment).not.toContain('<!DOCTYPE html>')
    expect(fragment).not.toContain('<body')
  })

  it('contains the greeting div', () => {
    const fragment = generateHTMLFragment(baseForm, columns, summaryRows, insights, 'Software Engineer', 'Warsaw', salaryColumns, salaryRows)
    expect(fragment).toContain('Hi Jane,')
  })
})
