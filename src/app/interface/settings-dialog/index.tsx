import { useState } from "react"
import { useLocalStorage } from 'usehooks-ts'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { RenderingModelVendor } from "@/types"
import { Input } from "@/components/ui/input"

import { Label } from "./label"
import { Field } from "./field"
import { localStorageKeys } from "./localStorageKeys"
import { defaultSettings } from "./defaultSettings"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function SettingsDialog() {
  const [isOpen, setOpen] = useState(false)
  const [renderingModelVendor, setRenderingModelVendor] = useLocalStorage<RenderingModelVendor>(
    localStorageKeys.renderingModelVendor,
    defaultSettings.renderingModelVendor
  )
  const [renderingUseTurbo, setRenderingUseTurbo] = useLocalStorage<boolean>(
    localStorageKeys.renderingUseTurbo,
    defaultSettings.renderingUseTurbo
  )
  const [huggingfaceApiKey, setHuggingfaceApiKey] = useLocalStorage<string>(
    localStorageKeys.huggingfaceApiKey,
    defaultSettings.huggingfaceApiKey
  )
  const [huggingfaceInferenceApiModel, setHuggingfaceInferenceApiModel] = useLocalStorage<string>(
    localStorageKeys.huggingfaceInferenceApiModel,
    defaultSettings.huggingfaceInferenceApiModel
  )
  const [huggingfaceInferenceApiModelTrigger, setHuggingfaceInferenceApiModelTrigger] = useLocalStorage<string>(
    localStorageKeys.huggingfaceInferenceApiModelTrigger,
    defaultSettings.huggingfaceInferenceApiModelTrigger
  )
  const [huggingfaceInferenceApiFileType, setHuggingfaceInferenceApiFileType] = useLocalStorage<string>(
    localStorageKeys.huggingfaceInferenceApiFileType,
    defaultSettings.huggingfaceInferenceApiFileType
  )
  const [replicateApiKey, setReplicateApiKey] = useLocalStorage<string>(
    localStorageKeys.replicateApiKey,
    defaultSettings.replicateApiKey
  )
  const [replicateApiModel, setReplicateApiModel] = useLocalStorage<string>(
    localStorageKeys.replicateApiModel,
    defaultSettings.replicateApiModel
  )
  const [replicateApiModelVersion, setReplicateApiModelVersion] = useLocalStorage<string>(
    localStorageKeys.replicateApiModelVersion,
    defaultSettings.replicateApiModelVersion
  )
  const [replicateApiModelTrigger, setReplicateApiModelTrigger] = useLocalStorage<string>(
    localStorageKeys.replicateApiModelTrigger,
    defaultSettings.replicateApiModelTrigger
  )
  const [openaiApiKey, setOpenaiApiKey] = useLocalStorage<string>(
    localStorageKeys.openaiApiKey,
    defaultSettings.openaiApiKey
  )
  const [openaiApiModel, setOpenaiApiModel] = useLocalStorage<string>(
    localStorageKeys.openaiApiModel,
    defaultSettings.openaiApiModel
  )

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="space-x-1 md:space-x-2">
          <div>
            <span className="hidden md:inline">设置</span>
          </div>
        </Button> 
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[500px] md:max-w-[700px] overflow-y-auto h-max-[100vh] md:h-max-[80vh]">
        <DialogHeader>
          <DialogDescription className="w-full text-center text-lg font-bold text-stone-800">
            自定义设置
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1 space-y-1 text-stone-800">

          <p className="text-sm text-zinc-700">
            提醒：当启用定制模型或较少用到的模型时，许多服务供应商需要一段时间的预热。如果遇到这种情况，请耐心等待5分钟之后再试。 
          </p>
          <p className="text-sm text-zinc-700">
            安全须知：我们不会在服务器端保留这些配置信息，它们将通过本地存储功能直接保存在您的网页浏览器里。 
          </p>

          <Field>
            <Label>图片供应商:</Label>
            <Select
              onValueChange={(value: string) => {
                setRenderingModelVendor(value as RenderingModelVendor)
              }}
              defaultValue={renderingModelVendor}>
              <SelectTrigger className="">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SERVER">使用服务器设置（默认）</SelectItem>
                <SelectItem value="HUGGINGFACE">使用自定义的 Hugging Face 模型（推荐）</SelectItem>
                <SelectItem value="REPLICATE">选择自定义 Replicate 模型（将使用您自己的账户）</SelectItem>
                <SelectItem value="OPENAI">选用 OpenAI 的 DALL·E 3（支持度有限，需要使用您的个人账户）</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {renderingModelVendor === "SERVER" && <>
            <Field>
              <Label>考虑质量相对于性能的比重:</Label>
              <div className="flex flex-row space-x-2 text-zinc-500">
                <Switch
                  checked={renderingUseTurbo}
                  onCheckedChange={setRenderingUseTurbo}
                />
                <span
                  onClick={() => setRenderingUseTurbo(!renderingUseTurbo)}
                  className={cn("cursor-pointer", { "text-zinc-800": renderingUseTurbo })}>使用快速但画质较低的模型（默认） &nbsp; ⬅️ 关闭此选项可以提升质量!</span>
              </div>
            </Field>
          </>}

          {renderingModelVendor === "HUGGINGFACE" && <>
            <Field>
              <Label>Hugging Face API Token (<a className="text-stone-600 underline" href="https://huggingface.co/subscribe/pro" target="_blank">PRO account</a> recommended for higher rate limit):</Label>
              <Input
                className="font-mono"
                type="password"
                placeholder="Enter your private api token"
                onChange={(x) => {
                  setHuggingfaceApiKey(x.target.value)
                }}
                value={huggingfaceApiKey}
              />
            </Field>
            <Field>
              <Label>Inference API model (custom SDXL or SDXL LoRA):</Label>
              <Input
                className="font-mono"
                placeholder="Name of the Inference API model"
                onChange={(x) => {
                  setHuggingfaceInferenceApiModel(x.target.value)
                }}
                value={huggingfaceInferenceApiModel}
              />
            </Field>
            <Field>
              <Label>The file type supported by the model (jpg, webp..):</Label>
              <Input
                className="font-mono"
                placeholder="Inference API file type"
                onChange={(x) => {
                  setHuggingfaceInferenceApiFileType(x.target.value)
                }}
                value={huggingfaceInferenceApiFileType}
              />
            </Field>
            <p className="text-sm text-zinc-700">
              Using a LoRA? Don&apos;t forget the trigger keyword! Also you will want to use the &quot;Neutral&quot; style.
            </p>
            <Field>
              <Label>LoRA model trigger (optional):</Label>
              <Input
                className="font-mono"
                placeholder="Trigger keyword (if you use a LoRA)"
                onChange={(x) => {
                  setHuggingfaceInferenceApiModelTrigger(x.target.value)
                }}
                value={huggingfaceInferenceApiModelTrigger}
              />
              </Field>
          </>}

          {renderingModelVendor === "OPENAI" && <>
            <Field>
              <Label>OpenAI API Token (you will be billed based on OpenAI pricing):</Label>
              <Input
                className="font-mono"
                type="password"
                placeholder="Enter your private api token"
                onChange={(x) => {
                  setOpenaiApiKey(x.target.value)
                }}
                value={openaiApiKey}
              />
            </Field>
            <Field>
              <Label>OpenAI image model:</Label>
              <Input
                className="font-mono"
                placeholder="OpenAI image model"
                onChange={(x) => {
                  setOpenaiApiModel(x.target.value)
                }}
                value={openaiApiModel}
              />
            </Field>
          </>}

          {renderingModelVendor === "REPLICATE" && <>
              <Field>
                <Label>Replicate API Token (you will be billed based on Replicate pricing):</Label>
                <Input
                  className="font-mono"
                  type="password"
                  placeholder="Enter your private api token"
                  onChange={(x) => {
                    setReplicateApiKey(x.target.value)
                  }}
                  value={replicateApiKey}
                />
              </Field>
              <Field>
                <Label>Replicate model name:</Label>
                <Input
                  className="font-mono"
                  placeholder="Name of the Replicate model"
                  onChange={(x) => {
                    setReplicateApiModel(x.target.value)
                  }}
                  value={replicateApiModel}
                />
              </Field>
              <Field>
                <Label>Model version:</Label>
                <Input
                  className="font-mono"
                  placeholder="Version of the Replicate model"
                  onChange={(x) => {
                    setReplicateApiModelVersion(x.target.value)
                  }}
                  value={replicateApiModelVersion}
                />
              </Field>
              <p className="text-sm text-zinc-700">
                Using a LoRA? Don&apos;t forget the trigger keyword! Also you will want to use the &quot;Neutral&quot; style.
              </p>
              <Field>
                <Label>LoRA model trigger (optional):</Label>
                <Input
                  className="font-mono"
                  placeholder={'Eg. "In the style of TOK" etc'}
                  onChange={(x) => {
                    setReplicateApiModelTrigger(x.target.value)
                  }}
                  value={replicateApiModelTrigger}
                />
              </Field>
            </>}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}