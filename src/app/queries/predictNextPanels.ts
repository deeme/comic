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

  // we don't require a lot of token for our task,
  // but to be safe, let's count ~200 tokens per panel
  const nbTokensPerPanel = 200

  const nbMaxNewTokens = nbPanelsToGenerate * nbTokensPerPanel

  let maxRetries = 5;
  let result = "";

  while (maxRetries > 0) {
    try {
      result = `${await predict({
        systemPrompt,
        userPrompt,
        nbMaxNewTokens,
        llmVendorConfig
      })}`.trim();
      console.log("LLM result (trial #", 4 - maxRetries, "):", result);
      if (result.length) {
        break;
      }
    } catch (err) {
      console.error(`prediction of the story failed, retrying... (${4 - maxRetries} trials left)`);
      await sleep(2000);
    }
    maxRetries--;
  }

  if (!result.length) {
    throw new Error("failed to generate the story after multiple trials 💩");
  }

  // console.log("Raw response from LLM:", result)
  const tmp = cleanJson(result)
  
  let generatedPanels: GeneratedPanel[] = []

  try {
    generatedPanels = dirtyGeneratedPanelsParser(tmp)
  } catch (err) {
    // console.log(`failed to read LLM response: ${err}`)
    // console.log(`original response was:`, result)

      // in case of failure here, it might be because the LLM hallucinated a completely different response,
      // such as markdown. There is no real solution.. but we can try a fallback:

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

  return generatedPanels.map(res => dirtyGeneratedPanelCleaner(res))
}