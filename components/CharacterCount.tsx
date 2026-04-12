interface CharacterCountProps {
  current: number
  max: number
}

export default function CharacterCount({ current, max }: CharacterCountProps) {
  return (
    <span className="text-xs text-gray-400">
      {current} / {max}
    </span>
  )
}
