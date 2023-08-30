import styles from '@/styles/Dashboard.module.css'
import utils from '@/styles/utils.module.css'

export function InputText({
  label,
  name,
  required = false,
  defaultValue = undefined,
  attrs = {},
}) {
  return (
    <div>
      <label htmlFor={name}>
        <span className={required ? utils.inputRequired : ''}>{label}</span>
        <input
          type="text"
          name={name}
          id={name}
          className={styles.input}
          defaultValue={defaultValue}
          required={required}
          style={{ maxWidth: '350px' }}
          {...attrs}
        />
      </label>
    </div>
  )
}

export function InputNumber({
  label,
  name,
  min = 0,
  max = 999999999,
  required = false,
  defaultValue = undefined,
}) {
  return (
    <div>
      <label htmlFor={name}>
        <span className={required ? utils.inputRequired : ''}>{label}</span>
        <input
          type="number"
          min={min}
          max={max}
          name={name}
          id={name}
          className={styles.input}
          defaultValue={defaultValue}
          required={required}
          style={{ maxWidth: '65px' }}
        />
      </label>
    </div>
  )
}

export function Textarea({
  label,
  name,
  required = false,
  defaultValue = undefined,
}) {
  return (
    <div>
      <label>
        <span className={required ? utils.inputRequired : ''}>{label}</span>
        <textarea
          type="text"
          name={name}
          id={name}
          className={styles.textareaInput}
          defaultValue={defaultValue}
          required={required}
        ></textarea>
      </label>
    </div>
  )
}

export function InputImage({ label, name, defaultValue = undefined }) {
  return (
    <div>
      <label>
        <span style={{ display: 'block', marginBlock: '.5rem' }}>{label}</span>
        <input
          type="file"
          name={name}
          id={name}
          className={styles.input}
          defaultValue={defaultValue}
        />
      </label>
    </div>
  )
}

export function InputColor({
  label,
  name,
  required = false,
  defaultValue = undefined,
}) {
  return (
    <div>
      <label>
        <span style={{ display: 'block', marginBlock: '.5rem' }}>{label}</span>
        <input
          type="color"
          name={name}
          id={name}
          className={styles.colorInput}
          defaultValue={defaultValue}
          required={required}
        />
      </label>
    </div>
  )
}

export function InputEmail({
  label,
  name,
  required = false,
  defaultValue = undefined,
  attrs = {},
}) {
  return (
    <div>
      <label>
        <span className={required ? utils.inputRequired : ''}>{label}</span>
        <input
          type="email"
          name={name}
          id={name}
          className={styles.input}
          defaultValue={defaultValue}
          required={required}
          {...attrs}
        />
      </label>
    </div>
  )
}

export function InputTelephone({
  label,
  name,
  required = false,
  defaultValue = undefined,
  attrs = {},
}) {
  return (
    <div>
      <label>
        <span className={required ? utils.inputRequired : ''}>{label}</span>
        <input
          type="telephone"
          name={name}
          id={name}
          className={styles.input}
          defaultValue={defaultValue}
          required={required}
          {...attrs}
        />
      </label>
    </div>
  )
}

export function InputDate({
  label,
  name,
  required = false,
  defaultValue = undefined,
  attrs = {},
}) {
  return (
    <div>
      <label>
        <span className={required ? utils.inputRequired : ''}>{label}</span>
        <input
          type="date"
          name={name}
          id={name}
          className={styles.input}
          defaultValue={defaultValue}
          required={required}
          {...attrs}
        />
      </label>
    </div>
  )
}

export function Select({
  label,
  name,
  options = [],
  defaultValue = undefined,
  attrs = {},
  required = false,
}) {
  return (
    <div>
      <label htmlFor={name} className={required ? utils.inputRequired : ''}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={styles.input}
        style={{ maxWidth: '350px' }}
        required={required}
        defaultValue={defaultValue}
        {...attrs}
      >
        <option value=""> </option>
        {options.map((option) => (
          <option value={option.codigo} key={option.codigo}>
            {option.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
