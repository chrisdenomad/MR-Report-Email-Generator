import { useFormState } from './hooks/useFormState'
import InputForm from './components/InputForm'
import EmailPreview from './components/EmailPreview'
import './index.css'

export default function App() {
  const {
    form,
    columns,
    summaryRows,
    insights,
    subject,
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
  } = useFormState()

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="logo-bar" />
        <h1>
          MR Report <span>Email Generator</span>
        </h1>
      </header>

      {/* Two-panel body */}
      <div className="app-body">
        {/* Left — Input Form */}
        <div className="form-panel">
          <InputForm
            form={form}
            columns={columns}
            summaryRows={summaryRows}
            insights={insights}
            updateField={updateField}
            updateSummaryCell={updateSummaryCell}
            addSummaryRow={addSummaryRow}
            removeSummaryRow={removeSummaryRow}
            addColumn={addColumn}
            removeColumn={removeColumn}
            updateColumnLabel={updateColumnLabel}
            addInsight={addInsight}
            removeInsight={removeInsight}
            updateInsight={updateInsight}
            resetForm={resetForm}
          />
        </div>

        {/* Right — Email Preview */}
        <div className="preview-panel">
          <EmailPreview
            form={form}
            columns={columns}
            summaryRows={summaryRows}
            insights={insights}
            subject={subject}
          />
        </div>
      </div>
    </div>
  )
}
