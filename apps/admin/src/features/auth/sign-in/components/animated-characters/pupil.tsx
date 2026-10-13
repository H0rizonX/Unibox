type PupilProps = {
  size?: string
  maxDistance?: number
  pupilColor?: string
}

export function Pupil({
  size = '12px',
  maxDistance = 5,
  pupilColor = 'var(--foreground)',
}: PupilProps) {
  return (
    <div
      className='pupil rounded-full'
      data-max-distance={maxDistance}
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        willChange: 'transform',
      }}
    />
  )
}
