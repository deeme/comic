import { GeneratedPanel, LLMVendorConfig } from "@/types"
import { cleanJson } from "@/lib/cleanJson"
import { dirtyGeneratedPanelCleaner } from "@/lib/dirtyGeneratedPanelCleaner"
import { dirtyGeneratedPanelsParser } from "@/lib/dirtyGeneratedPanelsParser"
import { sleep } from "@/lib/sleep"

import { Preset } from "../engine/presets"
import { predict } from "./predict"
import { getSystemPrompt } from "./getSystemPrompt"
import { getUserPrompt } from "./getUserPrompt"

export const predictNextPanels = async ({
  preset,
  prompt = "",
  nbPanelsToGenerate,
  maxNbPanels,
  existingPanels = [],
  llmVendorConfig,
}: {
  preset: Preset
  prompt: string
  nbPanelsToGenerate: number
  maxNbPanels: number
  existingPanels: GeneratedPanel[]
  llmVendorConfig: LLMVendorConfig
}): Promise<GeneratedPanel[]> => {
  // console.log("predictNextPanels: ", { prompt, nbPanelsToGenerate })
  // throw new Error("Planned maintenance")
  
  // In case you need to quickly debug the RENDERING engine you can uncomment this:
  // return mockGeneratedPanels

  const existingPanelsTemplate = existingPanels.length
    ? ` To help you, here are the previous panels, their speeches and captions (note: if you see an anomaly here eg. no speech, no caption or the same description repeated multiple times, do not hesitate to fix the story): ${JSON.stringify(existingPanels, null, 2)}`
    : ''

  const firstNextOrLast =
    existingPanels.length === 0
      ? "first"
      : (maxNbPanels - existingPanels.length) === maxNbPanels
      ? "last"
      : "next"

  const systemPrompt = getSystemPrompt({
    preset,
    firstNextOrLast,
    maxNbPanels,
    nbPanelsToGenerate,
  })

  const userPrompt = getUserPrompt({
    prompt,
    existingPanelsTemplate,
  })

  const nbTokensPerPanel = 200
  const nbMaxNewTokens = nbPanelsToGenerate * nbTokensPerPanel

  // 添加重试函数
  const attemptPredict = async (retryCount: number): Promise<GeneratedPanel[]> => {
    try {
      const result = `${await predict({
        systemPrompt: systemPrompt + (retryCount > 0 ? ` \n [Retry attempt ${retryCount}]` : ""),
        userPrompt,
        nbMaxNewTokens,
        llmVendorConfig
      })}`.trim()

      console.log(`LLM result (attempt ${retryCount + 1}):`, result)
      
      if (!result.length) {
        throw new Error(`Empty result on attempt ${retryCount + 1}!`)
      }

      const tmp = cleanJson(result)
      let generatedPanels: GeneratedPanel[] = []

      try {
        generatedPanels = dirtyGeneratedPanelsParser(tmp)
      } catch (err) {
        generatedPanels = (
          tmp.split("*")
          .map(item => item.trim())
          .map((cap, i) => ({
            panel: i,
            caption: cap,
            speech: cap,
            instructions: cap,
          }))
        )
      }

      // 验证所有面板的caption是否都不为空
      const hasEmptyCaption = generatedPanels.some(panel => 
        !panel.caption || panel.caption.trim() === ''
      )

      if (hasEmptyCaption) {
        console.log(`Found empty caption on attempt ${retryCount + 1}, retrying...`)
        // 指数退避策略，每次重试增加等待时间
        await sleep(Math.min(2000 * Math.pow(1.5, retryCount), 30000)) // 最大等待30秒
        return attemptPredict(retryCount + 1)
      }

      return generatedPanels.map(res => dirtyGeneratedPanelCleaner(res))
    } catch (err) {
      console.error(`Prediction failed on attempt ${retryCount + 1}:`, err)
      // 指数退避策略
      await sleep(Math.min(2000 * Math.pow(1.5, retryCount), 30000))
      return attemptPredict(retryCount + 1)
    }
    return attemptPredict(0) // 开始第一次尝试
  }
}