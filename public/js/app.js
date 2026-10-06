/**
 * ============================================================================
 * GPL MODS — WELCOME SCREEN ENGINE
 * - Dynamic Multi-Strategy Pinging & Server Telemetry
 * - Shared Entity Gateway Handler (Profile, ID Card, Mod Downloads)
 * - Custom & Auto-Detected Country/Region Flag System
 * - Showcase Video Engine (Kinemaster 4K Videos + Floating Satellites)
 * - GPL Beats Music Player (100% Synced with Main Site Architecture)
 * ============================================================================
 */

// 1. CONFIGURATION & URL RESOLUTION
const urlParams = new URLSearchParams(window.location.search);
const HOST_OVERRIDE = urlParams.get('host');
const MAIN_SITE_URL = HOST_OVERRIDE || 'https://gplmods.webredirect.org';

const DESTINATION_PATH = urlParams.get('dest');
const SHARED_USER = urlParams.get('user');
const SHARED_MOD = urlParams.get('mod');
const CUSTOM_FLAG_PARAM = urlParams.get('flag') || urlParams.get('country');

// -------------------------------------------------------------
// 2. FLAG & REGION DETECTION SYSTEM
// -------------------------------------------------------------
const COUNTRY_MAP = {
    'in': { flag: '🇮🇳', name: 'India', greeting: 'GPL Mods में आपका स्वागत है' },
    'hi': { flag: '🇮🇳', name: 'India', greeting: 'GPL Mods में आपका स्वागत है' },
    'us': { flag: '🇺🇸', name: 'United States', greeting: 'Welcome to' },
    'en': { flag: '🇺🇸', name: 'Global', greeting: 'Welcome to' },
    'gb': { flag: '🇬🇧', name: 'United Kingdom', greeting: 'Welcome to' },
    'uk': { flag: '🇬🇧', name: 'United Kingdom', greeting: 'Welcome to' },
    'es': { flag: '🇪🇸', name: 'Spain', greeting: 'Bienvenido a' },
    'fr': { flag: '🇫🇷', name: 'France', greeting: 'Bienvenue sur' },
    'de': { flag: '🇩🇪', name: 'Germany', greeting: 'Willkommen bei' },
    'br': { flag: '🇧🇷', name: 'Brazil', greeting: 'Bem-vindo ao' },
    'pt': { flag: '🇧🇷', name: 'Portugal/Brazil', greeting: 'Bem-vindo ao' },
    'ru': { flag: '🇷🇺', name: 'Russia', greeting: 'Добро пожаловать в' },
    'sa': { flag: '🇸🇦', name: 'Saudi Arabia', greeting: 'أهلاً بكم في' },
    'ae': { flag: '🇦🇪', name: 'UAE', greeting: 'أهلاً بكم في' },
    'ar': { flag: '🇸🇦', name: 'Arabic', greeting: 'أهلاً بكم في' },
    'jp': { flag: '🇯🇵', name: 'Japan', greeting: 'へようこそ' },
    'ja': { flag: '🇯🇵', name: 'Japan', greeting: 'へようこそ' }
};

function detectCountry() {
    if (CUSTOM_FLAG_PARAM) {
        const key = CUSTOM_FLAG_PARAM.toLowerCase();
        if (COUNTRY_MAP[key]) return COUNTRY_MAP[key];
        return { flag: '🌐', name: CUSTOM_FLAG_PARAM, greeting: 'Welcome to' };
    }

    const browserLang = (navigator.language || navigator.userLanguage || 'en-US').toLowerCase();
    const parts = browserLang.split('-');
    const lang = parts[0];
    const region = parts[1] || '';

    if (region && COUNTRY_MAP[region]) return COUNTRY_MAP[region];
    if (COUNTRY_MAP[lang]) return COUNTRY_MAP[lang];

    return { flag: '🇮🇳', name: 'India (Default)', greeting: 'GPL Mods में आपका स्वागत है' };
}

const activeCountry = detectCountry();

function setupRegionUI() {
    const flagEl = document.getElementById('region-flag-icon');
    const textEl = document.getElementById('region-flag-text');
    if (flagEl) flagEl.textContent = activeCountry.flag;
    if (textEl) textEl.textContent = activeCountry.name;
}

// -------------------------------------------------------------
// 3. PING & SERVER TELEMETRY ENGINE
// -------------------------------------------------------------
let isChecking = true;
let isRedirecting = false;
let pingAttemptCount = 0;
let pingStartTime = Date.now();

const pillElement = document.getElementById('ping-status-pill');
const statusTextEl = document.getElementById('ping-status-text');
const latencyChipEl = document.getElementById('ping-latency-badge');

function updateTelemetryUI(status, latencyMs, customMessage) {
    if (!pillElement) return;

    if (status === 'online') {
        pillElement.className = 'telemetry-pill online';
        if (statusTextEl) statusTextEl.textContent = customMessage || 'Connected to GPL Mods';
        if (latencyChipEl) latencyChipEl.textContent = latencyMs ? `${latencyMs} ms` : 'Active';
    } else if (status === 'waking') {
        pillElement.className = 'telemetry-pill';
        const elapsedSec = Math.round((Date.now() - pingStartTime) / 1000);
        if (statusTextEl) statusTextEl.textContent = `Waking Origin Server (${elapsedSec}s)...`;
        if (latencyChipEl) latencyChipEl.textContent = 'Pinging...';
    } else if (status === 'error') {
        pillElement.className = 'telemetry-pill error';
        if (statusTextEl) statusTextEl.textContent = 'Connection Delayed';
        if (latencyChipEl) latencyChipEl.textContent = 'Timeout';
    }
}

function triggerFinalStatus(isSuccess) {
    const overlay = document.getElementById('status-overlay');
    const statusLottie = document.getElementById('status-lottie');
    const statusText = document.getElementById('status-text');
    
    let redirectText = document.getElementById('redirect-text');
    if (!redirectText && isSuccess) {
        redirectText = document.createElement('p');
        redirectText.id = 'redirect-text';
        redirectText.style.cssText = "color: var(--silver); font-size: 0.9em; margin-top: 10px;";
        statusText.after(redirectText);
    }
    
    if (isSuccess) {
        if (statusLottie) statusLottie.setAttribute('src', '/assets/animations/success.json');
        if (statusText) {
            statusText.innerHTML = "Connection Established!";
            statusText.style.color = "var(--green)";
        }
        if (redirectText) redirectText.innerHTML = DESTINATION_PATH ? `Redirecting to ${DESTINATION_PATH}...` : "Redirecting to Home...";
        
        overlay.classList.add('show');
        
        setTimeout(() => { 
            let targetUrl = MAIN_SITE_URL + '/';
            if (DESTINATION_PATH && DESTINATION_PATH.startsWith('/')) {
                targetUrl = MAIN_SITE_URL + DESTINATION_PATH;
            }
            window.location.href = targetUrl;
        }, 1600);
    } else {
        if (statusLottie) statusLottie.setAttribute('src', '/assets/animations/error.json');
        if (statusText) {
            statusText.innerHTML = "Server Timeout. Please proceed manually.";
            statusText.style.color = "var(--red)";
        }
        const fallbackBtn = document.getElementById('fallback-btn');
        if (fallbackBtn) {
            fallbackBtn.href = MAIN_SITE_URL + (DESTINATION_PATH || '/');
            fallbackBtn.style.display = 'inline-block';
        }
        overlay.classList.add('show');
    }
}

async function pingServer() {
    if (!isChecking || isRedirecting) return;
    pingAttemptCount++;

    const startPing = performance.now();
    let isReachable = false;
    let measuredLatency = 0;

    // Strategy 1: Fetch HEAD on /healthz
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        await fetch(`${MAIN_SITE_URL}/healthz?t=${Date.now()}`, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        measuredLatency = Math.round(performance.now() - startPing);
        isReachable = true;
    } catch (e) {
        // Strategy 2: Image probe on /favicon.png
        try {
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => reject(false);
                img.src = `${MAIN_SITE_URL}/favicon.png?t=${Date.now()}`;
            });
            measuredLatency = Math.round(performance.now() - startPing);
            isReachable = true;
        } catch (imgErr) {
            isReachable = false;
        }
    }

    if (isReachable) {
        if (isRedirecting) return;
        isChecking = false;
        isRedirecting = true;
        clearInterval(pingInterval);

        updateTelemetryUI('online', measuredLatency, 'Handshake Verified');
        setTimeout(() => triggerFinalStatus(true), 600);
    } else {
        if (pingAttemptCount > 2) {
            updateTelemetryUI('waking');
        }
    }
}

const pingInterval = setInterval(pingServer, 2000);
setTimeout(() => {
    if (!isRedirecting) {
        isChecking = false;
        clearInterval(pingInterval);
        updateTelemetryUI('error');
        triggerFinalStatus(false);
    }
}, 120000);

pingServer();

// -------------------------------------------------------------
// 4. SHARED ENTITY BANNER SETUP
// -------------------------------------------------------------
function setupSharedEntityBanner() {
    const banner = document.getElementById('shared-entity-banner');
    const titleEl = document.getElementById('shared-banner-title');
    const descEl = document.getElementById('shared-banner-desc');
    if (!banner || !titleEl || !descEl) return;

    if (SHARED_USER) {
        banner.style.display = 'inline-flex';
        titleEl.textContent = `Shared Profile: @${SHARED_USER}`;
        descEl.textContent = `Verifying credentials and loading verified card...`;
    } else if (SHARED_MOD) {
        banner.style.display = 'inline-flex';
        titleEl.textContent = `Shared Mod: ${SHARED_MOD}`;
        descEl.textContent = `Preparing download package on GPL Mods...`;
    }
}

// -------------------------------------------------------------
// 5. GPL BEATS MUSIC PLAYER (100% SYNCED WITH SITE)
// -------------------------------------------------------------
function initializeMusicPlayer() {
    const playerContainer = document.getElementById('floating-music-player');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const audioPlayer = document.getElementById('background-audio'); 
    const playPauseBtn = document.getElementById('music-play-pause-btn'); 
    const playPauseIcon = document.getElementById('play-pause-icon');
    const prevBtn = document.getElementById('music-prev-btn'); 
    const nextBtn = document.getElementById('music-next-btn'); 
    const loopBtn = document.getElementById('music-loop-btn');
    const loopIcon = document.getElementById('music-loop-icon');
    const trackNameDisplay = document.getElementById('music-track-name'); 
    const volumeSlider = document.getElementById('music-volume-slider');
    const closeBtn = document.getElementById('music-close-btn');
    
    const timeline = document.getElementById('music-timeline');
    const currentTimeDisplay = document.getElementById('music-current-time');
    const durationDisplay = document.getElementById('music-duration');
    let ytProgressInterval;

    const customYtInput = document.getElementById('custom-yt-url');
    const loadYtBtn = document.getElementById('load-yt-btn');
    const ytStatusMsg = document.getElementById('yt-status-msg');

    if (!audioPlayer || !playPauseBtn || !trackNameDisplay) return;

    // Toggle slide-out
    if (toggleBtn && playerContainer) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playerContainer.classList.toggle('open');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playerContainer.classList.remove('open');
            });
        }

        playerContainer.addEventListener('click', (e) => e.stopPropagation());

        document.addEventListener('click', (e) => {
            if (playerContainer.classList.contains('open') && !playerContainer.contains(e.target)) {
                playerContainer.classList.remove('open');
            }
        });
    }

    // 10 Official Default Tracks (Exact match with main site)
    const playlist = [
        { title: 'You are Good Enough', src: '/assets/audio/bgm-0.mp3' },
        { title: 'Whoopty', src: '/assets/audio/bgm-1.mp3' },
        { title: 'Nekozilla', src: '/assets/audio/bgm-2.mp3' },
        { title: 'Heroes Tonight', src: '/assets/audio/bgm-3.mp3' },
        { title: 'Dreams', src: '/assets/audio/bgm-4.mp3' },
        { title: 'Royalty', src: '/assets/audio/bgm-5.mp3' },
        { title: 'Mortals', src: '/assets/audio/bgm-6.mp3' },
        { title: 'On & On', src: '/assets/audio/bgm-7.mp3' },
        { title: 'Rise Up', src: '/assets/audio/bgm-8.mp3' },
        { title: 'Keep Up', src: '/assets/audio/bgm-9.mp3' }        
    ];
    
    let currentSource = localStorage.getItem('musicSource') || 'local';
    let trackIndex = parseInt(localStorage.getItem('musicTrackIndex')) || 0;
    if (trackIndex >= playlist.length || trackIndex < 0) trackIndex = 0;
    
    let isSingleTrackLoop = localStorage.getItem('musicLoopMode') === 'single';
    let ytVideoId = localStorage.getItem('customYtId') || null;
    let ytPlayer = null;
    let isYtReady = false;

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // YouTube Iframe API initialization
    window.onYouTubeIframeAPIReady = function() {
        ytPlayer = new YT.Player('yt-player-container', {
            height: '0', width: '0',
            videoId: ytVideoId || '',
            playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'fs': 0, 'playsinline': 1, 'loop': 1, 'playlist': ytVideoId || '' },
            events: {
                'onReady': () => {
                    isYtReady = true;
                    setGlobalVolume(volumeSlider ? volumeSlider.value : (localStorage.getItem('musicVolume') || 0.25));
                    if (currentSource === 'youtube' && localStorage.getItem('musicState') === 'playing') {
                        ytPlayer.playVideo();
                    }
                },
                'onStateChange': (event) => {
                    if (event.data === 0) {
                        if (isSingleTrackLoop && ytPlayer && typeof ytPlayer.playVideo === 'function') {
                            ytPlayer.seekTo(0, true);
                            ytPlayer.playVideo();
                        } else if (nextBtn) {
                            nextBtn.click();
                        }
                    }
                    if (event.data === 1 && currentSource === 'youtube') {
                        const videoData = (ytPlayer && typeof ytPlayer.getVideoData === 'function') ? ytPlayer.getVideoData() : null;
                        if (videoData && videoData.title) trackNameDisplay.textContent = "YT: " + videoData.title;
                        startYtProgress();
                    } else {
                        stopYtProgress();
                    }
                }
            }
        });
    };

    function updatePlayIcon(isPlaying) {
        if (!playPauseIcon) return;
        playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        playPauseBtn.title = isPlaying ? "Pause Music" : "Play Music";
        if (toggleBtn) toggleBtn.classList.toggle('playing', isPlaying);
    }

    function updateLoopUI() {
        if (!loopBtn) return;
        if (isSingleTrackLoop) {
            loopBtn.classList.add('active');
            loopBtn.title = "Single Track Loop: ON (Auto Next Off)";
        } else {
            loopBtn.classList.remove('active');
            loopBtn.title = "Single Track Loop: OFF (Auto Next Enabled)";
        }
        audioPlayer.loop = isSingleTrackLoop;
    }
    updateLoopUI();

    if (loopBtn) {
        loopBtn.addEventListener('click', () => {
            isSingleTrackLoop = !isSingleTrackLoop;
            localStorage.setItem('musicLoopMode', isSingleTrackLoop ? 'single' : 'all');
            updateLoopUI();
        });
    }

    function loadLocalTrack(index) {
        currentSource = 'local';
        localStorage.setItem('musicSource', 'local');
        localStorage.setItem('musicTrackIndex', index);
        
        if (isYtReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
        stopYtProgress();
        
        const track = playlist[index];
        if (!track) return;
        audioPlayer.src = track.src;
        audioPlayer.loop = isSingleTrackLoop;
        trackNameDisplay.textContent = `(${index + 1}/${playlist.length}) ${track.title}`;
        setGlobalVolume(volumeSlider ? volumeSlider.value : (localStorage.getItem('musicVolume') || 0.25));
    }

    function playMusic() {
        localStorage.setItem('musicState', 'playing');
        if (currentSource === 'local') {
            audioPlayer.play().then(() => updatePlayIcon(true)).catch(e => pauseMusic());
        } else if (currentSource === 'youtube' && isYtReady && ytVideoId) {
            if (ytPlayer && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
            updatePlayIcon(true);
            trackNameDisplay.textContent = "Loading YT Track...";
        }
    }

    function pauseMusic() {
        localStorage.setItem('musicState', 'paused');
        updatePlayIcon(false);
        audioPlayer.pause();
        if (isYtReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
    }

    function setGlobalVolume(val) {
        val = parseFloat(val);
        if (isNaN(val)) val = 0.25;
        audioPlayer.volume = val;
        if (isYtReady && ytPlayer && typeof ytPlayer.setVolume === 'function') ytPlayer.setVolume(val * 100); 
        localStorage.setItem('musicVolume', val);
    }

    audioPlayer.addEventListener('loadedmetadata', () => {
        if (currentSource === 'local') {
            if (timeline) timeline.max = audioPlayer.duration;
            if (durationDisplay) durationDisplay.textContent = formatTime(audioPlayer.duration);
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (currentSource === 'local') {
            if (timeline) timeline.value = audioPlayer.currentTime;
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            if (!audioPlayer.paused) localStorage.setItem('musicCurrentTime', audioPlayer.currentTime);
        }
    });

    function startYtProgress() {
        stopYtProgress();
        ytProgressInterval = setInterval(() => {
            if (ytPlayer && ytPlayer.getPlayerState() === 1) {
                const curr = ytPlayer.getCurrentTime();
                const dur = ytPlayer.getDuration();
                if (timeline) {
                    timeline.max = dur;
                    timeline.value = curr;
                }
                if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(curr);
                if (durationDisplay) durationDisplay.textContent = formatTime(dur);
                localStorage.setItem('musicCurrentTime', curr);
            }
        }, 1000);
    }
    
    function stopYtProgress() { clearInterval(ytProgressInterval); }

    if (timeline) {
        timeline.addEventListener('input', (e) => {
            const seekTo = parseFloat(e.target.value);
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(seekTo);
            if (currentSource === 'local') {
                audioPlayer.currentTime = seekTo;
            } else if (currentSource === 'youtube' && isYtReady && ytPlayer && typeof ytPlayer.seekTo === 'function') {
                ytPlayer.seekTo(seekTo, true);
            }
        });
    }

    playPauseBtn.addEventListener('click', () => {
        const isPlaying = (currentSource === 'local' && !audioPlayer.paused) || 
                          (currentSource === 'youtube' && isYtReady && ytPlayer && typeof ytPlayer.getPlayerState === 'function' && ytPlayer.getPlayerState() === 1);
        if (isPlaying) pauseMusic();
        else playMusic();
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            trackIndex = (trackIndex + 1) % playlist.length;
            loadLocalTrack(trackIndex);
            playMusic();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            trackIndex = (trackIndex - 1 + playlist.length) % playlist.length;
            loadLocalTrack(trackIndex);
            playMusic();
        });
    }

    audioPlayer.addEventListener('ended', () => {
        if (isSingleTrackLoop) {
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(() => {});
        } else if (nextBtn) {
            nextBtn.click();
        }
    });
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => setGlobalVolume(e.target.value));
    }

    // Custom YouTube Loader Handler
    if (customYtInput && loadYtBtn) {
        loadYtBtn.addEventListener('click', () => {
            const url = customYtInput.value.trim();
            if (!url) return;
            const match = url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/|music\.youtube\.com\/watch\?v=)([^&?]+)/);
            if (match && match[1]) {
                ytVideoId = match[1];
                currentSource = 'youtube';
                localStorage.setItem('musicSource', 'youtube');
                localStorage.setItem('customYtId', ytVideoId);
                audioPlayer.pause();
                if (isYtReady && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
                    ytPlayer.loadVideoById({ videoId: ytVideoId });
                    playMusic();
                }
                trackNameDisplay.textContent = "YouTube Track";
                if (ytStatusMsg) {
                    ytStatusMsg.style.display = 'block';
                    setTimeout(() => ytStatusMsg.style.display = 'none', 3000);
                }
            }
        });
    }

    // Handle Local Initial State Tracking Sync
    if (currentSource === 'local') {
        loadLocalTrack(trackIndex);
        const savedTime = localStorage.getItem('musicCurrentTime');
        if (savedTime && localStorage.getItem('musicState') === 'playing') {
            audioPlayer.currentTime = parseFloat(savedTime);
        }
    } else {
        trackNameDisplay.textContent = "Loading YT Track...";
    }

    if (localStorage.getItem('musicState') === 'playing') {
        if (currentSource === 'local') {
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.then(() => updatePlayIcon(true)).catch(() => {
                    updatePlayIcon(false);
                    localStorage.setItem('musicState', 'paused');
                });
            }
        }
    } else {
        updatePlayIcon(false);
    }
}

// -------------------------------------------------------------
// 6. DYNAMIC FOREGROUND CONTENT SLIDESHOW
// -------------------------------------------------------------
const getCurrencyStr = () => {
    try {
        if (activeCountry.name.includes('India')) return "0₹ (Free)";
        const formatter = new Intl.NumberFormat(navigator.language || 'en-US', { style: 'currency', currency: 'USD' });
        return formatter.format(0) + " (Free)";
    } catch (e) {
        return "$0 (Free)";
    }
};

const contentData = [
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><path d="M12 8v4l3 3" stroke="#E0E0E0"/></svg>`,
        texts: [
            `${activeCountry.greeting} GPL Mods... Establishing a secure connection to the network...`,
            `Connecting you to the GPL Mods Network. Please hold on...`,
            `Initiating secure handshake with GPL Servers...`
        ],
        lottie: "/assets/animations/welcome.json", 
        mediaType: "none"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "GPL Mods is always free for everyone because it is a community-driven platform...",
            "Thanks for supporting the project. Your visits keep us going. Welcome to GPL Mods...",
            "We couldn't do this without you. Thank you for being part of the community..."
        ],
        lottie: "/assets/animations/community.json", 
        mediaType: "model",
        media: "/assets/images/team.glb" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="#E0E0E0"/></svg>`,
        texts: [
            `Want a professional, ad-free mobile editor? Kinemaster Pro Edition is unlocked for ${getCurrencyStr()}...`,
            `Edit like a pro without watermarks. Watch Kinemaster Pro showcase in 4K 60FPS...`,
            `Stop paying subscriptions. Get ad-free editing suites like Kinemaster directly on GPL Mods...`
        ],
        lottie: "/assets/animations/editing.json",
        mediaType: "video",
        media: "/assets/images/kinemaster.mp4",
        videoTag: "KINEMASTER 4K (60FPS)",
        satelliteLeft: "/assets/images/kinemaster1.png",
        satelliteRight: "/assets/images/kinemaster2.png"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6" stroke="#FFD700"/><polyline points="8 6 2 12 8 18" stroke="#E0E0E0"/></svg>`,
        texts: [
            "100% open-source and transparent. Explore our backend source code safely via GitHub.",
            "We publish what we build so you can verify every release yourself.",
            "Open code means trust. GPL Mods is built on openness, not secrecy."
        ],
        lottie: "/assets/animations/opensource.json", 
        mediaType: "model",
        media: "/assets/images/code.glb" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="#FFD700"/><line x1="2" y1="12" x2="22" y2="12" stroke="#E0E0E0"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            `GPL Mods is for Everyone, Because ${activeCountry.name} Loves Every Nation ${activeCountry.flag}...`,
            `Worldwide connectivity without borders. Welcoming creators from all corners of the globe...`,
            `Fast, reliable downloads mirrored worldwide for high speed access.`
        ],
        lottie: "/assets/animations/globe.json", 
        mediaType: "none"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="#E0E0E0"/></svg>`,
        texts: [
            "Experience high-framerate mobile video editing tools with unlocked premium filters...",
            "Export in full resolution without limits. Explore curated creator utilities...",
            "Handcrafted modifications tested for maximum stability and speed."
        ],
        lottie: "/assets/animations/editing.json",
        mediaType: "video",
        media: "/assets/images/editing1.mp4",
        videoTag: "MOBILE EDITOR 60FPS",
        satelliteLeft: "/assets/images/default-app-icon.png",
        satelliteRight: "/assets/images/kinemaster1.png"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="2 4 5 15 12 20 19 15 22 4 16 8 12 2 8 8 2 4" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "Tired of viewing ads? Don't worry, GPL+ is here. No ads, full premium experience...",
            "Upgrade to GPL Mods+ for lightning-fast downloads and a completely ad-free interface...",
            "Want the ultimate experience? GPL Mods+ gives you zero ads and maximum speed..."
        ],
        lottie: "/assets/animations/crown.json", 
        mediaType: "none"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#FFD700"/><polyline points="16 7 22 7 22 13" stroke="#FFD700"/></svg>`,
        texts: [
            "Are you a modder? Apply for a Distributor role and monetize your personal download links safely.",
            "Take control of your own traffic and earn through shared GPL Downloads.",
            "Distributor partnerships are open for trusted creators with verified uploads."
        ],
        lottie: "/assets/animations/graph.json", 
        mediaType: "model",
        media: "/assets/images/distributer.glb"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "Thanks for supporting the project. This is the true power of community...",
            "Every click and share helps us keep GPL Mods running for everyone.",
            "Your trust is what powers this open platform. Thank you."
        ],
        lottie: "/assets/animations/thanks.json", 
        mediaType: "none"
    }
];

let slideIndex = 0;
const textElement = document.getElementById('dynamic-text');
const svgElement = document.getElementById('dynamic-svg');
const lottieElement = document.getElementById('dynamic-lottie');

const imgElement = document.getElementById('dynamic-image');
const modelElement = document.getElementById('dynamic-model');
const videoElement = document.getElementById('dynamic-video'); 
const frameWrapper = document.getElementById('frame-wrapper');
const dynamicFrame = document.getElementById('dynamic-frame');
const msgWrapper = document.getElementById('message-wrapper');
const videoTagEl = document.getElementById('frame-video-tag');
const videoTagTextEl = document.getElementById('frame-video-tag-text');

const satelliteLeft = document.getElementById('satellite-left');
const satelliteRight = document.getElementById('satellite-right');
const satLeftImg = document.getElementById('satellite-left-img');
const satRightImg = document.getElementById('satellite-right-img');

const frameClasses = ['frame-style-1', 'frame-style-2'];

function updateSlide() {
    if (msgWrapper) msgWrapper.style.opacity = '0';
    if (frameWrapper) frameWrapper.classList.remove('show');
    
    // Hide satellite badges
    if (satelliteLeft) satelliteLeft.style.display = 'none';
    if (satelliteRight) satelliteRight.style.display = 'none';
    if (videoTagEl) videoTagEl.style.display = 'none';

    // Hide all media types cleanly
    if (imgElement) { imgElement.style.display = 'none'; imgElement.src = ''; }
    if (modelElement) { modelElement.style.display = 'none'; }
    if (videoElement) {
        videoElement.style.display = 'none';
        videoElement.pause();
        videoElement.src = '';
    }

    setTimeout(() => {
        const data = contentData[slideIndex];
        
        const randomText = data.texts[Math.floor(Math.random() * data.texts.length)];
        if (textElement) textElement.innerHTML = randomText;
        if (svgElement) svgElement.innerHTML = data.svg;
        
        if (lottieElement) {
            lottieElement.setAttribute('src', data.lottie);
            if (typeof lottieElement.load === 'function') lottieElement.load(data.lottie);
        }
        
        let hasMedia = false;

        // Video Showcase
        if (data.mediaType === 'video' && data.media && videoElement) {
            videoElement.src = data.media;
            videoElement.style.display = 'block';
            videoElement.muted = true;
            videoElement.loop = true;
            videoElement.play().catch(() => {});
            
            if (videoTagEl && videoTagTextEl) {
                videoTagTextEl.textContent = data.videoTag || 'VIDEO SHOWCASE';
                videoTagEl.style.display = 'inline-flex';
            }

            // Satellite icons around video frame
            if (data.satelliteLeft && satLeftImg && satelliteLeft) {
                satLeftImg.src = data.satelliteLeft;
                satelliteLeft.style.display = 'flex';
            }
            if (data.satelliteRight && satRightImg && satelliteRight) {
                satRightImg.src = data.satelliteRight;
                satelliteRight.style.display = 'flex';
            }

            hasMedia = true;
        } 
        // 3D Model Viewer
        else if (data.mediaType === 'model' && data.media && modelElement) {
            modelElement.src = data.media;
            modelElement.style.display = 'block';
            hasMedia = true;
        }
        // Image Fallback
        else if (data.mediaType === 'image' && data.media && imgElement) {
            imgElement.src = data.media;
            imgElement.style.display = 'block';
            hasMedia = true;
        }

        if (hasMedia && dynamicFrame && frameWrapper) {
            dynamicFrame.className = `animated-frame ${frameClasses[Math.floor(Math.random() * frameClasses.length)]}`;
            frameWrapper.classList.add('show');
        }

        if (msgWrapper) msgWrapper.style.opacity = '1';
        slideIndex = (slideIndex + 1) % contentData.length;
    }, 450); 
}

// -------------------------------------------------------------
// 7. BACKGROUND MONTAGE ENGINE (REPLACED STATIC EMOJIS WITH ICONS)
// -------------------------------------------------------------
const montageLayer = document.getElementById('montage-layer');

const specificMods = [
    { name: "Roblox Delta", cert: "Certified", tag: "Android", v: "v2.604", view: "3.2M", src: "roblox.jpg", class: "tag-android" },
    { name: "Kinemaster Pro", cert: "Certified", tag: "Android", v: "v7.3", view: "1.1M", src: "kinemaster.jpg", class: "tag-android" },
    { name: "Elementor Pro", cert: "Comm. Tested", tag: "WordPress", v: "v3.15", view: "850K", src: "elementor.jpg", class: "tag-wordpress" },
    { name: "Astra Theme", cert: "Certified", tag: "WordPress", v: "v2.23", view: "420K", src: "astra.jpg", class: "tag-wordpress" },
    { name: "Fortnite Mobile", cert: "Certified", tag: "iOS Jailed", v: "v29.10", view: "2.1M", src: "fortnite.jpg", class: "tag-ios" },
    { name: "Minecraft Pocket", cert: "Certified", tag: "iOS Jailed", v: "v1.20", view: "5.4M", src: "minecraft.jpg", class: "tag-ios" },
    { name: "Schedule I", cert: "Comm. Tested", tag: "Windows", v: "v1.0.4", view: "105K", src: "schedule1.jpg", class: "tag-windows" },
    { name: "I Am Fish", cert: "Certified", tag: "Windows", v: "v2.1", view: "67K", src: "iamfish.jpg", class: "tag-windows" }
];

const reviewerNames = ['Admin', 'JohnDoe_xX', 'GPL_Fan_99', 'Modder_Elite', 'ShadowByte', 'SpeedRunner'];
const reviewTexts = [
    'Absolutely fantastic! Unlocked everything cleanly.',
    'Works flawlessly and zero malware detected.',
    'Saved me a lot of money on creative subscriptions.',
    'A mandatory installation for any power user.',
    'Smooth performance and verified signatures.'
];

function generateStarRatingHtml() {
    return `<div class="star-rating">
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
    </div>`;
}

function spawnGhostElement() {
    if (!montageLayer) return;

    const el = document.createElement('div');
    el.className = 'ghost-element';

    const isModCard = Math.random() < 0.7;

    if (isModCard) {
        const mod = specificMods[Math.floor(Math.random() * specificMods.length)];
        const isTested = mod.cert === 'Comm. Tested';
        el.innerHTML = `
            <div class="mod-card">
                <span class="badge-certified ${isTested ? 'tested' : ''}">
                    <i class="fas ${isTested ? 'fa-shield-halved' : 'fa-certificate'}"></i> ${mod.cert}
                </span>
                <span class="mod-type-tag">${mod.v}</span>
                <div class="mod-card-image">
                    <img src="/assets/images/${mod.src}" alt="${mod.name}" onerror="this.src='/assets/images/default-avatar.png'">
                </div>
                <div class="mod-card-content">
                    <h3>${mod.name}</h3>
                    ${generateStarRatingHtml()}
                    <div class="card-footer">
                        <span class="platform-tag ${mod.class}">${mod.tag}</span>
                        <div class="view-count" style="display:flex; align-items:center; gap:4px; font-size:0.8em; color:var(--silver);">
                            <i class="fas fa-eye" style="font-size:0.85em;"></i> ${mod.view}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        const rName = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
        const rText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        el.innerHTML = `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="avatar-wrapper">
                        <img src="/assets/images/default-avatar.png" alt="Avatar">
                    </div>
                    <span class="comment-author">${rName}</span>
                </div>
                ${generateStarRatingHtml()}
                <p class="comment-body">"${rText}"</p>
            </div>
        `;
    }

    const fromTopLeft = Math.random() > 0.5;
    const scale = (Math.random() * 0.35 + 0.65).toFixed(2); 

    if (fromTopLeft) {
        el.style.left = (Math.random() * -20) + 'vw';
        el.style.top = (Math.random() * 80) + 'vh';
        el.style.animation = `cascadeDownRight ${(Math.random() * 5 + 9).toFixed(1)}s linear forwards`;
        el.style.zIndex = Math.floor(Math.random() * 5);
    } else {
        el.style.left = (Math.random() * 20 + 80) + 'vw';
        el.style.top = (Math.random() * 80) + 'vh';
        el.style.animation = `cascadeUpLeft ${(Math.random() * 5 + 9).toFixed(1)}s linear forwards`;
        el.style.zIndex = Math.floor(Math.random() * 5) - 6;
    }
    
    const innerDiv = el.querySelector('div');
    if (innerDiv) innerDiv.style.transform = `scale(${scale})`;

    montageLayer.appendChild(el);
    setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 16000);
}

// -------------------------------------------------------------
// 8. BOOTSTRAP INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    setupRegionUI();
    setupSharedEntityBanner();
    initializeMusicPlayer();
    
    updateSlide();
    setInterval(updateSlide, 6500); 
    setInterval(spawnGhostElement, 600);
});