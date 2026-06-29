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
    effectiveMethodologyRole,
    effectiveMethodologyLocation,
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
    overrideMethodologyRole,
    resetMethodologyRole,
    overrideMethodologyLocation,
    resetMethodologyLocation,
    resetForm,
  } = useFormState()

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="logo-bar" />
        <h1>
          MR Report <span>Email Generator</span>
        </h1>
      </header>

      <div className="app-body">
        {/* InputForm owns its .form-panel wrapper */}
        <InputForm
          form={form}
          columns={columns}
          summaryRows={summaryRows}
          insights={insights}
          effectiveMethodologyRole={effectiveMethodologyRole}
          effectiveMethodologyLocation={effectiveMethodologyLocation}
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
          overrideMethodologyRole={overrideMethodologyRole}
          resetMethodologyRole={resetMethodologyRole}
          overrideMethodologyLocation={overrideMethodologyLocation}
          resetMethodologyLocation={resetMethodologyLocation}
          resetForm={resetForm}
        />

        {/* EmailPreview owns its .preview-panel wrapper */}
        <EmailPreview
          form={form}
          columns={columns}
          summaryRows={summaryRows}
          insights={insights}
          subject={subject}
          effectiveMethodologyRole={effectiveMethodologyRole}
          effectiveMethodologyLocation={effectiveMethodologyLocation}
        />
      </div>
    </div>
  )
}
