import { getFilledRows } from './generateEmail'

const GITHUB_AI_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions'
const GITHUB_AI_MODEL = 'gpt-4o-mini'
// Fix #13: abort AI requests that hang longer than 15 seconds
const AI_TIMEOUT_MS = 15000

// Fix #7: shared system prompt base to avoid duplication across all three functions
const BASE_SYSTEM_PROMPT = `You are a market research analyst writing concise email content for a recruiter at EPAM.
Write in a professional but approachable tone. Be specific and data-driven.`

/**
 * Low-level call to GitHub Models API (OpenAI-compatible)
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {string} apiKey - GitHub Personal Access Token entered by the user
 * @param {number} maxTokens - max response tokens (varies by use case)
 */
async function callAI(systemPrompt, userPrompt, apiKey, maxTokens = 600) {
  const key = apiKey?.trim()
  if (!key) {
    throw new Error('No API key set. Paste your GitHub token into the GitHub API Key field.')
  }

  // Fix #13: abort the request if it hangs beyond AI_TIMEOUT_MS
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  let response
  try {
    response = await fetch(GITHUB_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GITHUB_AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI request timed out. Please try again.')
    }
    throw new Error(`Network error: ${err.message}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Invalid or expired GitHub token (401). Make sure your token is a valid GitHub Personal Access Token from github.com/settings/tokens and that your account has access to GitHub Models.'
      )
    }
    if (response.status === 403) {
      throw new Error(
        'Access denied (403). Your token may not have access to GitHub Models. Visit github.com/marketplace/models to check your access.'
      )
    }
    const err = await response.text()
    throw new Error(`AI request failed (${response.status}): ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('AI returned an empty response. Please try again.')
  }
  return content
}

/**
 * Build a compact summary of the research table for AI prompts
 */
function buildTableSummary(columns, summaryRows) {
  const filledRows = getFilledRows(summaryRows, columns)
  if (filledRows.length === 0) return 'No research data entered yet.'

  const header = columns.map(c => c.label || 'Column').join(' | ')
  const separator = columns.map(() => '---').join(' | ')
  const rows = filledRows.map(row =>
    columns.map(col => row.values[col.id] || '—').join(' | ')
  ).join('\n')

  return `${header}\n${separator}\n${rows}`
}

/**
 * Content suggestion #2: derive total candidate count from table data
 * Sums numeric values across all cells — gracefully ignores non-numeric entries.
 */
function deriveTotalCandidates(columns, summaryRows) {
  const filledRows = getFilledRows(summaryRows, columns)
  let total = 0
  filledRows.forEach(row => {
    columns.forEach(col => {
      const val = parseFloat(String(row.values[col.id] || '').replace(/[^0-9.]/g, ''))
      if (!isNaN(val)) total += val
    })
  })
  return total > 0 ? Math.round(total) : null
}

/**
 * Generate interpretation sentence from research data
 */
export async function generateInterpretation(form, columns, summaryRows, apiKey) {
  const tableSummary = buildTableSummary(columns, summaryRows)
  const totalCandidates = deriveTotalCandidates(columns, summaryRows)

  const systemPrompt = `${BASE_SYSTEM_PROMPT}
Your output should be a single paragraph (2-4 sentences) — no headers, no bullet points, no preamble.`

  const userPrompt = `Write an interpretation paragraph for a Market Capacity Report email.

Role: ${form.role || 'Not specified'}
Location: ${form.location || 'Not specified'}
${form.recipientName ? `Hiring manager: ${form.recipientName}` : ''}
${totalCandidates ? `Total candidates in pool: approximately ${totalCandidates}` : ''}
Research table data:
${tableSummary}

The interpretation should summarize what the numbers tell us about the market — availability, seniority distribution, and any notable patterns. Be concise and factual.`

  return callAI(systemPrompt, userPrompt, apiKey, 400)
}

/**
 * Generate key insights bullet points from research data
 */
export async function generateKeyInsights(form, columns, summaryRows, apiKey) {
  const tableSummary = buildTableSummary(columns, summaryRows)
  const totalCandidates = deriveTotalCandidates(columns, summaryRows)

  const systemPrompt = `${BASE_SYSTEM_PROMPT}
Return 3 to 5 bullet points depending on how much data is available. Each bullet should be a single sentence starting with a data point or observation.
Output ONLY the bullet points, one per line, each starting with "• ". No headers, no preamble, no numbering.`

  const userPrompt = `Generate key insights for a Market Capacity Report email.

Role: ${form.role || 'Not specified'}
Location: ${form.location || 'Not specified'}
${form.recipientName ? `Hiring manager: ${form.recipientName}` : ''}
${totalCandidates ? `Total candidates in pool: approximately ${totalCandidates}` : ''}
Research table data:
${tableSummary}

Insights should cover: seniority distribution, skill availability, talent concentration by city, competition level, and hiring cycle expectations.`

  const raw = await callAI(systemPrompt, userPrompt, apiKey, 600)

  // Parse bullet lines → array of strings, handle •, -, *, and numbered lists
  return raw
    .split('\n')
    .map(line => line.replace(/^(\d+\.\s*|[•\-*]\s*)/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 5)
}

/**
 * Generate recommendations paragraph from all form data
 */
export async function generateRecommendations(form, columns, summaryRows, apiKey) {
  const tableSummary = buildTableSummary(columns, summaryRows)
  const totalCandidates = deriveTotalCandidates(columns, summaryRows)

  const systemPrompt = `${BASE_SYSTEM_PROMPT}
Be specific and actionable. Your output should be 3-5 sentences — no headers, no bullet points, no preamble.`

  const userPrompt = `Write a recommendations paragraph for a Market Capacity Report email.

Role: ${form.role || 'Not specified'}
Location: ${form.location || 'Not specified'}
${form.recipientName ? `Hiring manager: ${form.recipientName}` : ''}
${totalCandidates ? `Total candidates in pool: approximately ${totalCandidates}` : ''}
Years of experience required: ${form.totalYearsExperience || 'Not specified'}
Core skills: ${form.coreSkills || 'Not specified'}
Research table data:
${tableSummary}
Interpretation: ${form.interpretation || 'Not provided'}

Recommendations should advise the hiring manager on sourcing strategy, realistic expectations, and any adjustments to consider (e.g. broadening location, adjusting seniority requirements, pipeline timing).`

  return callAI(systemPrompt, userPrompt, apiKey, 600)
}
