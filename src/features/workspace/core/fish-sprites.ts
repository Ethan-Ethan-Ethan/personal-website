// 魚貼圖唯一正本：koi-sheet.png 三條裁切（分數座標），base 為圖中朝向。
// 地面真值（koi-20261011-065843.png）：左頭下／中頭上／右頭下，base 全對，禁改。
// FishLayer.tsx 唯讀引用此表，禁另存第二份。
export type FishSprite = { x: number; y: number; w: number; h: number; base: number };

export const FISH_SPRITES: FishSprite[] = [
  { x: 0.09, y: 0.15, w: 0.22, h: 0.72, base: Math.PI / 2 },
  { x: 0.375, y: 0.09, w: 0.255, h: 0.8, base: -Math.PI / 2 },
  { x: 0.715, y: 0.15, w: 0.23, h: 0.73, base: Math.PI / 2 },
];
