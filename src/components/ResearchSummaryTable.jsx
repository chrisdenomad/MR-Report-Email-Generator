export default function ResearchSummaryTable({
  columns,
  rows,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumnLabel,
}) {
  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="summary-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.id}>
                  <div className="th-editable">
                    <input
                      className="th-input"
                      value={col.label}
                      onChange={e => onUpdateColumnLabel(col.id, e.target.value)}
                      title="Click to rename column"
                    />
                    {columns.length > 1 && (
                      <button
                        className="btn-remove-col"
                        onClick={() => onRemoveColumn(col.id)}
                        title="Remove column"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {/* Add column button in header */}
              <th className="th-add-col-cell">
                <button className="btn-add-col" onClick={onAddColumn} title="Add column">
                  + Col
                </button>
              </th>
              {/* Empty header for row-remove action column */}
              <th style={{ width: '36px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.id}>
                    <input
                      type="text"
                      value={row.values[col.id] ?? ''}
                      placeholder="—"
                      onChange={e => onUpdateCell(row.id, col.id, e.target.value)}
                    />
                  </td>
                ))}
                {/* Empty cell under + Col header */}
                <td></td>
                {/* Remove row */}
                <td className="action-cell">
                  <button
                    className="btn-remove-row"
                    onClick={() => onRemoveRow(row.id)}
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
      </div>
      <button className="btn-add-row" onClick={onAddRow}>
        + Add Row
      </button>
    </div>
  )
}
