/** Approx. max chars per line inside a 568px user bubble (14px Inter, px-3). */
export const CHAT_BUBBLE_MAX_CHARS_PER_LINE = 74

const DEFAULT_MAX_LINES = 5

function splitBalanced(words: string[], lineCount: number): string[] {
  if (lineCount <= 1) return [words.join(" ")]
  if (words.length === 0) return [""]

  const lines: string[] = []
  let wordIndex = 0

  for (let line = 0; line < lineCount; line++) {
    const linesRemaining = lineCount - line
    const wordsRemaining = words.length - wordIndex

    if (linesRemaining === 1) {
      lines.push(words.slice(wordIndex).join(" "))
      break
    }

    const maxWordsThisLine = wordsRemaining - (linesRemaining - 1)
    const idealChars = words.slice(wordIndex).join(" ").length / linesRemaining

    let bestTake = 1
    let bestScore = Number.POSITIVE_INFINITY

    for (let take = 1; take <= maxWordsThisLine; take++) {
      const lineText = words.slice(wordIndex, wordIndex + take).join(" ")
      const score = Math.abs(lineText.length - idealChars)
      if (score < bestScore) {
        bestScore = score
        bestTake = take
      }
    }

    lines.push(words.slice(wordIndex, wordIndex + bestTake).join(" "))
    wordIndex += bestTake
  }

  return lines
}

/** Split long chat copy into balanced lines (up to 5) at word boundaries. */
export function balanceChatBubbleLines(
  text: string,
  maxLines = DEFAULT_MAX_LINES,
): readonly string[] {
  const trimmed = text.trim()
  if (!trimmed) return [""]

  const words = trimmed.split(/\s+/)
  if (words.length < 4 || trimmed.length < 36) return [trimmed]

  for (let count = 2; count <= maxLines; count++) {
    const lines = splitBalanced(words, count)
    if (lines.every((line) => line.length <= CHAT_BUBBLE_MAX_CHARS_PER_LINE)) {
      return lines
    }
  }

  return splitBalanced(words, maxLines)
}

/** True when even max balanced lines would overflow — use natural word wrap instead. */
export function chatBubbleNeedsNaturalWrap(
  text: string,
  maxLines = DEFAULT_MAX_LINES,
): boolean {
  return balanceChatBubbleLines(text, maxLines).some(
    (line) => line.length > CHAT_BUBBLE_MAX_CHARS_PER_LINE,
  )
}
