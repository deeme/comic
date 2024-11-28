"use server"

import type { ChatCompletionMessageParam } from "openai/resources/chat"
import OpenAI from "openai"
import { LLMPredictionFunctionParams } from "@/types"

// 定义备选模型数组
const FALLBACK_MODELS = [
  process.env.LLM_OPENAI_API_MODEL || "claude-3-5-sonnet-20240620",
  process.env.LLM_OPENAI_API_MODEL1 || "gemini-exp-1121",
  process.env.LLM_OPENAI_API_MODEL2 || "o1-preview",
  process.env.LLM_OPENAI_API_MODEL3 || "o1-mini",
  process.env.LLM_OPENAI_API_MODEL4 || "gpt-4o",
  process.env.LLM_OPENAI_API_MODEL5 || "gpt-4o-mini",
  process.env.LLM_OPENAI_API_MODEL6 || "claude-3-haiku-20240307",
  process.env.LLM_OPENAI_API_MODEL7 || "lmsys/claude-3-5-sonnet-20241022",
  process.env.LLM_OPENAI_API_MODEL8 || "lmsys/claude-3-5-haiku-20241022",
  process.env.LLM_OPENAI_API_MODEL9 || "lmsys/claude-3-5-sonnet-20240620"
]

// 创建单次调用函数
async function makeOpenAICall(
  openai: OpenAI,
  messages: ChatCompletionMessageParam[],
  model: string,
  nbMaxNewTokens: number
): Promise<string> {
  try {
    const res = await openai.chat.completions.create({
      messages: messages,
      stream: false,
      model: model,
      temperature: 0.8,
      max_tokens: nbMaxNewTokens,
    })
    return res.choices[0].message.content || ""
  } catch (err) {
    console.error(`Error with model ${model}: ${err}`)
    return ""
  }
}

export async function predict({
  systemPrompt,
  userPrompt,
  nbMaxNewTokens,
  llmVendorConfig
}: LLMPredictionFunctionParams): Promise<string> {
  const openaiApiKey = `${
    llmVendorConfig.apiKey ||
    process.env.AUTH_OPENAI_API_KEY ||
    ""
  }`
  
  if (!openaiApiKey) { 
    throw new Error(`cannot call OpenAI without an API key`) 
  }

  const openaiApiBaseUrl = `${process.env.LLM_OPENAI_API_BASE_URL || "https://api.openai.com/v1"}`

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    baseURL: openaiApiBaseUrl,
  })

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]

  // 依次尝试所有模型
  for (const model of FALLBACK_MODELS) {
    const result = await makeOpenAICall(openai, messages, model, nbMaxNewTokens)
    
    // 如果返回结果不为空，则返回该结果
    if (result) {
      console.log(`Successfully generated response using model: ${model}`)
      return result
    }
    
    console.log(`Retrying with next model after failure with: ${model}`)
  }

  // 如果所有模型都失败了，抛出错误
  throw new Error("All models failed to generate a response")
}