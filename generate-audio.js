/**
 * 音频生成脚本（Node.js）
 * 使用 Web Audio API 原理生成简单的音调和音效
 * 
 * 使用方法:
 * node generate-audio.js
 */

const fs = require('fs');
const path = require('path');

// 简单的 WAV 文件生成器
class WAVGenerator {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
        this.samples = [];
    }

    /**
     * 生成正弦波音调
     */
    generateTone(frequency, duration, volume = 0.3) {
        const numSamples = Math.round(this.sampleRate * duration);
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            const sample = Math.sin(2 * Math.PI * frequency * t) * volume;
            // 添加衰减包络
            const envelope = Math.exp(-3 * t / duration);
            this.samples.push(sample * envelope);
        }
        return this;
    }

    /**
     * 生成多频率音效（如成功音效）
     */
    generateSuccessEffect() {
        // 快速上升的两个音调
        this.generateTone(523, 0.15, 0.3); // C5
        this.generateTone(659, 0.15, 0.3); // E5
        this.generateTone(784, 0.2, 0.3);  // G5
        return this;
    }

    /**
     * 转换为 WAV 字节
     */
    toWAV() {
        const samples = this.samples;
        const numChannels = 1;
        const sampleRate = this.sampleRate;
        const bytesPerSample = 2;
        const blockAlign = numChannels * bytesPerSample;

        // WAV 头
        const buffer = Buffer.alloc(44 + samples.length * bytesPerSample);
        const view = new DataView(buffer.buffer);

        // RIFF 标识
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + samples.length * bytesPerSample, true);
        this.writeString(view, 8, 'WAVE');

        // fmt 子块
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // 子块大小
        view.setUint16(20, 1, true);  // PCM
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bytesPerSample * 8, true); // 位深度

        // data 子块
        this.writeString(view, 36, 'data');
        view.setUint32(40, samples.length * bytesPerSample, true);

        // 写入样本数据
        let offset = 44;
        for (let i = 0; i < samples.length; i++) {
            const sample = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return buffer;
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

// 创建输出目录
const soundsDir = path.join(__dirname, 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
}

// 生成音频文件
const sounds = [
    { name: 'tissue.wav', freq: 440, duration: 0.5, volume: 0.3 },   // A4
    { name: 'carrot.wav', freq: 550, duration: 0.5, volume: 0.3 },   // C#5
    { name: 'treat.wav', freq: 660, duration: 0.5, volume: 0.3 },    // E5
    { name: 'eat.wav', freq: 300, duration: 0.4, volume: 0.3 },      // Low tone
];

console.log('开始生成音频文件...');

sounds.forEach(({ name, freq, duration, volume }) => {
    const generator = new WAVGenerator();
    generator.generateTone(freq, duration, volume);
    const wav = generator.toWAV();
    const filePath = path.join(soundsDir, name);
    fs.writeFileSync(filePath, wav);
    console.log(`✓ 已生成: ${name}`);
});

// 生成成功音效
const successGen = new WAVGenerator();
successGen.generateSuccessEffect();
const successWAV = successGen.toWAV();
fs.writeFileSync(path.join(soundsDir, 'success.wav'), successWAV);
console.log('✓ 已生成: success.wav');

console.log('\n所有音频文件生成完成！');
console.log(`输出目录: ${soundsDir}`);
