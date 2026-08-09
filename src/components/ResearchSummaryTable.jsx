import { useState } from 'react'

// ── Cell renderer — plain input or select (with optional custom text fallback) ──
function CellInput({ colId, rowId, value, label, rowIndex, colType, onUpdateCell }) {
  // Track whether "Other..." custom input is active for this cell
  const [customActive, setCustomActive] = useState(
    colType?.type === 'select' && colType?.allowCustom
      ? !['', ...colType.options].includes(value)
      : false
  )

  if (!colType || colType.type !== 'select') {
    return (
      <input
        type="text"
        value={value}
        placeholder="—"
        aria-label={`${label || 'Column'} row ${rowIndex + 1}`}
        onChange={e => onUpdateCell(rowId, colId, e.target.value)}
      />
    )
  }

  // Select cell — with optional "Other…" custom text fallback
  const isCustom = colType.allowCustom && customActive
  const selectValue = isCustom ? '__custom__' : (value || '')

  function handleSelectChange(e) {
    if (colType.allowCustom && e.target.value === '__custom__') {
      setCustomActive(true)
      onUpdateCell(rowId, colId, '')
    } else {
      setCustomActive(false)
      onUpdateCell(rowId, colId, e.target.value)
    }
  }

  function handleCustomChange(e) {
    onUpdateCell(rowId, colId, e.target.value)
  }

  function handleCustomBlur() {
    // If the user cleared the custom input, fall back to select
    if (!value.trim()) {
      setCustomActive(false)
    }
  }

  return (
    <div className="cell-select-wrap">
      {!isCustom && (
        <select
          value={selectValue}
          aria-label={`${label || 'Column'} row ${rowIndex + 1}`}
          onChange={handleSelectChange}
          className="cell-select"
        >
          <option value="">—</option>
          {colType.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          {colType.allowCustom && (
            <option value="__custom__">Other…</option>
          )}
        </select>
      )}
      {isCustom && (
        <div className="cell-custom-wrap">
          <input
            type="text"
            value={value}
            placeholder="Type value…"
            aria-label={`${label || 'Column'} row ${rowIndex + 1} (custom)`}
            className="cell-custom-input"
            autoFocus
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
          />
          <button
            type="button"
            className="btn-custom-back"
            title="Back to dropdown"
            onClick={() => { setCustomActive(false); onUpdateCell(rowId, colId, '') }}
          >↩</button>
        </div>
      )}
    </div>
  )
}

export default function ResearchSummaryTable({
  columns,
  rows,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumnLabel,
  columnTypes = {},
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
                    <CellInput
                      colId={col.id}
                      rowId={row.id}
                      value={row.values[col.id] ?? ''}
                      label={col.label}
                      rowIndex={rowIndex}
                      colType={columnTypes[col.id]}
                      onUpdateCell={onUpdateCell}
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
