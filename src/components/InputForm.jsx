import ResearchSummaryTable from './ResearchSummaryTable'

export default function InputForm({
  form,
  summaryRows,
  updateField,
  updateSummaryRow,
  addSummaryRow,
  removeSummaryRow,
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
          rows={summaryRows}
          onUpdate={updateSummaryRow}
          onAdd={addSummaryRow}
          onRemove={removeSummaryRow}
        />
      </div>

      {/* ── Interpretation ── */}
      <div className="form-section">
        <div className="form-section-title">Interpretation</div>
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label>Interpretation sentence</label>
          <textarea
            rows={3}
            value={form.interpretation}
            placeholder='e.g. "The market shows strong Senior-level depth, with moderate scarcity at Architect level."'
            onChange={e => updateField('interpretation', e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label>What does this mean?</label>
          <textarea
            rows={2}
            value={form.whatDoesThisMean}
            placeholder="Explain what the data means for the hiring team"
            onChange={e => updateField('whatDoesThisMean', e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Is this risky?</label>
            <textarea
              rows={2}
              value={form.isThisRisky}
              placeholder="Describe any hiring risks"
              onChange={e => updateField('isThisRisky', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Can we scale?</label>
            <textarea
              rows={2}
              value={form.canWeScale}
              placeholder="Describe scalability of hiring"
              onChange={e => updateField('canWeScale', e.target.value)}
            />
          </div>
        </div>
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

      {/* ── Key Insights ── */}
      <div className="form-section">
        <div className="form-section-title">Key Insights</div>
        <div className="form-row">
          <div className="form-group">
            <label>Senior+ % of profiles</label>
            <input
              type="number"
              value={form.seniorPlusPercent}
              placeholder="e.g. 62"
              min="0"
              max="100"
              onChange={e => updateField('seniorPlusPercent', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Skills Availability</label>
            <select
              value={form.skillsAvailability}
              onChange={e => updateField('skillsAvailability', e.target.value)}
            >
              <option value="widely available">Widely Available</option>
              <option value="moderately available">Moderately Available</option>
              <option value="scarce">Scarce</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Domain-experienced talent %</label>
            <input
              type="number"
              value={form.domainExperiencedPercent}
              placeholder="e.g. 28"
              min="0"
              max="100"
              onChange={e => updateField('domainExperiencedPercent', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Talent Concentration City/Cities</label>
            <input
              type="text"
              value={form.talentConcentrationCity}
              placeholder="e.g. Warsaw, Krakow"
              onChange={e => updateField('talentConcentrationCity', e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Architect-level note</label>
          <input
            type="text"
            value={form.architectNote}
            onChange={e => updateField('architectNote', e.target.value)}
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
