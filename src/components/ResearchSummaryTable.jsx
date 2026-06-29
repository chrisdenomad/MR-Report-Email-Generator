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
      {/* Fix #28: shared CSS class for overflow wrapper */}
      <div className="table-scroll-wrapper">
        <table className="summary-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.id}>
                  <div className="th-editable">
                    {/* Fix #19: aria-label on column header input */}
                    <input
                      className="th-input"
                      value={col.label}
                      onChange={e => onUpdateColumnLabel(col.id, e.target.value)}
                      aria-label={`Column header: ${col.label || 'unnamed'}`}
                      title="Click to rename column"
                    />
                    {columns.length > 1 && (
                      /* Fix #18: aria-label on remove column button */
                      <button
                        className="btn-remove-col"
                        onClick={() => onRemoveColumn(col.id)}
                        aria-label={`Remove column ${col.label}`}
                        title="Remove column"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="th-add-col-cell">
                <button className="btn-add-col" onClick={onAddColumn} title="Add column">
                  + Col
                </button>
              </th>
              <th style={{ width: '36px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.id}>
                    {/* Fix #20: aria-label on cell inputs */}
                    <input
                      type="text"
                      value={row.values[col.id] ?? ''}
                      placeholder="—"
                      aria-label={`${col.label || 'Column'} row ${rowIndex + 1}`}
                      onChange={e => onUpdateCell(row.id, col.id, e.target.value)}
                    />
                  </td>
                ))}
                <td></td>
                {/* Fix #18: aria-label on remove row button */}
                <td className="action-cell">
                  <button
                    className="btn-remove-row"
                    onClick={() => onRemoveRow(row.id)}
                    aria-label={`Remove row ${rowIndex + 1}`}
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
