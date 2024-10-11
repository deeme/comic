import { FontName, actionman, komika, vtc } from "@/lib/fonts"
import { pick } from "@/lib/pick"
import { NextFontWithVariable } from "next/dist/compiled/@next/font"

export type ComicFamily =
  | "american"
  | "asian"
  | "european"

export type ComicColor =
  | "color"
  | "grayscale"
  | "monochrome"

export interface Preset {
  id: string
  label: string
  family: ComicFamily
  color: ComicColor
  font: FontName
  llmPrompt: string
  imagePrompt: (prompt: string) => string[]
  negativePrompt: (prompt: string) => string[]
}

// ATTENTION!! negative prompts are not supported by the VideoChain API yet

export const presets: Record<string, Preset> = {
  random: {
    id: "random",
    label: "随机样式",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "",
    imagePrompt: (prompt: string) => [],
    negativePrompt: () => [],
  },
  neutral: {
    id: "neutral",
    label: "无特定风格",
    family: "american",
    color: "color",
    font: "actionman",
    llmPrompt: "",
    imagePrompt: (prompt: string) => [
      prompt,
    ],
    negativePrompt: () => [ ],
  },
  chinese: {
    id: "chinese",
    label: "奇幻",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "我想让你扮演一位擅长创作魔幻现实主义题材的编剧。你将用一些不直白，句式结构不重复，没有陈词滥调，不寻常的词句，隐喻和象征创作出抽象、有意境想象力、有创意个性、有力度、有画面感、有音乐感，具有浪漫气息，语言深邃的故事，来表达独特的神秘和魔幻感，表达对自我和世界的探索和反思，表达对自己和社会的孤独和关注，让人感到有趣、惊奇和新鲜。保持中文输出",
    imagePrompt: (prompt: string) => [
      `cinematic`,
      `hyperrealistic`,
      `footage`,
      `sharp 8k`,
      `analog`,
      `instagram`,
      `photoshoot`,
      `${prompt}`,
      `crisp details`,
      `color movie screencap`,
      `chinese 1980s fantasy cinema`
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  chinese0: {
    id: "chinese0",
    label: "国影",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "保持中文输出",
    imagePrompt: (prompt: string) => [
      `cinematic`,
      `hyperrealistic`,
      `footage`,
      `sharp 8k`,
      `analog`,
      `instagram`,
      `photoshoot`,
      `${prompt}`,
      `crisp details`,
      `color movie screencap`,
      `chinese movie`
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  chinese_manga: {
    id: "chinese_manga",
    label: "中式现代",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "保持中文输出",
    imagePrompt: (prompt: string) => [
      "digital color comicbook style",
      `modern chinese comic`,
      prompt,
      "detailed drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "american comic",
      "photo",
      "painting",
      "3D render",
      "manga",
      "anime",
      "grayscale",
      "monochrome",
      "action"
    ],
  },
  chinese1: {
    id: "chinese1",
    label: "中式经典动画",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "保持中文输出",
    imagePrompt: (prompt: string) => [
      `The distinctive animation style of the Shanghai Animation Film Studio, renowned for its integration of traditional Chinese artistry and modern animation techniques, producing visually rich and culturally resonant works.上海美术电影制片厂动画风格`,
      prompt,
      "detailed drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "american comic",
      "photo",
      "painting",
      "manga",
      "anime",
      "grayscale",
      "monochrome",
    ],
  },
  chinese2: {
    id: "chinese2",
    label: "讽刺幽默漫画",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "保持中文输出",
    imagePrompt: (prompt: string) => [
      `The satirical and humorous illustration style epitomized by Feng Zikai, renowned for its subtle societal commentary and whimsical charm, blending pointed wit with delicate artistic execution.丰子恺为代表的讽刺和幽默漫画风格`,
      prompt,
      "detailed drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "american comic",
      "photo",
      "painting",
      "3D render",
      "manga",
      "anime",
      "grayscale",
      "monochrome",
      "action"
    ],
  },
  chinese3: {
    id: "chinese3",
    label: "连环画",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "保持中文输出",
    imagePrompt: (prompt: string) => [
      `The style of Chinese traditional lianhuanhua, a sequential art form characterized by its illustrative and narrative approach, often depicting historical tales and folklore in a vivid and engaging manner.中国传统连环画风格`,
      prompt,
      "detailed drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "american comic",
      "photo",
      "painting",
      "3D render",
      "manga",
      "anime",
      "grayscale",
      "monochrome",
      "action"
    ],
  },
  chinese4: {
    id: "chinese4",
    label: "水墨画",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "保持中文输出",
    imagePrompt: (prompt: string) => [
      `The style of Chinese traditional ink wash painting, characterized by its flowing lines and monochromatic tonality, reflecting the essence of Chinese artistic expression.中国传统水墨画风格`,
      prompt,
      "detailed drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "american comic",
      "photo",
      "painting",
      "3D render",
      "manga",
      "anime",
      "grayscale",
      "monochrome",
      "action"
    ],
  },
  /*
  video_3d_style: {
    id: "video_3d_style",
    label: "[video] 3D style",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      prompt,
    ],
    negativePrompt: () => [ ],
  },
  */
  japanese_manga: {
    id: "japanese_manga",
    label: "日式",
    family: "asian",
    color: "grayscale",
    font: "actionman",
    llmPrompt: "japanese manga",
    imagePrompt: (prompt: string) => [
      `grayscale`,
      `detailed drawing`,
      `japanese manga`,
      prompt,
      // "single panel",
      // "manga",
      //  "japanese",
      // "intricate",
      // "detailed",
      // "drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "american comic",
      "photo",
      "painting",
      "3D render"
    ],
  },
  nihonga: {
    id: "nihonga",
    label: "Nihonga（日本画）",
    family: "asian",
    color: "color",
    font: "actionman",
    llmPrompt: "japanese manga",
    imagePrompt: (prompt: string) => [
      `japanese nihonga painting about ${prompt}`,
      "Nihonga",
      "ancient japanese painting",
      "intricate",
      "detailed",
      "detailed painting"
      // "drawing"
    ],
    negativePrompt: () => [
      "franco-belgian comic",
      "color album",
      "color",
      "manga",
      "comic",
      "american comic",
      "photo",
      "painting",
      "3D render"
    ],
  },
  franco_belgian: {
    id: "franco_belgian",
    label: "法比风格",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "Franco-Belgian comic (a \"bande dessinée\"), in the style of Franquin, Moebius etc",
    imagePrompt: (prompt: string) => [
      "bande dessinée",
      "franco-belgian comic",
       prompt,
      "comic album",
      "detailed drawing"
      // "color drawing"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  american_comic_90: {
    id: "american_comic_90",
    label: "美式现代",
    family: "american",
    color: "color",
    font: "actionman",
    llmPrompt: "american comic",
    imagePrompt: (prompt: string) => [
      "digital color comicbook style",
      `modern american comic`,
      prompt,
      "detailed drawing"
      //"single panel",
      // "2010s",
      // "digital print",
      // "color comicbook",
      // "color drawing"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "action",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },

  /*
  american_comic_40: {
    label: "美式 (1940)",
    family: "american",
    color: "color",
    font: "actionman",
    llmPrompt: "american comic",
    imagePrompt: (prompt: string) => [
      `american comic`,
      prompt,
      "single panel",
      "american comic",
      "comicbook style",
      "1940",
      "40s",
      "color comicbook",
      "color drawing"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "action",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  */
  american_comic_50: {
    id: "american_comic_50",
    label: "美式 (1950)",
    family: "american",
    color: "color",
    font: "actionman",
    llmPrompt: "american comic",
    imagePrompt: (prompt: string) => [
      "1950",
      "50s",
      `vintage american color comic`,
      prompt,
      "detailed drawing"
      // "single panel",
     //  "comicbook style",
      // "color comicbook",
      // "color drawing"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "action",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  /*
  american_comic_60: {
    label: "美式 (1960)",
    family: "american",
    color: "color",
    font: "actionman",
    llmPrompt: "american comic",
    imagePrompt: (prompt: string) => [
      `american comic`,
      prompt,
      "single panel",
      "american comic",
      "comicbook style",
      "1960",
      "60s",
      "color comicbook",
      "color drawing"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "action",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  */

  
  flying_saucer: {
    id: "flying_saucer",
    label: "复古科幻",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new pulp science fiction",
    imagePrompt: (prompt: string) => [
      `vintage science fiction`,
      // "40s",
      "color pulp comic panel",
      "1940",
      `${prompt}`,
      "detailed drawing"
      // "single panel",
      // "comic album"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
 
  humanoid: {
    id: "humanoid",
    label: "欧式Moebius",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "comic books by Moebius",
    imagePrompt: (prompt: string) => [
      `color comic panel`,
      "style of Moebius",
      `${prompt}`,
      "detailed drawing",
      "french comic panel",
      "franco-belgian style",
      "bande dessinée",
      "single panel",
      // "comic album"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  haddock: {
    id: "haddock",
    label: "欧式Haddock",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "writing Tintin comic books",
    imagePrompt: (prompt: string) => [
      `color comic panel`,
      "style of Hergé",
      "tintin style",
      `${prompt}`,
      "by Hergé",
      "french comic panel",
      "franco-belgian style",
     //  "color panel",
     //  "bande dessinée",
      // "single panel",
      // "comic album"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  /*
  lurid: {
    id: "lurid",
    label: "Lurid",
    family: "american",
    color: "color",
    font: "actionman",
    llmPrompt: "1970s satirical and alternative underground comics",
    imagePrompt: (prompt: string) => [
      `satirical color comic`,
      `underground comix`,
      `1970`,
      `${prompt}`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  */
  armorican: {
    id: "armorican",
    label: "欧式Armorican",
    family: "european",
    color: "monochrome",
    font: "actionman",
    llmPrompt: "french style comic books set in ancient Rome and Gaul",
    imagePrompt: (prompt: string) => [
      `color comic panel`,
      "romans",
      "gauls",
      "french comic panel",
      "franco-belgian style",
      `about ${prompt}`,
      "bande dessinée",
      "single panel",
      // "comical",
      // "comic album",
      // "color drawing"
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "photo",
      "painting",
      "3D render"
    ],
  },
  render: {
    id: "render",
    label: "3D卡通",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `3D render animation`,
      `Pixar`,
      `cute`,
      `funny`,
      `Unreal engine`,
      `${prompt}`,
      `crisp`,
      `sharp`
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  klimt: {
    id: "klimt",
    label: "欧式Klimt",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "Gustav Klimt art pieces.",
    imagePrompt: (prompt: string) => [
      `golden`,
      `patchwork`,
      `style of Gustav Klimt`,
      `Gustav Klimt painting`,
      `${prompt}`,
      `detailed painting`,
      `intricate details`
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  medieval: {
    id: "medieval",
    label: "欧洲中世纪",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "medieval story (write in this style)",
    imagePrompt: (prompt: string) => [
      `medieval illuminated manuscript`,
      `illuminated manuscript of`,
      `medieval`,
      // `medieval color engraving`,
      `${prompt}`,
      `intricate details`,
      // `medieval`
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  /*
  glass: {
    id: "glass",
    label: "Glass",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `stained glass`,
      `vitrail`,
      `stained glass`,
      // `medieval color engraving`,
      `${prompt}`,
      `medieval`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  */
  /*
  voynich: {
    id: "voynich",
    label: "Voynich",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `voynich`,
      `voynich page`,
      // `medieval color engraving`,
      `${prompt}`,
      `medieval`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  */
  egyptian: {
    id: "egyptian",
    label: "古埃及",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "ancient egyptian stories.",
    imagePrompt: (prompt: string) => [
      `ancient egyptian wall painting`,
      `ancient egypt`,
      // `medieval color engraving`,
      `${prompt}`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  /*
  psx: {
    label: "PSX",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `videogame screenshot`,
      `3dfx`,
      `3D dos game`,
      `software rendering`,
      `${prompt}`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  */
 /*
  pixel: {
    label: "Pixel",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `pixelart`,
      `isometric`,
      `pixelated`,
      `low res`,
      `${prompt}`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  */
  photonovel: {
    id: "photonovel",
    label: "法式新浪潮电影",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `vintage photo`,
      `1950`,
      `1960`,
      `french new wave`,
      `faded colors`,
      `color movie screencap`,
      `${prompt}`,
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
  stockphoto: {
    id: "stockphoto",
    label: "超现实主义电影",
    family: "european",
    color: "color",
    font: "actionman",
    llmPrompt: "new movie",
    imagePrompt: (prompt: string) => [
      `cinematic`,
      `hyperrealistic`,
      `footage`,
      `sharp 8k`,
      `analog`,
      `instagram`,
      `photoshoot`,
      `${prompt}`,
      `crisp details`
    ],
    negativePrompt: () => [
      "manga",
      "anime",
      "american comic",
      "grayscale",
      "monochrome",
      "painting"
    ],
  },
}

export type PresetName = keyof typeof presets

export const defaultPreset: PresetName = "render"

export const nonRandomPresets = Object.keys(presets).filter(p => p !== "random")

export const getPreset = (preset?: PresetName): Preset => presets[preset || defaultPreset] || presets[defaultPreset]

export const getRandomPreset = (): Preset => {
  const presetName = pick(Object.keys(presets).filter(preset => preset !== "random")) as PresetName
  return getPreset(presetName)
}