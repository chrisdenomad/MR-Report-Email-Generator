const GITHUB_AI_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions'
const GITHUB_AI_MODEL = 'gpt-4o-mini'

/**
 * Low-level call to GitHub Models API (OpenAI-compatible)
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {string} apiKey - GitHub Personal Access Token entered by the user
 */
async function callAI(systemPrompt, userPrompt, apiKey) {
  const key = apiKey?.trim()
  if (!key) {
    throw new Error('No API key set. Paste your GitHub token into the GitHub API Key field.')
  }

  console.log('[AI] Using key:', key.slice(0, 8) + '…', '| length:', key.length)

  const response = await fetch(GITHUB_AI_ENDPOINT, {
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
      max_tokens: 600,
    }),
  })

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
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

/**
 * Build a compact summary of the research table for AI prompts
 */
function buildTableSummary(columns, summaryRows) {
  const filledRows = summaryRows.filter(row =>
    columns.some(col => row.values[col.id]?.trim())
  )
  if (filledRows.length === 0) return 'No research data entered yet.'

  const header = columns.map(c => c.label).join(' | ')
  const rows = filledRows.map(row =>
    columns.map(col => row.values[col.id] || '—').join(' | ')
  ).join('\n')

  return `${header}\n${rows}`
}

/**
 * Generate interpretation sentence from research data
 */
export async function generateInterpretation(form, columns, summaryRows, apiKey) {
  const tableSummary = buildTableSummary(columns, summaryRows)

  const systemPrompt = `You are a market research analyst writing concise email content for a recruiter at EPAM.
Write in a professional but approachable tone. Be specific and data-driven.
Your output should be a single paragraph (2-4 sentences) — no headers, no bullet points, no preamble.`

  const userPrompt = `Write an interpretation paragraph for a Market Capacity Report email.

Role: ${form.role || 'Not specified'}
Location: ${form.location || 'Not specified'}
Research table data:
${tableSummary}

The interpretation should summarize what the numbers tell us about the market — availability, seniority distribution, and any notable patterns. Be concise and factual.`

  return callAI(systemPrompt, userPrompt, apiKey)
}

/**
 * Generate key insights bullet points from research data
 */
export async function generateKeyInsights(form, columns, summaryRows, apiKey) {
  const tableSummary = buildTableSummary(columns, summaryRows)

  const systemPrompt = `You are a market research analyst writing concise email content for a recruiter at EPAM.
Write in a professional but approachable tone. Be specific and data-driven.
Return exactly 5 bullet points. Each bullet should be a single sentence starting with a data point or observation.
Output ONLY the 5 bullet points, one per line, each starting with "• ". No headers, no preamble, no numbering.`

  const userPrompt = `Generate 5 key insights for a Market Capacity Report email.

Role: ${form.role || 'Not specified'}
Location: ${form.location || 'Not specified'}
Research table data:
${tableSummary}

Insights should cover: seniority distribution, skill availability, talent concentration by city, competition level, and hiring cycle expectations.`

  const raw = await callAI(systemPrompt, userPrompt, apiKey)

  // Parse bullet lines → array of strings
  return raw
    .split('\n')
    .map(line => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 5)
}

/**
 * Generate recommendations paragraph from all form data
 */
export async function generateRecommendations(form, columns, summaryRows, apiKey) {
  const tableSummary = buildTableSummary(columns, summaryRows)

  const systemPrompt = `You are a market research analyst writing concise email content for a recruiter at EPAM.
Write in a professional but approachable tone. Be specific and actionable.
Your output should be 3-5 sentences — no headers, no bullet points, no preamble.`

  const userPrompt = `Write a recommendations paragraph for a Market Capacity Report email.

Role: ${form.role || 'Not specified'}
Location: ${form.location || 'Not specified'}
Years of experience required: ${form.totalYearsExperience || 'Not specified'}
Core skills: ${form.coreSkills || 'Not specified'}
Research table data:
${tableSummary}
Interpretation: ${form.interpretation || 'Not provided'}

Recommendations should advise the hiring manager on sourcing strategy, realistic expectations, and any adjustments to consider (e.g. broadening location, adjusting seniority requirements, pipeline timing).`

  return callAI(systemPrompt, userPrompt, apiKey)
}
