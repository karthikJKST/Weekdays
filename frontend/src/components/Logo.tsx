import logoSrc from '../assets/logo.png'

export function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="WeekDays"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export function Logomark({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="WeekDays"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}
