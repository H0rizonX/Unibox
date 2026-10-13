type EyeBallProps = {
  size?: string
  pupilSize?: string
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
}

export function EyeBall({
  size = '48px',
  pupilSize = '16px',
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'var(--foreground)',
}: EyeBallProps) {
  return (
    <div
      className="eyeball flex items-center justify-center overflow-hidden rounded-full"
      data-max-distance={maxDistance}
      style={{
        width: size,
        height: size,
        backgroundColor: eyeColor,
        willChange: 'height',
      }}
    >
      <div
        className="eyeball-pupil rounded-full"
        style={{
          width: pupilSize,
          height: pupilSize,
          backgroundColor: pupilColor,
          willChange: 'transform',
        }}
      />
    </div>
  )
}
