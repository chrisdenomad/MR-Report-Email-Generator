import { useFormState } from './hooks/useFormState'
import InputForm from './components/InputForm'
import EmailPreview from './components/EmailPreview'
import './index.css'

export default function App() {
  const {
    form,
    summaryRows,
    subject,
    updateField,
    updateSummaryRow,
    addSummaryRow,
    removeSummaryRow,
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
            summaryRows={summaryRows}
            updateField={updateField}
            updateSummaryRow={updateSummaryRow}
            addSummaryRow={addSummaryRow}
            removeSummaryRow={removeSummaryRow}
            resetForm={resetForm}
          />
        </div>

        {/* Right — Email Preview */}
        <div className="preview-panel">
          <EmailPreview
            form={form}
            summaryRows={summaryRows}
            subject={subject}
          />
        </div>
      </div>
    </div>
  )
}
