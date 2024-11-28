import { GeneratedPanel, LLMVendorConfig } from "@/types"
import { cleanJson } from "@/lib/cleanJson"
import { dirtyGeneratedPanelCleaner } from "@/lib/dirtyGeneratedPanelCleaner"
import { dirtyGeneratedPanelsParser } from "@/lib/dirtyGeneratedPanelsParser"
import { sleep } from "@/lib/sleep"

const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // ms

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

  const existingPanelsTemplate = existingPanels.length
    ? ` To help you, here are the previous panels, their speeches and captions: ${JSON.stringify(existingPanels, null, 2)}`
    : '';

  const firstNextOrLast =
    existingPanels.length === 0
      ? "first"
      : (maxNbPanels - existingPanels.length) === maxNbPanels
      ? "last"
      : "next";

  const systemPrompt = getSystemPrompt({
    preset,
    firstNextOrLast,
    maxNbPanels,
    nbPanelsToGenerate,
  });

  const userPrompt = getUserPrompt({
    prompt,
    existingPanelsTemplate,
  });

  const nbTokensPerPanel = 200;
  const nbMaxNewTokens = nbPanelsToGenerate * nbTokensPerPanel;
  
  let result = "";
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      result = await predict({
        systemPrompt: retryCount === 0 ? systemPrompt : systemPrompt + " \n ",
        userPrompt,
        nbMaxNewTokens,
        llmVendorConfig
      });

      result = result.trim();
      
      if (!result) {
        throw new Error(`Empty result on attempt ${retryCount + 1}`);
      }

      console.log(`LLM result (attempt ${retryCount + 1}):`, result);
      break;

    } catch (err) {
      retryCount++;
      console.error(`Prediction failed on attempt ${retryCount}:`, err);
      
      if (retryCount === MAX_RETRIES) {
        throw new Error(`Failed to generate story after ${MAX_RETRIES} attempts: ${err}`);
      }
      
      await sleep(BASE_DELAY * Math.pow(2, retryCount - 1)); // 指数退避
    }
  }

  const tmp = cleanJson(result);
  let generatedPanels: GeneratedPanel[] = [];

  try {
    generatedPanels = dirtyGeneratedPanelsParser(tmp);
    
    if (!generatedPanels.length) {
      throw new Error("No panels generated after parsing");
    }
    
  } catch (err) {
    console.error("Failed to parse LLM response:", err);
    console.error("Original response:", result);

    // 降级解析方案
    generatedPanels = tmp.split("*")
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map((cap, i) => ({
        panel: i,
        caption: cap,
        speech: cap,
        instructions: cap,
      }));
  }

  return generatedPanels.map(res => dirtyGeneratedPanelCleaner(res));
}
