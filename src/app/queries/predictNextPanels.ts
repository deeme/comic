import { GeneratedPanel, LLMVendorConfig } from "@/types"
import { cleanJson } from "@/lib/cleanJson"
import { dirtyGeneratedPanelCleaner } from "@/lib/dirtyGeneratedPanelCleaner"
import { dirtyGeneratedPanelsParser } from "@/lib/dirtyGeneratedPanelsParser"
import { sleep } from "@/lib/sleep"

import { Preset } from "../engine/presets"
import { predict } from "./predict"
import { getSystemPrompt } from "./getSystemPrompt"
import { getUserPrompt } from "./getUserPrompt"

// 定义重试配置
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 2000,
  MAX_DELAY: 10000
}

// 指数退避重试函数
const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  retries = RETRY_CONFIG.MAX_RETRIES,
  delay = RETRY_CONFIG.INITIAL_DELAY
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await sleep(delay)
    return retryWithExponentialBackoff(fn, retries - 1, Math.min(delay * 2, RETRY_CONFIG.MAX_DELAY))
  }
}

// 验证输入参数
const validateInput = ({
  preset,
  nbPanelsToGenerate,
  maxNbPanels,
  existingPanels,
}: {
  preset: Preset
  nbPanelsToGenerate: number
  maxNbPanels: number
  existingPanels: GeneratedPanel[]
}) => {
  if (!preset) throw new Error('Preset is required')
  if (nbPanelsToGenerate <= 0) throw new Error('Number of panels must be positive')
  if (maxNbPanels < nbPanelsToGenerate) throw new Error('Max panels cannot be less than panels to generate')
  if (existingPanels.length + nbPanelsToGenerate > maxNbPanels) {
    throw new Error('Total number of panels would exceed maximum')
  }
}

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
  try {
    // 验证输入
    validateInput({ preset, nbPanelsToGenerate, maxNbPanels, existingPanels })

    const existingPanelsTemplate = existingPanels.length
      ? ` To help you, here are the previous panels: ${JSON.stringify(existingPanels, null, 2)}`
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

    // 使用重试机制调用 predict
    const result = await retryWithExponentialBackoff(async () => {
      const response = await predict({
        systemPrompt,
        userPrompt,
        nbMaxNewTokens,
        llmVendorConfig
      })
      
      if (!response || typeof response !== 'string' || !response.trim()) {
        throw new Error('Empty or invalid response from LLM')
      }
      
      return response.trim()
    })

    const cleanedJson = cleanJson(result)
    let generatedPanels: GeneratedPanel[] = []

    try {
      generatedPanels = dirtyGeneratedPanelsParser(cleanedJson)
    } catch (err) {
      // 降级处理
      generatedPanels = cleanedJson.split("*")
        .map((item, i) => ({
          panel: i,
          caption: item.trim(),
          speech: item.trim(),
          instructions: item.trim(),
        }))
    }

    // 验证生成的面板数量
    if (generatedPanels.length !== nbPanelsToGenerate) {
      throw new Error(`Generated panels count mismatch: expected ${nbPanelsToGenerate}, got ${generatedPanels.length}`)
    }

    return generatedPanels.map(res => dirtyGeneratedPanelCleaner(res))
  } catch (error) {
    console.error('Error in predictNextPanels:', error)
    throw error
  }
}