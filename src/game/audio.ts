// Som ambiente gerado proceduralmente por cômodo. Sem assets externos.
import type { Room } from "./types";

let ctx: AudioContext | null = null;
let current: { stop: () => void; room: Room } | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch { return null; }
  }
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds = 2) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function startSala(c: AudioContext): () => void {
  // Hum quente baixo + chuva leve
  const noise = c.createBufferSource(); noise.buffer = noiseBuffer(c, 4); noise.loop = true;
  const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.7;
  const ng = c.createGain(); ng.gain.value = 0.025;
  noise.connect(bp).connect(ng).connect(c.destination); noise.start();
  const osc = c.createOscillator(); osc.type = "sine"; osc.frequency.value = 60;
  const og = c.createGain(); og.gain.value = 0.04;
  osc.connect(og).connect(c.destination); osc.start();
  return () => { try { noise.stop(); osc.stop(); } catch {} };
}
function startCozinha(c: AudioContext): () => void {
  // Geladeira (hum 100Hz) + tic-tic ocasional
  const osc = c.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 100;
  const og = c.createGain(); og.gain.value = 0.025;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 220;
  osc.connect(lp).connect(og).connect(c.destination); osc.start();
  const interval = window.setInterval(() => {
    const t = c.createOscillator(); const g = c.createGain();
    t.type = "triangle"; t.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.06);
    t.connect(g).connect(c.destination); t.start(); t.stop(c.currentTime + 0.08);
  }, 2200);
  return () => { try { osc.stop(); } catch {}; window.clearInterval(interval); };
}
function startBanheiro(c: AudioContext): () => void {
  // Goteira + reverberação curta de torneira
  const interval = window.setInterval(() => {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(900, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(280, c.currentTime + 0.18);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.28);
  }, 1800);
  // Ventoinha leve
  const noise = c.createBufferSource(); noise.buffer = noiseBuffer(c, 4); noise.loop = true;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
  const ng = c.createGain(); ng.gain.value = 0.02;
  noise.connect(lp).connect(ng).connect(c.destination); noise.start();
  return () => { window.clearInterval(interval); try { noise.stop(); } catch {} };
}
function startQuarto(c: AudioContext): () => void {
  // Relógio tic-tac + colchão de ar quase inaudível
  const interval = window.setInterval(() => {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "square"; o.frequency.value = 2200;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.04, c.currentTime + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.04);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.05);
  }, 1000);
  const osc = c.createOscillator(); osc.type = "sine"; osc.frequency.value = 80;
  const og = c.createGain(); og.gain.value = 0.025;
  osc.connect(og).connect(c.destination); osc.start();
  return () => { window.clearInterval(interval); try { osc.stop(); } catch {} };
}

function startAmbienteAberto(c: AudioContext): () => void {
  // Parque: vento leve + pássaros esporádicos
  const noise = c.createBufferSource(); noise.buffer = noiseBuffer(c, 4); noise.loop = true;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
  const ng = c.createGain(); ng.gain.value = 0.03;
  noise.connect(lp).connect(ng).connect(c.destination); noise.start();
  const interval = window.setInterval(() => {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(2400, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(3200, c.currentTime + 0.09);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.03, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.2);
  }, 3400);
  return () => { window.clearInterval(interval); try { noise.stop(); } catch {} };
}

function startMultidao(c: AudioContext): () => void {
  // Shopping: burburinho de multidão (ruído filtrado modulado)
  const noise = c.createBufferSource(); noise.buffer = noiseBuffer(c, 5); noise.loop = true;
  const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 600; bp.Q.value = 0.5;
  const ng = c.createGain(); ng.gain.value = 0.045;
  const lfo = c.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 0.15;
  const lfoGain = c.createGain(); lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain).connect(ng.gain); lfo.start();
  noise.connect(bp).connect(ng).connect(c.destination); noise.start();
  return () => { try { noise.stop(); lfo.stop(); } catch {} };
}

const STARTERS: Record<Room, (c: AudioContext) => () => void> = {
  sala: startSala, cozinha: startCozinha, banheiro: startBanheiro, quarto: startQuarto,
  lago: startAmbienteAberto, quadra: startAmbienteAberto,
  "loja-de-roupas": startMultidao, "fast-food": startMultidao, "loja-de-brinquedos": startMultidao,
};

export function playRoomAmbience(room: Room) {
  const c = getCtx(); if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  if (current?.room === room) return;
  current?.stop();
  const stop = STARTERS[room](c);
  current = { stop, room };
}

export function stopAmbience() {
  current?.stop();
  current = null;
}
