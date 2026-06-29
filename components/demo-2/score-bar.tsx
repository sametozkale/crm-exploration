import { scoreBarColors } from "./demo-2-data"

export function ScoreBar({ score }: { score: number }) {
  const colors = scoreBarColors(score)

  return (
    <div className="flex items-center gap-[8px]">
      <div className="flex items-center gap-[2px]">
        {colors.map((color, i) => (
          <span
            key={i}
            className="h-[5px] w-4 shrink-0 rounded-[9px]"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-[13px] leading-none text-[#646464] tabular-nums">{score}</span>
    </div>
  )
}
