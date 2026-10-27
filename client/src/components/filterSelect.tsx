type FilterSelectProps = {
    label: string,
    value: string,
    options: Record<string, string>,
    onChange: (value: string) => void,
    emptyText?: string,
}
const FilterSelect = ({ label, value, options, onChange, emptyText = "הכול" }: FilterSelectProps) => {
    return <label>
        {label}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">{emptyText}</option>
            {Object.entries(options).map(([key, text]) => (
                <option key={key} value={key}>{text}</option>
            ))}
        </select>
    </label>
}
export default FilterSelect