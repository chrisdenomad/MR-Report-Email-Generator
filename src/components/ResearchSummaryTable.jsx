export default function ResearchSummaryTable({ rows, onUpdate, onAdd, onRemove }) {
  return (
    <div>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Level / Category</th>
            <th>Candidates Found</th>
            <th>%</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  value={row.level}
                  placeholder="e.g. Senior"
                  onChange={e => onUpdate(row.id, 'level', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.candidates}
                  placeholder="e.g. 120"
                  onChange={e => onUpdate(row.id, 'candidates', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.percent}
                  placeholder="e.g. 45"
                  onChange={e => onUpdate(row.id, 'percent', e.target.value)}
                />
              </td>
              <td className="action-cell">
                <button
                  className="btn-remove-row"
                  onClick={() => onRemove(row.id)}
                  title="Remove row"
                  disabled={rows.length === 1}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-add-row" onClick={onAdd}>
        + Add Row
      </button>
    </div>
  )
}
