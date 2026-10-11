// 魚貼圖唯一正本：koi-mix.png 五條裁切（分數座標），base 為圖中朝向。
// 地面真值（koi-mix）：左起橘／白／墨斑／紅白頭下／金，僅第 4 條頭朝下，載入期翻正，禁改。
// FishLayer.tsx 唯讀引用此表，禁另存第二份。
export type FishSprite = { x: number; y: number; w: number; h: number; base: number };

export const FISH_SPRITES: FishSprite[] = [
  { x: 0.015, y: 0.16, w: 0.19, h: 0.72, base: -Math.PI / 2 },
  { x: 0.195, y: 0.16, w: 0.175, h: 0.72, base: -Math.PI / 2 },
  { x: 0.375, y: 0.16, w: 0.185, h: 0.76, base: -Math.PI / 2 },
  { x: 0.595, y: 0.13, w: 0.175, h: 0.71, base: Math.PI / 2 },
  { x: 0.785, y: 0.15, w: 0.18, h: 0.77, base: -Math.PI / 2 },
];
