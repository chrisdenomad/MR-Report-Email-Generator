import ResearchSummaryTable from './ResearchSummaryTable'

export default function InputForm({
  form,
  columns,
  summaryRows,
  insights,
  updateField,
  updateSummaryCell,
  addSummaryRow,
  removeSummaryRow,
  addColumn,
  removeColumn,
  updateColumnLabel,
  addInsight,
  removeInsight,
  updateInsight,
  resetForm,
}) {
  return (
    <div>
      {/* ── Header ── */}
      <div className="form-section">
        <div className="form-section-title">Header</div>
        <div className="form-row">
          <div className="form-group">
            <label>Role (A)</label>
            <input
              type="text"
              value={form.role}
              placeholder="e.g. Java Developer"
              onChange={e => updateField('role', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Location (B)</label>
            <input
              type="text"
              value={form.location}
              placeholder="e.g. Poland"
              onChange={e => updateField('location', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Research Summary ── */}
      <div className="form-section">
        <div className="form-section-title">Research Summary</div>
        <ResearchSummaryTable
          columns={columns}
          rows={summaryRows}
          onUpdateCell={updateSummaryCell}
          onAddRow={addSummaryRow}
          onRemoveRow={removeSummaryRow}
          onAddColumn={addColumn}
          onRemoveColumn={removeColumn}
          onUpdateColumnLabel={updateColumnLabel}
        />
      </div>

      {/* ── Interpretation ── */}
      <div className="form-section">
        <div className="form-section-title">Interpretation</div>
        <div className="form-group">
          <label>Interpretation sentence</label>
          <textarea
            rows={3}
            value={form.interpretation}
            placeholder='e.g. "The market shows strong Senior-level depth, with moderate scarcity at Architect level."'
            onChange={e => updateField('interpretation', e.target.value)}
          />
        </div>
      </div>

      {/* ── Key Insights ── */}
      <div className="form-section">
        <div className="form-section-title">Key Insights</div>
        <div className="insights-list">
          {insights.map((item, index) => (
            <div key={item.id} className="insight-row">
              <span className="insight-bullet">•</span>
              <input
                type="text"
                className="insight-input"
                value={item.text}
                placeholder={`Insight ${index + 1}`}
                onChange={e => updateInsight(item.id, e.target.value)}
              />
              <button
                className="btn-remove-row"
                onClick={() => removeInsight(item.id)}
                title="Remove insight"
                disabled={insights.length === 1}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button className="btn-add-row" style={{ marginTop: '8px' }} onClick={addInsight}>
          + Add Insight
        </button>
      </div>

      {/* ── Search Methodology ── */}
      <div className="form-section">
        <div className="form-section-title">Search Methodology</div>
        <div className="form-row">
          <div className="form-group">
            <label>Total Years of Experience</label>
            <input
              type="text"
              value={form.totalYearsExperience}
              placeholder="e.g. 5+ years"
              onChange={e => updateField('totalYearsExperience', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Core Skills / Keywords</label>
          <input
            type="text"
            value={form.coreSkills}
            placeholder="e.g. Java, Spring Boot, Microservices"
            onChange={e => updateField('coreSkills', e.target.value)}
          />
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="form-section">
        <div className="form-section-title">Recommendations</div>
        <div className="form-group">
          <label>Recommendations</label>
          <textarea
            rows={5}
            value={form.recommendations}
            placeholder="Enter your recommendations for the hiring manager..."
            onChange={e => updateField('recommendations', e.target.value)}
          />
        </div>
      </div>

      {/* ── Reset ── */}
      <div style={{ paddingBottom: '8px' }}>
        <button
          onClick={resetForm}
          style={{
            background: 'transparent',
            border: '1px solid #555',
            color: '#aaa',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = '#e05252'
            e.target.style.color = '#e05252'
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = '#555'
            e.target.style.color = '#aaa'
          }}
        >
          Reset Form
        </button>
      </div>
    </div>
  )
}
