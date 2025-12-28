// ==================== 配置 ====================
const CONFIG = {
    SOUNDS: {
        tissue: 'assets/sounds/tissue.wav',
        carrot: 'assets/sounds/carrot.wav',
        treat: 'assets/sounds/treat.wav',
        eat: 'assets/sounds/eat.wav',
        success: 'assets/sounds/success.wav'
    },
    CAT_POKE_DURATION: 3.5,      // 猫指向的总时长（含摇摆 + 确认）
    FEED_ANIMATION_DURATION: 0.8  // 冻干飞行时长
};

// ==================== 全局状态 ====================
const STATE = {
    isLoading: true,
    isAudioUnlocked: false,
    isMuted: false,
    isRecording: false,
    isAnimating: false,
    catPointing: null, // 'tissue' 或 'carrot' - 猫指向的物品
    sounds: {},
    audioContext: null,
    mediaStream: null,
    mediaRecorder: null,
    analyser: null
};

// ==================== 音频初始化 ====================

/**
 * 初始化 Howler 音频
 */
function initializeAudio() {
    const soundConfigs = {
        tissue: { src: CONFIG.SOUNDS.tissue, volume: 0.8 },
        carrot: { src: CONFIG.SOUNDS.carrot, volume: 0.8 },
        treat: { src: CONFIG.SOUNDS.treat, volume: 0.8 },
        eat: { src: CONFIG.SOUNDS.eat, volume: 0.6 },
        success: { src: CONFIG.SOUNDS.success, volume: 0.7 }
    };

    for (const [key, config] of Object.entries(soundConfigs)) {
        try {
            STATE.sounds[key] = new Howl({
                src: [config.src],
                volume: config.volume,
                preload: false,
                html5: true,
                pool: 1,
                onload: () => console.log(`[Audio] ${key} 已加载`),
                onerror: () => console.warn(`[Audio] ${key} 加载失败`)
            });
        } catch (err) {
            console.error(`[Audio] ${key} 初始化失败:`, err);
            STATE.sounds[key] = { play: () => {}, stop: () => {}, playing: () => false };
        }
    }
}

/**
 * 解锁音频上下文
 */
function unlockAudio() {
    if (STATE.isAudioUnlocked) return;

    try {
        if (Howler && Howler.ctx) {
            Howler.ctx.resume().then(() => {
                STATE.isAudioUnlocked = true;
                console.log('[Audio] 音频上下文已解锁');
            }).catch(err => {
                console.warn('[Audio] 音频解锁失败:', err);
                STATE.isAudioUnlocked = true;
            });
        } else {
            STATE.isAudioUnlocked = true;
        }
    } catch (err) {
        console.error('[Audio] 解锁失败:', err);
        STATE.isAudioUnlocked = true;
    }
}

/**
 * 播放声音
 */
function playSound(soundKey) {
    if (STATE.isMuted || !STATE.sounds[soundKey]) return;

    try {
        const sound = STATE.sounds[soundKey];
        if (sound && typeof sound.playing === 'function' && sound.playing()) {
            sound.stop();
        }
        if (sound && typeof sound.play === 'function') {
            sound.play();
        }
    } catch (err) {
        console.warn(`[Audio] 播放 ${soundKey} 失败:`, err);
    }
}

// ==================== 语音识别和麦克风 ====================

/**
 * 初始化麦克风
 */
async function initMicrophone() {
    try {
        STATE.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        STATE.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        STATE.analyser = STATE.audioContext.createAnalyser();
        
        const source = STATE.audioContext.createMediaStreamSource(STATE.mediaStream);
        source.connect(STATE.analyser);
        
        console.log('[Mic] 麦克风已初始化');
        return true;
    } catch (err) {
        console.error('[Mic] 麦克风初始化失败:', err);
        alert('需要允许使用麦克风。请在浏览器权限设置中允许麦克风访问。');
        return false;
    }
}

/**
 * 开始录音
 */
function startRecording() {
    if (STATE.isRecording || !STATE.mediaStream) return;

    STATE.isRecording = true;
    STATE.mediaRecorder = new MediaRecorder(STATE.mediaStream);
    
    const chunks = [];
    
    STATE.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    STATE.mediaRecorder.onstop = () => {
        console.log('[Mic] 录音已停止');
        onRecordingComplete();
    };

    STATE.mediaRecorder.start();
    
    updateMicButton();
    updateStatusText('正在聆听...');
    console.log('[Mic] 开始录音');
}

/**
 * 停止录音
 */
function stopRecording() {
    if (!STATE.isRecording || !STATE.mediaRecorder) return;

    STATE.mediaRecorder.stop();
    STATE.isRecording = false;
    updateMicButton();
}

/**
 * 录音完成，触发猫咪随机选择
 */
function onRecordingComplete() {
    console.log('[Game] 音频结束，触发猫咪选择');
    
    // 随机选择：纸巾或萝卜
    const items = ['tissue', 'carrot'];
    STATE.catPointing = items[Math.floor(Math.random() * items.length)];
    
    updateStatusText(`猫咪指向: ${STATE.catPointing === 'tissue' ? '纸巾' : '萝卜'}`);
    
    // 播放猫咪指向动画
    animateCatPointing(STATE.catPointing);
    
    // 启用投喂按钮
    enableTreatButton();
}

// ==================== 动画 ====================

/**
 * 猫咪指向动画（带摇摆效果）
 */
/**
 * 猫咪指向动画（带摇摆效果）
 */
function animateCatPointing(target) {
    if (STATE.isAnimating) return;
    
    STATE.isAnimating = true;
    const cat = document.getElementById('cat');
    const catImage = document.getElementById('catImage');
    
    // 清除旧动画类
    catImage.className = 'cat-image';
    cat.classList.remove('confirming');
    
    // 切换到指向图片（指向左或右）
    catImage.src = target === 'tissue' ? 'assets/images/l.png' : 'assets/images/r.png';
    
    // 随机摇摆时长（2-5 秒）
    const swayDuration = 2 + Math.random() * 3;
    
    console.log(`[Anim] 猫咪指向 ${target}，摇摆时长: ${swayDuration.toFixed(2)}s`);
    
    // 添加指向动画类
    const direction = target === 'tissue' ? 'pointing-left' : 'pointing-right';
    catImage.classList.add(direction);
    
    // 设置动画时长
    catImage.style.animationDuration = `${swayDuration}s`;
    
    // 高亮指向的物品
    highlightItem(target);
    
    // 在摇摆完成后，猫咪抬头确认
    const confirmDelay = (swayDuration * 0.8) * 1000; // 动画进行到 80% 时触发确认
    
    setTimeout(() => {
        // 恢复到听声音状态并点头确认
        catImage.src = 'assets/images/hold.png';
        catImage.className = 'cat-image hold';
        cat.classList.add('confirming');
        console.log('[Anim] 猫咪确认指向');
        
        // 确认动画完成后解除动画锁
        setTimeout(() => {
            cat.classList.remove('confirming');
            STATE.isAnimating = false;
        }, 600);
    }, confirmDelay);
}

/**
 * 高亮物品
 */
function highlightItem(itemType) {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        if (item.getAttribute('data-type') === itemType) {
            item.classList.add('highlighted');
        } else {
            item.classList.remove('highlighted');
        }
    });
}

/**
 * 猫咪吃食动画
 */
function animateCatEating(callback) {
    const cat = document.getElementById('cat');
    const catImage = document.getElementById('catImage');
    
    // 切换到吃食图片
    catImage.src = 'assets/images/e.png';
    catImage.classList.add('eating');
    
    playSound('eat');
    
    setTimeout(() => {
        // 移除吃食动画，恢复为听声音状态
        catImage.classList.remove('eating');
        catImage.src = 'assets/images/hold.png';
        cat.classList.add('happy');
        
        // 粒子效果
        createParticles(
            cat.getBoundingClientRect().left + 90,
            cat.getBoundingClientRect().top + 50,
            12
        );
        
        // 成功反馈
        createFloatingText(
            cat.getBoundingClientRect().left + 60,
            cat.getBoundingClientRect().top - 30,
            '😋',
            'hearts'
        );
        
        playSound('success');
        
        setTimeout(() => {
            cat.classList.remove('happy');
            if (callback) callback();
        }, 800);
    }, 600);
}

/**
 * 创建粒子效果
 */
function createParticles(x, y, count = 8) {
    const container = document.getElementById('feedbackContainer');
    const particleEmojis = ['✨', '💫', '⭐', '🌟'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = Math.random() * 20 + 15 + 'px';

        const angle = (i / count) * Math.PI * 2;
        const distance = 80 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1200);
    }
}

/**
 * 创建浮动文字
 */
function createFloatingText(x, y, text, className = 'hearts') {
    const container = document.getElementById('feedbackContainer');
    const el = document.createElement('div');
    el.className = `floating-text ${className}`;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    
    container.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

// ==================== UI 交互 ====================

/**
 * 初始化麦克风按钮
 */
function initializeMicButton() {
    const micBtn = document.getElementById('micBtn');
    
    micBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        
        if (!STATE.isAudioUnlocked) {
            unlockAudio();
        }
        
        if (STATE.isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    micBtn.addEventListener('pointerup', () => {
        // 可选：长按松开时停止录音
    });
}

/**
 * 更新麦克风按钮样式
 */
function updateMicButton() {
    const micBtn = document.getElementById('micBtn');
    const visualizer = document.getElementById('audioVisualizer');
    
    if (STATE.isRecording) {
        micBtn.classList.add('recording');
        visualizer.classList.add('active');
    } else {
        micBtn.classList.remove('recording');
        visualizer.classList.remove('active');
    }
}

/**
 * 更新状态文字
 */
function updateStatusText(text) {
    document.getElementById('statusText').textContent = text;
}

/**
 * 启用投喂按钮
 */
function enableTreatButton() {
    const treatBtn = document.getElementById('treatBtn');
    treatBtn.disabled = false;
}

/**
 * 禁用投喂按钮
 */
function disableTreatButton() {
    const treatBtn = document.getElementById('treatBtn');
    treatBtn.disabled = true;
}

/**
 * 投喂冻干
 */
function handleTreatFeed(e) {
    if (STATE.isAnimating || !STATE.catPointing) return;
    
    e.preventDefault();
    
    console.log('[Game] 玩家投喂冻干，猫指向的是:', STATE.catPointing);
    
    disableTreatButton();
    
    // 冻干飞向猫的动画
    const treatBtn = document.getElementById('treatBtn');
    const treatRect = treatBtn.getBoundingClientRect();
    const cat = document.getElementById('cat');
    const catRect = cat.getBoundingClientRect();
    
    // 创建飞行的冻干
    const flyingTreat = document.createElement('div');
    flyingTreat.style.position = 'fixed';
    flyingTreat.style.left = treatRect.left + treatRect.width / 2 - 15 + 'px';
    flyingTreat.style.top = treatRect.top + treatRect.height / 2 - 15 + 'px';
    flyingTreat.style.fontSize = '30px';
    flyingTreat.textContent = '✨';
    flyingTreat.style.pointerEvents = 'none';
    flyingTreat.style.zIndex = '50';
    
    document.body.appendChild(flyingTreat);
    
    // 动画到猫口
    gsap.to(flyingTreat, {
        left: catRect.left + catRect.width / 2 - 15,
        top: catRect.top + catRect.height / 2 - 15,
        duration: CONFIG.FEED_ANIMATION_DURATION,
        ease: 'power2.inOut',
        onComplete: () => {
            flyingTreat.remove();
            // 猫咪吃食反应
            animateCatEating(() => {
                resetGame();
            });
        }
    });
    
    // 旋转效果
    gsap.to(flyingTreat, {
        rotation: 360,
        duration: CONFIG.FEED_ANIMATION_DURATION,
        ease: 'none'
    });
}

/**
 * 重置游戏状态
 */
function resetGame() {
    STATE.catPointing = null;
    
    // 清除高亮
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('highlighted');
    });
    
    // 恢复猫咪到听声音状态
    const catImage = document.getElementById('catImage');
    catImage.src = 'assets/images/hold.png';
    catImage.className = 'cat-image hold';
    
    // 清除猫的确认动画
    const cat = document.getElementById('cat');
    cat.classList.remove('confirming');
    
    disableTreatButton();
    updateStatusText('点击麦克风开始说话...');
    
    console.log('[Game] 游戏已重置，准备下一轮');
}

/**
 * 初始化开始按钮
 */
function initializeStartButton() {
    const startScreen = document.getElementById('startScreen');
    const gameScreen = document.getElementById('gameScreen');
    const startBtn = document.getElementById('startBtn');

    startBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // 初始化麦克风
        const micReady = await initMicrophone();
        if (!micReady) {
            alert('麦克风初始化失败');
            return;
        }
        
        // 解锁音频
        unlockAudio();

        // 隐藏开始屏幕，显示游戏屏幕
        startScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        
        console.log('[Game] 游戏已开始');
    });

    startScreen.addEventListener('pointerdown', (e) => {
        if (e.target === startScreen || e.target.closest('.start-content')) {
            startBtn.click();
        }
    });
}

/**
 * 初始化静音按钮
 */
function initializeMuteButton() {
    const muteBtn = document.getElementById('muteBtn');

    const savedMuted = localStorage.getItem('catGameMuted') === 'true';
    STATE.isMuted = savedMuted;
    updateMuteButtonUI();

    muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        STATE.isMuted = !STATE.isMuted;
        localStorage.setItem('catGameMuted', STATE.isMuted);
        updateMuteButtonUI();
    });
}

/**
 * 更新静音按钮 UI
 */
function updateMuteButtonUI() {
    const muteBtn = document.getElementById('muteBtn');
    if (STATE.isMuted) {
        muteBtn.textContent = '🔇';
        muteBtn.classList.add('muted');
    } else {
        muteBtn.textContent = '🔊';
        muteBtn.classList.remove('muted');
    }
}

/**
 * 加载资源
 */
async function loadResources() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('[Game] 资源加载完成');
            resolve();
        }, 500);
    });
}

// ==================== 主初始化 ====================

async function initialize() {
    try {
        console.log('[Game] 开始初始化游戏...');

        if (typeof gsap === 'undefined') {
            throw new Error('GSAP 库未加载');
        }
        if (typeof Howl === 'undefined') {
            throw new Error('Howler.js 库未加载');
        }

        console.log('[Game] 加载资源中...');
        await loadResources();

        console.log('[Game] 初始化音频系统...');
        initializeAudio();

        console.log('[Game] 绑定事件监听器...');
        initializeStartButton();
        initializeMuteButton();
        initializeMicButton();

        // 绑定投喂按钮
        document.getElementById('treatBtn').addEventListener('pointerdown', handleTreatFeed);

        document.getElementById('loadingScreen').style.display = 'none';
        STATE.isLoading = false;

        console.log('[Game] ✓ 游戏初始化完成');
    } catch (err) {
        console.error('[Game] ✗ 初始化失败:', err);
        document.getElementById('loadingScreen').innerHTML = `
            <div class="spinner" style="border-color: #ff6b6b;"></div>
            <p>初始化失败</p>
            <p style="font-size: 14px; margin-top: 20px;">错误: ${err.message}</p>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initialize);
