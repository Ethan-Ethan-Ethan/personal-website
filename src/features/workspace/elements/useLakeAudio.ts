import { useEffect, useRef, useState } from 'react';
import { WATER_VOICES } from '../core/lake-audio';

// 合成水聲：白噪音 buffer → 低通濾波 → 慢速 LFO 推濾波頻率（像水流起伏）。
// AudioContext 建在第一次點擊裡（自動播放政策要求手勢解鎖）。
export function useLakeAudio(trackId: string) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; filter: BiquadFilterNode; lfo: OscillatorNode; lfoGain: GainNode } | null>(null);
  const [playing, setPlaying] = useState(false);
  const trackRef = useRef(trackId);
  trackRef.current = trackId;

  const applyVoice = (id: string) => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    const voice = WATER_VOICES[id];
    if (!ctx || !nodes || !voice) return;
    const t = ctx.currentTime;
    nodes.filter.frequency.setTargetAtTime(voice.filterFreq, t, 0.8);
    nodes.filter.Q.setTargetAtTime(voice.q, t, 0.8);
    nodes.gain.gain.setTargetAtTime(voice.gain, t, 0.8);
    nodes.lfo.frequency.setTargetAtTime(voice.lfoRate, t, 0.8);
    nodes.lfoGain.gain.setTargetAtTime(voice.lfoDepth, t, 0.8);
  };

  useEffect(() => {
    if (playing) applyVoice(trackRef.current);
  }, [trackId, playing]);

  useEffect(() => () => {
    try {
      void ctxRef.current?.close();
    } catch { /* unmount 盡力關 */ }
    ctxRef.current = null;
    nodesRef.current = null;
  }, []);

  const toggle = () => {
    if (playing) {
      const ctx = ctxRef.current;
      if (ctx) void ctx.suspend();
      setPlaying(false);
      return;
    }
    let ctx = ctxRef.current;
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      ctxRef.current = ctx;
      const len = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      lfo.start();
      nodesRef.current = { gain, filter, lfo, lfoGain };
    }
    void ctx.resume();
    applyVoice(trackRef.current);
    setPlaying(true);
  };

  return { playing, toggle, ready: true };
}
