import { Preset } from "../engine/presets"
import { GeneratedPanel, LLMVendorConfig } from "@/types"
import { predictNextPanels } from "./predictNextPanels"
import { joinWords } from "@/lib/joinWords"
import { sleep } from "@/lib/sleep"

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

  const MAX_RETRIES = 3; // 最大重试次数
  let retryCount = 0;
  
  const tryGeneratePanels = async (): Promise<GeneratedPanel[]> => {
    let panels: GeneratedPanel[] = [];
    const startAt: number = (existingPanels.length + 1) || 0;
    const endAt: number = startAt + nbPanelsToGenerate;

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

      // 检查是否有空caption
      const hasEmptyCaption = panelCandidates.some(
        panel => !panel?.caption || panel.caption.trim() === ""
      );

      if (hasEmptyCaption && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`检测到空caption，第${retryCount}次重试...`);
        await sleep(2000); // 重试前等待2秒
        return tryGeneratePanels();
      }

      // 处理panel数据
      for (let i = 0; i < nbPanelsToGenerate; i++) {
        panels.push({
          panel: startAt + i,
          instructions: `${panelCandidates[i]?.instructions || ""}`,
          speech: `${panelCandidates[i]?.speech || ""}`,
          caption: `${panelCandidates[i]?.caption || ""}`,
        });
      }

      return panels;
      
    } catch (err) {
      // 降级处理
      console.error("生成失败，使用降级模式:", err);
      panels = [];
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
      await sleep(2000);
      return panels;
    }
  };

  // 开始生成过程
  return await tryGeneratePanels();
}