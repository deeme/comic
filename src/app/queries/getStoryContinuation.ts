import { Preset } from "../engine/presets"
import { GeneratedPanel, LLMVendorConfig } from "@/types"
import { predictNextPanels } from "./predictNextPanels"
import { joinWords } from "@/lib/joinWords"
import { sleep } from "@/lib/sleep"

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // ms

export const getStoryContinuation = async ({
  preset,
  stylePrompt = "",
  userStoryPrompt = "",
  nbPanelsToGenerate,
  maxNbPanels,
  existingPanels = [],
  llmVendorConfig
}: {
  preset: Preset;
  stylePrompt?: string;
  userStoryPrompt?: string;
  nbPanelsToGenerate: number;
  maxNbPanels: number;
  existingPanels?: GeneratedPanel[];
  llmVendorConfig: LLMVendorConfig
}): Promise<GeneratedPanel[]> => {
  // 参数验证
  if (nbPanelsToGenerate <= 0 || maxNbPanels <= 0) {
    throw new Error("Invalid panel numbers");
  }

  let panels: GeneratedPanel[] = [];
  const startAt: number = (existingPanels.length + 1) || 0;
  const endAt: number = startAt + nbPanelsToGenerate;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      const prompt = joinWords([userStoryPrompt]);
      
      const panelCandidates: GeneratedPanel[] = await predictNextPanels({
        preset,
        prompt,
        nbPanelsToGenerate,
        maxNbPanels,
        existingPanels,
        llmVendorConfig,
      });

      if (!panelCandidates || panelCandidates.length === 0) {
        throw new Error("Empty panel candidates");
      }

      // 清理和验证输出
      panels = panelCandidates.map((candidate, i) => ({
        panel: startAt + i,
        instructions: candidate?.instructions || "",
        speech: candidate?.speech || "",
        caption: candidate?.caption || "",
      }));

      // 如果成功生成了面板，跳出重试循环
      break;

    } catch (err) {
      console.error(`Attempt ${retryCount + 1} failed:`, err);
      retryCount++;
      
      if (retryCount === MAX_RETRIES) {
        console.error("All retry attempts failed, switching to degraded mode");
        // 降级模式
        panels = generateDegradedPanels(startAt, endAt, stylePrompt, userStoryPrompt);
      } else {
        await sleep(RETRY_DELAY * retryCount); // 指数退避
      }
    }
  }

  return panels;
}

// 降级模式面板生成
function generateDegradedPanels(
  startAt: number,
  endAt: number,
  stylePrompt: string,
  userStoryPrompt: string
): GeneratedPanel[] {
  const panels: GeneratedPanel[] = [];
  for (let p = startAt; p < endAt && p; p++) {
    panels.push({
      panel: p,
      instructions: joinWords([
        stylePrompt,
        userStoryPrompt,
        `${".".repeat(p)}`,
      ]),
      speech: "...",
      caption: "(Sorry, LLM generation failed: using degraded mode)"
    });
  }
  return panels;
}