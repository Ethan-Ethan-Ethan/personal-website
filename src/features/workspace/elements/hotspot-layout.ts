export type RectLike = { left: number; top: number; width: number; height: number };

export type HotspotLayoutInput = {
  scene: RectLike;
  hotspot: RectLike;
  target: RectLike;
  popover: { width: number; height: number };
  edgePadding?: number;
};

export type HotspotLayout = {
  sceneWidth: number;
  sceneHeight: number;
  popoverX: number;
  popoverY: number;
  guideStartX: number;
  guideStartY: number;
  guideEndX: number;
  guideEndY: number;
  path: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(max, min), Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

export function computeHotspotLayout({
  scene,
  hotspot,
  target,
  popover,
  edgePadding = 16,
}: HotspotLayoutInput): HotspotLayout {
  const targetX = target.left + target.width / 2 - scene.left;
  const targetY = target.top + target.height / 2 - scene.top;
  const hotspotX = hotspot.left + hotspot.width / 2 - scene.left;
  const hotspotTop = hotspot.top - scene.top;
  const hotspotBottom = hotspotTop + hotspot.height;
  const maxX = scene.width - popover.width - edgePadding;
  const maxY = scene.height - popover.height - edgePadding;
  const popoverX = clamp(hotspotX - popover.width / 2, edgePadding, maxX);
  const betweenStart = hotspotBottom + 12;
  const betweenEnd = targetY - popover.height - 18;
  const desiredY = betweenStart <= betweenEnd
    ? betweenStart
    : hotspotTop - popover.height - 12;
  const popoverY = clamp(desiredY, edgePadding, maxY);
  const guideStartX = clamp(targetX, popoverX + 18, popoverX + popover.width - 18);
  const guideStartY = popoverY + popover.height;
  const midY = guideStartY + (targetY - guideStartY) * 0.52;

  return {
    sceneWidth: round(scene.width),
    sceneHeight: round(scene.height),
    popoverX: round(popoverX),
    popoverY: round(popoverY),
    guideStartX: round(guideStartX),
    guideStartY: round(guideStartY),
    guideEndX: round(targetX),
    guideEndY: round(targetY),
    path: `M ${round(guideStartX)} ${round(guideStartY)} C ${round(guideStartX)} ${round(midY)} ${round(targetX)} ${round(midY)} ${round(targetX)} ${round(targetY)}`,
  };
}
