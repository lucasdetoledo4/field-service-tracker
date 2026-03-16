import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

interface Props {
  value: string | undefined
  onChange: (value: string | undefined) => void
  error?: string
}

export function validatePhone(value: string | null | undefined): true | string {
  if (!value) return true
  return isValidPhoneNumber(value) || 'Invalid phone number'
}

export default function PhoneField({ value, onChange, error }: Props) {
  return (
    <div>
      <PhoneInput
        international
        defaultCountry="US"
        value={value}
        onChange={onChange}
        className={`phone-field ${error ? 'phone-field--error' : ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
