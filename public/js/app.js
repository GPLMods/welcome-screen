// Ensure this is your actual LIVE MAIN NODE APP URL
const MAIN_SITE_URL = 'https://gplmods.webredirect.org';

// -------------------------------------------------------------
// PING LOGIC (With Success & Error Overlay Restored!)
// -------------------------------------------------------------
let isChecking = true;
let isRedirecting = false; 

function triggerFinalStatus(isSuccess) {
    const overlay = document.getElementById('status-overlay');
    const statusLottie = document.getElementById('status-lottie');
    const statusText = document.getElementById('status-text');
    
    // We didn't explicitly have redirect-text in the recent HTML, so we create/find it safely
    let redirectText = document.getElementById('redirect-text');
    if (!redirectText && isSuccess) {
        redirectText = document.createElement('p');
        redirectText.id = 'redirect-text';
        redirectText.style.cssText = "color: var(--silver); font-size: 0.9em; margin-top: 10px;";
        statusText.after(redirectText);
    }
    
    overlay.classList.add('show');
    
    if (isSuccess) {
        // ✅ RESTORED: Play Success Animation
        statusLottie.setAttribute('src', '/assets/animations/success.json');
        
        statusText.innerHTML = "Connection Established!";
        statusText.style.color = "var(--green)";
        if(redirectText) redirectText.innerHTML = "Redirecting securely...";
        
        setTimeout(() => { 
            const urlParams = new URLSearchParams(window.location.search);
            const destinationPath = urlParams.get('dest');
            
            if (destinationPath && destinationPath.startsWith('/')) {
                window.location.href = MAIN_SITE_URL + destinationPath;
            } else {
                window.location.href = MAIN_SITE_URL + '/'; 
            }
        }, 1800); // 1.8 second delay to let them admire the "Success" checkmark!
        
    } else {
        // ✅ RESTORED: Play Error Animation
        statusLottie.setAttribute('src', '/assets/animations/error.json');
        
        statusText.innerHTML = "Server Timeout. Please proceed manually.";
        statusText.style.color = "var(--red)";
        document.getElementById('fallback-btn').style.display = 'inline-block';
    }
}

function pingServer() {
    if (!isChecking || isRedirecting) return;

    const img = new Image();
    
    img.onload = function() {
        if (isRedirecting) return;
        isChecking = false;
        isRedirecting = true; // Lock it down
        
        // Trigger the visual success state instead of an instant invisible redirect
        triggerFinalStatus(true);

        const urlParams = new URLSearchParams(window.location.search);
        const dest = urlParams.get('dest');
        
        // Short delay purely for aesthetic purposes so they see at least 1 slide
        setTimeout(() => {
            if (dest && dest.startsWith('/')) {
                window.location.href = MAIN_SITE_URL + dest;
            } else {
                window.location.href = MAIN_SITE_URL + '/';
            }
        }, 800);
    };
    
    img.onerror = function() {
        // Log silently, keep playing animations
    };
    
    img.src = MAIN_SITE_URL + '/favicon.png?cachebuster=' + new Date().getTime();
}

const pingInterval = setInterval(pingServer, 2000);

// Timeout Fail-safe (If server doesn't respond in 2 minutes)
setTimeout(() => {
    if (!isRedirecting) {
        isChecking = false;
        clearInterval(pingInterval);
        triggerFinalStatus(false);
    }
}, 120000); 

pingServer(); 

// =========================================================================
// MUSIC PLAYER ENGINE (Shared state with the backend site)
// =========================================================================

// Crucial: You MUST map your background tracks from this root URL 
// because this standalone site is not natively connected to /public/audio/ 
// like your NodeJS backend. For production this is excellent as it shares memory!

function initializeMusicPlayer() {
    const playerContainer = document.getElementById('floating-music-player');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const audioPlayer = document.getElementById('background-audio'); 
    const playPauseBtn = document.getElementById('music-play-pause-btn'); 
    const playPauseIcon = document.getElementById('play-pause-icon');
    const prevBtn = document.getElementById('music-prev-btn'); 
    const nextBtn = document.getElementById('music-next-btn'); 
    const trackNameDisplay = document.getElementById('music-track-name'); 
    const volumeSlider = document.getElementById('music-volume-slider');
    
    // Timeline
    const timeline = document.getElementById('music-timeline');
    const currentTimeDisplay = document.getElementById('music-current-time');
    const durationDisplay = document.getElementById('music-duration');
    let ytProgressInterval;

    if (!audioPlayer || !playPauseBtn || !trackNameDisplay) return;

    if (toggleBtn && playerContainer) {
        toggleBtn.addEventListener('click', () => playerContainer.classList.toggle('open'));
    }

     const playlist =[
        { title: 'Welcome', src: '/assets/audio/bgm-0.mp3' },
        { title: 'Whoopty', src: '/assets/audio/bgm-1.mp3' },
        { title: 'Nekozilla', src: '/assets/audio/bgm-2.mp3' },
        { title: 'Heroes Tonight', src: '/assets/audio/bgm-3.mp3' },
        { title: 'Dreams', src: '/assets/audio/bgm-4.mp3' },
        { title: 'Royalty', src: '/assets/audio/bgm-5.mp3' },
        { title: 'Mortals', src: '/assets/audio/bgm-6.mp3' },
        { title: 'On & On', src: '/assets/audio/bgm-7.mp3' }
    ];
    
    let currentSource = localStorage.getItem('musicSource') || 'local';
    let trackIndex = parseInt(localStorage.getItem('musicTrackIndex')) || 0;
    if (trackIndex >= playlist.length || trackIndex < 0) trackIndex = 0;
    
    let ytVideoId = localStorage.getItem('customYtId') || null;
    let ytPlayer = null;
    let isYtReady = false;

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // YouTube Initialization
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function() {
        ytPlayer = new YT.Player('yt-player-container', {
            height: '0', width: '0',
            videoId: ytVideoId || '', 
            playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'fs': 0, 'playsinline': 1, 'loop': 1, 'playlist': ytVideoId || '' },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(event) {
        isYtReady = true;
        setGlobalVolume(volumeSlider.value); 
        if (currentSource === 'youtube' && localStorage.getItem('musicState') === 'playing') {
            ytPlayer.playVideo();
        }
    }

    function onPlayerStateChange(event) {
        if (event.data === 0) ytPlayer.playVideo();
        if (event.data === 1 && currentSource === 'youtube') {
            const videoData = ytPlayer.getVideoData();
            if (videoData && videoData.title) trackNameDisplay.textContent = "YT: " + videoData.title;
            startYtProgress();
        } else {
            stopYtProgress();
        }
    }

    function updatePlayIcon(isPlaying) {
        if (!playPauseIcon) return;
        playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        playPauseBtn.title = isPlaying ? "Pause Music" : "Play Music";
    }

    function loadLocalTrack(index) {
        currentSource = 'local';
        localStorage.setItem('musicSource', 'local');
        localStorage.setItem('musicTrackIndex', index);
        
        if (isYtReady) ytPlayer.pauseVideo();
        stopYtProgress();
        
        const track = playlist[index];
        audioPlayer.src = track.src;
        trackNameDisplay.textContent = track.title;
        setGlobalVolume(volumeSlider.value);
    }

    function playMusic() {
        localStorage.setItem('musicState', 'playing');
        if (currentSource === 'local') {
            audioPlayer.play().then(() => updatePlayIcon(true)).catch(e => pauseMusic());
        } else if (currentSource === 'youtube' && isYtReady && ytVideoId) {
            ytPlayer.playVideo();
            updatePlayIcon(true);
            trackNameDisplay.textContent = "Loading YT Track...";
        }
    }

    function pauseMusic() {
        localStorage.setItem('musicState', 'paused');
        updatePlayIcon(false);
        audioPlayer.pause();
        if (isYtReady) ytPlayer.pauseVideo();
    }

    function setGlobalVolume(val) {
        audioPlayer.volume = val;
        if (isYtReady) ytPlayer.setVolume(val * 100); 
        localStorage.setItem('musicVolume', val);
    }

    audioPlayer.addEventListener('loadedmetadata', () => {
        if (currentSource === 'local') {
            timeline.max = audioPlayer.duration;
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (currentSource === 'local') {
            timeline.value = audioPlayer.currentTime;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            if (!audioPlayer.paused) localStorage.setItem('musicCurrentTime', audioPlayer.currentTime);
        }
    });

    function startYtProgress() {
        stopYtProgress();
        ytProgressInterval = setInterval(() => {
            if (ytPlayer && ytPlayer.getPlayerState() === 1) {
                const curr = ytPlayer.getCurrentTime();
                const dur = ytPlayer.getDuration();
                timeline.max = dur;
                timeline.value = curr;
                currentTimeDisplay.textContent = formatTime(curr);
                durationDisplay.textContent = formatTime(dur);
                localStorage.setItem('musicCurrentTime', curr);
            }
        }, 1000);
    }
    
    function stopYtProgress() { clearInterval(ytProgressInterval); }

    if (timeline) {
        timeline.addEventListener('input', (e) => {
            const seekTo = parseFloat(e.target.value);
            currentTimeDisplay.textContent = formatTime(seekTo);
            if (currentSource === 'local') {
                audioPlayer.currentTime = seekTo;
            } else if (currentSource === 'youtube' && isYtReady) {
                ytPlayer.seekTo(seekTo, true);
            }
        });
    }

    playPauseBtn.addEventListener('click', () => {
        const isPlaying = (currentSource === 'local' && !audioPlayer.paused) || 
                          (currentSource === 'youtube' && isYtReady && ytPlayer.getPlayerState() === 1);
        if (isPlaying) pauseMusic();
        else playMusic();
    });

    nextBtn.addEventListener('click', () => {
        trackIndex = (trackIndex + 1) % playlist.length;
        loadLocalTrack(trackIndex);
        playMusic();
    });

    prevBtn.addEventListener('click', () => {
        trackIndex = (trackIndex - 1 + playlist.length) % playlist.length;
        loadLocalTrack(trackIndex);
        playMusic();
    });

    audioPlayer.addEventListener('ended', () => nextBtn.click());
    
    volumeSlider.addEventListener('input', (e) => setGlobalVolume(e.target.value));

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

// Automatically bind music load when the full page executes correctly
document.addEventListener('DOMContentLoaded', initializeMusicPlayer);
// -------------------------------------------------------------
// DYNAMIC FOREGROUND CONTENT SLIDESHOW
// -------------------------------------------------------------

// HELPER FOR CURRENCY
const userLang = navigator.language || 'en-US';
const getCurrencyStr = () => {
    try {
        const formatter = new Intl.NumberFormat(userLang, { style: 'currency', currency: 'USD' });
        if(userLang.includes('IN') || userLang.includes('hi')) return "0₹ (Free)";
        return formatter.format(0) + " (Free)";
    } catch (e) {
        return "$0 (Free)";
    }
};
const getGreeting = () => {
    if(userLang.includes('es')) return "Bienvenido a";
    if(userLang.includes('hi')) return "GPL Mods में आपका स्वागत है";
    if(userLang.includes('fr')) return "Bienvenue sur";
    return "Welcome to";
};

// -------------------------------------------------------------
// DYNAMIC FOREGROUND CONTENT SLIDESHOW
// -------------------------------------------------------------
const contentData = [
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><path d="M12 8v4l3 3" stroke="#E0E0E0"/></svg>`,
        texts: [
            `${getGreeting()} GPL Mods... Establishing a secure connection to the network...`,
            `Connecting you to the GPL Mods Network. Please hold on...`,
            `Initiating secure handshake with GPL Servers...`
        ],
        lottie: "/assets/animations/welcome.json", 
        media: "" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "GPL Mods is always free for everyone because it is a community-driven platform...",
            "Thanks for supporting the project. Your visits keep us going. Welcome to GPL Mods...",
            "We couldn't do this without you. Thank you for being part of the community..."
        ],
        lottie: "/assets/animations/community.json", 
        media: "/assets/images/team.glb" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#E0E0E0"/></svg>`,
        texts: [
            "GPL Mods is not a person, it is an ideal. Don't look for a CEO...",
            "Our mission is simple: safe access, no subscriptions, no paywalls.",
            "This is community code for the community. Open, honest, and free."
        ],
        lottie: "/assets/animations/identity.json", 
        media: "" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#FFD700"/><circle cx="12" cy="7" r="4" fill="rgba(255,215,0,0.1)" stroke="#E0E0E0"/></svg>`,
        texts: [
            "Maintained passionately by a single developer, ensuring quality and security...",
            "Every update is hand-tested and deployed with care, no bots, no spam.",
            "Community-first support with fast response and honest software delivery."
        ],
        lottie: "/assets/animations/star.json", 
        media: "" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6" stroke="#FFD700"/><polyline points="8 6 2 12 8 18" stroke="#E0E0E0"/></svg>`,
        texts: [
            "100% open-source and transparent. Explore our backend source code safely via GitHub.",
            "We publish what we build so you can verify every release yourself.",
            "Open code means trust. GPL Mods is built on openness, not secrecy."
        ],
        lottie: "/assets/animations/opensource.json", 
        media: "/assets/images/code.glb" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="#FFD700"/><line x1="2" y1="12" x2="22" y2="12" stroke="#E0E0E0"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "GPL Mods is for Everyone, Because India Loves Every Nation...",
            "Connections without borders. This platform welcomes all users.",
            "Every download is shared globally with a simple, accessible interface."
        ],
        lottie: "/assets/animations/globe.json", 
        media: "" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" ry="2" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><line x1="6" y1="12" x2="10" y2="12" stroke="#E0E0E0"/><line x1="8" y1="10" x2="8" y2="14" stroke="#E0E0E0"/><line x1="15" y1="13" x2="15.01" y2="13" stroke="#E0E0E0" stroke-width="3"/><line x1="18" y1="11" x2="18.01" y2="11" stroke="#E0E0E0" stroke-width="3"/></svg>`,
        texts: [
            "Want to prank your friend in Roblox? Try Delta, the ultimate Roblox mod...",
            "Dominate your favorite experiences with the power of Delta for Roblox...",
            "Enhance your gameplay. Discover powerful scripts and mods like Delta..."
        ],
        lottie: "/assets/animations/gaming.json", 
        media: [
            "/assets/images/roblox1.png", 
            "/assets/images/roblox2.png", 
            "/assets/images/roblox3.png"
        ]
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="#E0E0E0"/></svg>`,
        texts: [
            `Want a professional, ad-free mobile editor? Try Kinemaster Pro Edition for exactly ${getCurrencyStr()}...`,
            `Edit like a pro without the watermark. Download Kinemaster Premium for exactly ${getCurrencyStr()}...`,
            `Stop paying subscriptions. Get ad-free editing tools like Kinemaster entirely for ${getCurrencyStr()}...`
        ],
        lottie: "/assets/animations/editing.json", 
        media: [
            "/assets/images/kinemaster1.png", 
            "/assets/images/kinemaster2.png",
            "/assets/images/kinemaster.mp4"
        ]
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" stroke="#E0E0E0"/><path d="M12 18V6" stroke="#E0E0E0"/></svg>`,
        texts: [
            `You think the starting budget of GPL Mods was high? No, it was exactly ${getCurrencyStr()}...`,
            `Every resource was invested in reliability and uptime, not flashy ads.`,
            `This project started lean, stayed clean, and remains free for everyone.`
        ],
        lottie: "/assets/animations/budget.json", 
        media: "" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="2 4 5 15 12 20 19 15 22 4 16 8 12 2 8 8 2 4" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "Tired of viewing ads? Don't worry, GPL+ is here. No ads, full premium experience...",
            "Upgrade to GPL Mods+ for lightning-fast downloads and a completely ad-free interface...",
            "Want the ultimate experience? GPL Mods+ gives you zero ads and maximum speed..."
        ],
        lottie: "/assets/animations/crown.json", 
        media: "" 
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#FFD700"/><polyline points="16 7 22 7 22 13" stroke="#FFD700"/></svg>`,
        texts: [
            "Are you a modder? Apply for a Distributor role and monetize your personal download links safely.",
            "Take control of your own traffic and earn through shared GPL Downloads.",
            "Distributor partnerships are open for trusted creators with verified uploads."
        ],
        lottie: "/assets/animations/graph.json", 
        media: "/assets/images/distributor.glb"
    },
    {
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(255,215,0,0.1)" stroke="#FFD700"/></svg>`,
        texts: [
            "Thanks for supporting the project. This is the true power of community...",
            "Every click and share helps us keep GPL Mods running for everyone.",
            "Your trust is what powers this open platform. Thank you."
        ],
        lottie: "/assets/animations/thanks.json", 
        media: "" 
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

const frameClasses = ['frame-style-1', 'frame-style-2'];

function updateSlide() {
    msgWrapper.style.opacity = '0';
    frameWrapper.classList.remove('show');
    
    // Hide all media types cleanly
    if(imgElement) { imgElement.style.display = 'none'; imgElement.src = ''; }
    if(modelElement) modelElement.style.display = 'none';
    if(videoElement) {
        videoElement.style.display = 'none';
        videoElement.pause();
        videoElement.src = '';
    }

    setTimeout(() => {
        const data = contentData[slideIndex];
        
        // ✅ PULL RANDOM TEXT FROM THE RESTORED ARRAY
        const randomText = data.texts[Math.floor(Math.random() * data.texts.length)];
        if(textElement) textElement.innerHTML = randomText;
        
        if(svgElement) svgElement.innerHTML = data.svg;
        
        if(lottieElement) {
            lottieElement.setAttribute('src', data.lottie);
            if (typeof lottieElement.load === 'function') {
                lottieElement.load(data.lottie);
            }
        }
        
        let selectedMedia = "";
        if (Array.isArray(data.media) && data.media.length > 0) {
            selectedMedia = data.media[Math.floor(Math.random() * data.media.length)];
        } else if (typeof data.media === 'string') {
            selectedMedia = data.media;
        }

        if (selectedMedia && selectedMedia.trim() !== "" && dynamicFrame) {
            
            const lowerMedia = selectedMedia.toLowerCase();
            
            if (lowerMedia.endsWith('.glb')) {
                if(modelElement) {
                    modelElement.src = selectedMedia;
                    modelElement.style.display = 'block'; 
                }
            } else if (lowerMedia.endsWith('.mp4') || lowerMedia.endsWith('.webm') || lowerMedia.endsWith('.mov')) {
                if(videoElement) {
                    videoElement.src = selectedMedia;
                    videoElement.style.display = 'block'; 
                    videoElement.load();
                    const playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn("Video auto-play was blocked.", error);
                            videoElement.muted = true;
                            videoElement.play().catch(e => console.error(e));
                        });
                    }
                }
            } else {
                if(imgElement) {
                    imgElement.src = selectedMedia;
                    imgElement.style.display = 'block';   
                }
            }
            
            dynamicFrame.className = `animated-frame ${frameClasses[Math.floor(Math.random() * frameClasses.length)]}`;
            frameWrapper.classList.add('show');
        }

        msgWrapper.style.opacity = '1';
        slideIndex = (slideIndex + 1) % contentData.length;
    }, 500); 
}

document.addEventListener('DOMContentLoaded', () => {
    updateSlide();
    setInterval(updateSlide, 6500); 
    
    // Start background immediately
    setInterval(spawnGhostElement, 500);
});

// -------------------------------------------------------------
// BACKGROUND "SEA OF CARDS" MONTAGE ENGINE
// -------------------------------------------------------------
const montageLayer = document.getElementById('montage-layer');

const specificMods = [
    { name: "Roblox", cert: "✔ Certified", tag: "Android", v: "v2.604", view: "3.2M", src: "roblox.jpg", class: "tag-android" },
    { name: "Kinemaster Pro", cert: "✔ Certified", tag: "Android", v: "v7.3", view: "1.1M", src: "kinemaster.jpg", class: "tag-android" },
    { name: "Elementor Pro", cert: "Comm. Tested", tag: "WordPress", v: "v3.15", view: "850K", src: "elementor.jpg", class: "tag-wordpress" },
    { name: "Astra", cert: "✔ Certified", tag: "WordPress", v: "v2.23", view: "420K", src: "astra.jpg", class: "tag-wordpress" },
    { name: "Fortnight", cert: "✔ Certified", tag: "iOS Jailed", v: "v29.10", view: "2.1M", src: "fortnite.jpg", class: "tag-ios" },
    { name: "Minecraft PE", cert: "✔ Certified", tag: "iOS Jailed", v: "v1.20", view: "5.4M", src: "minecraft.jpg", class: "tag-ios" },
    { name: "Schedule I", cert: "Comm. Tested", tag: "Windows", v: "v1.0.4", view: "105K", src: "schedule1.jpg", class: "tag-windows" },
    { name: "I Am Fish", cert: "✔ Certified", tag: "Windows", v: "v2.1", view: "67K", src: "iamfish.jpg", class: "tag-windows" }
];

const reviewerNames = ['Admin', 'JohnDoe_xX', 'GPL_Fan_99', 'Modder_Elite', 'ShadowByte', 'SpeedRunner'];
const reviewTexts = ['Absolutely fantastic!', 'Works flawlessly, virus-free.', 'Saved me a lot of money.', 'A mandatory installation.', 'Highly recommended!'];

function generateFakeRatingHtml() {
    const pct = ["80%", "90%", "100%"][Math.floor(Math.random() * 3)];
    return `<div class="rating" style="display:flex; align-items:center; gap:5px; margin-bottom:10px;">
                <div class="stars-outer" style="position:relative; display:inline-block; font-size:1em; letter-spacing:2px; color:#444;">
                    <div style="content:'★★★★★';">★★★★★</div>
                    <div class="stars-inner" style="position:absolute; top:0; left:0; white-space:nowrap; overflow:hidden; color:var(--gold); width: ${pct};">
                       ★★★★★
                    </div>
                </div>
            </div>`;
}

function spawnGhostElement() {
    if(!montageLayer) return;

    const el = document.createElement('div');
    el.className = 'ghost-element';

    const isModCard = Math.random() < 0.7;

    if (isModCard) {
        const mod = specificMods[Math.floor(Math.random() * specificMods.length)];
        el.innerHTML = `
            <div class="mod-card">
                <div class="app-feature-tag" ${mod.cert === 'Comm. Tested' ? 'style="background-color: var(--silver);"' : ''}>
                    ${mod.cert}
                </div>
                <div class="mod-type-tag">${mod.v}</div>
                <div class="mod-card-image">
                    <!-- Adjusted path to start with /assets -->
                    <img src="/assets/images/${mod.src}" alt="${mod.name}" onerror="this.src='/assets/images/default-avatar.png'">
                </div>
                <div class="mod-card-content">
                    <h3>${mod.name}</h3>
                    ${generateFakeRatingHtml()}
                    <div class="card-footer">
                        <span class="platform-tag ${mod.class}">${mod.tag}</span>
                        <div class="view-count" style="display:flex; align-items:center; gap:4px; font-size:0.85em; color:var(--silver);">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                               <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg> 
                            ${mod.view}
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
                        <!-- Adjusted path to start with /assets -->
                        <img src="/assets/images/default-avatar.png" alt="Avatar">
                    </div>
                    <span class="comment-author">${rName}</span>
                </div>
                ${generateFakeRatingHtml()}
                <p class="comment-body">"${rText}"</p>
            </div>
        `;
    }

    const fromTopLeft = Math.random() > 0.5;
    const scale = (Math.random() * 0.4 + 0.6).toFixed(2); 

    if (fromTopLeft) {
        el.style.left = (Math.random() * -20) + 'vw';
        el.style.top = (Math.random() * 80) + 'vh';
        el.style.animation = `cascadeDownRight ${(Math.random() * 6 + 8).toFixed(1)}s linear forwards`;
        el.style.zIndex = Math.floor(Math.random() * 5);
    } else {
        el.style.left = (Math.random() * 20 + 80) + 'vw';
        el.style.top = (Math.random() * 80) + 'vh';
        el.style.animation = `cascadeUpLeft ${(Math.random() * 6 + 8).toFixed(1)}s linear forwards`;
        el.style.zIndex = Math.floor(Math.random() * 5) - 6;
    }
    
    // Safety check before setting transform
    const innerDiv = el.querySelector('div');
    if(innerDiv) innerDiv.style.transform = `scale(${scale})`;

    montageLayer.appendChild(el);

    setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 15000);
}