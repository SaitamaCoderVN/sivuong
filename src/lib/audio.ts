'use client';

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

export const playTickSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;

        // =========================
        // 1️⃣ Tick sạch giống đồng hồ cơ
        // =========================
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lowpass = ctx.createBiquadFilter();

        osc.type = "sine";              // Sạch nhất
        osc.frequency.value = 1000;     // Không sweep nữa

        lowpass.type = "lowpass";
        lowpass.frequency.value = 1500; // Cắt bớt high harsh

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.02, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);


        // =========================
        // 2️⃣ Alpha binaural rất nhẹ (êm)
        // =========================
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const alphaGain = ctx.createGain();

        // Chênh 10Hz giữa hai tai
        leftOsc.frequency.value = 200;
        rightOsc.frequency.value = 210;

        leftOsc.type = "sine";
        rightOsc.type = "sine";

        alphaGain.gain.value = 0.005; // cực nhỏ

        leftOsc.connect(merger, 0, 0);
        rightOsc.connect(merger, 0, 1);
        merger.connect(alphaGain);
        alphaGain.connect(ctx.destination);

        leftOsc.start(now);
        rightOsc.start(now);

        leftOsc.stop(now + 1);
        rightOsc.stop(now + 1);

    } catch (e) {
        console.error("Tick sound error:", e);
    }
};

export const playBreakBell = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;

        const playBellNote = (
            freq: number,
            startOffset: number,
            duration: number
        ) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            // Chuông nên dùng sine + chút harmonic
            osc.type = "sine";
            osc.frequency.value = freq;

            // Lowpass để tránh chói
            filter.type = "lowpass";
            filter.frequency.value = 4000;

            const startTime = now + startOffset;

            // Attack mềm
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);

            // thêm harmonic rất nhẹ (chuông kính)
            const harmonic = ctx.createOscillator();
            const harmonicGain = ctx.createGain();

            harmonic.type = "sine";
            harmonic.frequency.value = freq * 2;

            harmonicGain.gain.setValueAtTime(0.0001, startTime);
            harmonicGain.gain.exponentialRampToValueAtTime(0.03, startTime + 0.02);
            harmonicGain.gain.exponentialRampToValueAtTime(
                0.0001,
                startTime + duration
            );

            harmonic.connect(harmonicGain);
            harmonicGain.connect(ctx.destination);

            harmonic.start(startTime);
            harmonic.stop(startTime + duration);
        };

        // 🌿 Chuông đi lên nhẹ nhàng (C5 → E5 → G5 → C6)
        playBellNote(523.25, 0.0, 2.5);
        playBellNote(659.25, 0.15, 2.3);
        playBellNote(783.99, 0.3, 2.2);
        playBellNote(1046.5, 0.45, 3);

    } catch (e) {
        console.error("Bell sound error:", e);
    }
};