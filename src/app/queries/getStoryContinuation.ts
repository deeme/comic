import { Preset } from "../engine/presets"
import { GeneratedPanel, LLMVendorConfig } from "@/types"
import { predictNextPanels } from "./predictNextPanels"
import { joinWords } from "@/lib/joinWords"
import { sleep } from "@/lib/sleep"

const DEFAULT_TIMEOUT = 30000 // 30 seconds

export const getStoryContinuation = async ({
  preset,
  stylePrompt = "",
  userStoryPrompt = "",
  nbPanelsToGenerate,
  maxNbPanels,
  existingPanels = [],
  llmVendorConfig,
  timeout = DEFAULT_TIMEOUT
}: {
  preset: Preset
  stylePrompt?: string
  userStoryPrompt?: string
  nbPanelsToGenerate: number
  maxNbPanels: number
  existingPanels?: GeneratedPanel[]
  llmVendorConfig: LLMVendorConfig
  timeout?: number
}): Promise<GeneratedPanel[]> => {
  // 添加超时控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeout)
  })

  try {
    // 基本验证
    if (nbPanelsToGenerate <= 0) throw new Error('Invalid number of panels to generate')
    if (maxNbPanels < nbPanelsToGenerate) throw new Error('Invalid max panels number')

    const startAt: number = (existingPanels?.length + 1) || 0
    const endAt: number = startAt + nbPanelsToGenerate

    const prompt = joinWords([userStoryPrompt])

    // 使用 Promise.race 实现超时控制
    const panelCandidates = await Promise.race([
      predictNextPanels({
        preset,
        prompt,
        nbPanelsToGenerate,
        maxNbPanels,
        existingPanels,
        llmVendorConfig,
      }),
      timeoutPromise
    ]) as GeneratedPanel[]

    return panelCandidates.map((candidate, i) => ({
      panel: startAt + i,
      instructions: candidate?.instructions || "",
      speech: candidate?.speech || "",
      caption: candidate?.caption || "",
    }))

  } catch (error) {
    console.error('Error in getStoryContinuation:', error)
    
    // 降级处理
    const degradedPanels: GeneratedPanel[] = []
    const startAt = (existingPanels?.length + 1) || 0
    const endAt = startAt + nbPanelsToGenerate

    for (let p = startAt; p < endAt; p++) {
      degradedPanels.push({
        panel: p,
        instructions: joinWords([
          stylePrompt,
          userStoryPrompt,
          `${".".repeat(p)}`,
        ]),
        speech: "...",
        caption: `(Error: ${error.message || 'Unknown error'} - Using degraded mode)`
      })
    }

    await sleep(2000)
    return degradedPanels
  }
}