const tracks = Array.from(document.querySelectorAll('.track'));
const audio = document.getElementById('audio');

const playerTitle = document.getElementById('playerTitle');
const playerSub = document.getElementById('playerSub');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const speedBtn = document.getElementById('speedBtn');

let currentIndex = -1;
let isPlaying = false;
let speedIndex = 0;
const speeds = [1.0, 1.25, 1.5];

/* Format time */
function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2,'0')}`;
}

/* Highlight playing track */
function setActiveTrack(index) {
    tracks.forEach((t, i) => t.classList.toggle("active", i === index));
}

/* Load audio */
function loadTrack(index) {
    const track = tracks[index];
    if (!track) return;

    audio.src = track.dataset.src;
    playerTitle.textContent = track.querySelector('.track-title').textContent;
    playerSub.textContent = track.querySelector('.track-desc').textContent;

    currentIndex = index;
    setActiveTrack(index);

    audio.load();
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = "⏸";
}

/* Click track to play */
tracks.forEach((track, index) => {
    track.addEventListener("click", () => {
        if (currentIndex === index && isPlaying) {
            audio.pause();
        } else {
            loadTrack(index);
        }
    });
});

/* Play/Pause Button */
playPauseBtn.addEventListener("click", () => {
    if (!audio.src) return loadTrack(0);

    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
});

/* Update buttons */
audio.addEventListener("play", () => {
    isPlaying = true;
    playPauseBtn.textContent = "⏸";
});

audio.addEventListener("pause", () => {
    isPlaying = false;
    playPauseBtn.textContent = "▶";
});

/* Next/Prev */
prevBtn.addEventListener("click", () => {
    loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
});

nextBtn.addEventListener("click", () => {
    loadTrack((currentIndex + 1) % tracks.length);
});

/* Progress bar */
audio.addEventListener("timeupdate", () => {
    const { currentTime, duration } = audio;
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent  = formatTime(duration);

    if (duration) {
        progress.value = (currentTime / duration) * 100;
    }
});

progress.addEventListener("input", () => {
    audio.currentTime = audio.duration * (progress.value / 100);
});

/* Playback speed */
speedBtn.addEventListener("click", () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate = speeds[speedIndex];
    speedBtn.textContent = speeds[speedIndex] + "x";
});
/*adding function 12-11-2025 v2*/
function loadTrack(index) {
    const track = tracks[index];
    if (!track) return;

    const src = track.dataset.src;
    const title = track.querySelector('.track-title').textContent;
    const desc = track.querySelector('.track-desc').textContent;
    const sutraId = track.dataset.sutraId;

    // 更新经文
    updateSutra(sutraId, title);

    // 设置音频源
    audio.src = src;
    currentIndex = index;
    playerTitle.textContent = title;
    playerSub.textContent = desc;
    setActiveTrack(index);

    // ★★ 重点：这里设置 Media Session ★★
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: '静听经声',
            album: '佛经诵读',
            artwork: [
                { src: 'https://via.placeholder.com/256', sizes: '256x256', type: 'image/png' }
            ]
        });

        // 可选：让锁屏上的按钮能控制播放
        navigator.mediaSession.setActionHandler('play', () => audio.play());
        navigator.mediaSession.setActionHandler('pause', () => audio.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (currentIndex <= 0) loadTrack(tracks.length - 1);
            else loadTrack(currentIndex - 1);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (currentIndex >= tracks.length - 1 || currentIndex === -1) loadTrack(0);
            else loadTrack(currentIndex + 1);
        });
    }

    // 开始播放
    audio.load();
    audio.play()
        .then(() => {
            isPlaying = true;
            playPauseBtn.textContent = '⏸';
            console.log('🔊 play started, mediaSession set');
        })
        .catch(err => {
            console.log('play 被拦截或失败：', err);
            isPlaying = false;
            playPauseBtn.textContent = '▶';
        });
}
