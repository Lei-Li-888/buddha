/*********** 1. 经文文本（可以以后继续加） ***********/
const sutras = {
  heart: `观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。
舍利子，色不异空，空不异色；色即是空，空即是色；受想行识，亦复如是。
舍利子，是诸法空相，不生不灭，不垢不净，不增不减。
是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法；
无眼界，乃至无意识界；无无明，亦无无明尽，乃至无老死，亦无老死尽。
无苦集灭道，无智亦无得，以无所得故。
菩提萨埵，依般若波罗蜜多故，心无挂碍；无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。
三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。
故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，能除一切苦，真实不虚。
故说般若波罗蜜多咒，即说咒曰：
揭谛，揭谛，波罗揭谛，
波罗僧揭谛，菩提萨婆诃。`
};

/*********** 2. 取 DOM 元素 ***********/
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

// 经文面板
const sutraTitleEl = document.getElementById('sutraTitle');
const sutraTextEl = document.getElementById('sutraText');

/*********** 3. 播放状态变量 ***********/
let currentIndex = -1;
let isPlaying = false;
let speedIndex = 0;
const speeds = [1.0, 1.25, 1.5];

/*********** 4. 小工具函数 ***********/
function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function setActiveTrack(index) {
  tracks.forEach((t, i) => t.classList.toggle("active", i === index));
}

function updateSutra(sutraId, title) {
  // 如果页面上没放经文区域，就直接返回，避免报错
  if (!sutraTitleEl || !sutraTextEl) return;

  if (sutraId && sutras[sutraId]) {
    sutraTitleEl.textContent = title;
    sutraTextEl.textContent = sutras[sutraId];
  } else {
    sutraTitleEl.textContent = '暂无经文';
    sutraTextEl.textContent = '这条音频暂时没有对应的经文文本。';
  }
}

/*********** 5. 核心：加载并播放一首 track（唯一的 loadTrack） ***********/
function loadTrack(index) {
  const track = tracks[index];
  if (!track) return;

  const src = track.dataset.src;
  const title = track.querySelector('.track-title').textContent;
  const desc = track.querySelector('.track-desc').textContent;
  const sutraId = track.dataset.sutraId;

  // 更新经文
  updateSutra(sutraId, title);

  // 更新播放器显示 & 音频源
  audio.src = src;
  currentIndex = index;
  playerTitle.textContent = title;
  playerSub.textContent = desc;
  setActiveTrack(index);

  // 设置 Media Session（锁屏信息）
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: '静听经声',
      album: '佛经诵读',
      artwork: [
        { src: 'https://via.placeholder.com/256', sizes: '256x256', type: 'image/png' }
      ]
    });

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

/*********** 6. 列表点击：点卡片就播放 / 暂停 ***********/
tracks.forEach((track, index) => {
  track.addEventListener("click", () => {
    if (currentIndex === index && isPlaying) {
      audio.pause();
    } else {
      loadTrack(index);
    }
  });
});

/*********** 7. 播放 / 暂停按钮 ***********/
playPauseBtn.addEventListener("click", () => {
  if (!audio.src) {
    // 还没选过，就默认播放第一首
    loadTrack(0);
    return;
  }
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play().catch(err => console.log('play 失败：', err));
  }
});

audio.addEventListener("play", () => {
  isPlaying = true;
  playPauseBtn.textContent = "⏸";
});

audio.addEventListener("pause", () => {
  isPlaying = false;
  playPauseBtn.textContent = "▶";
});

/*********** 8. 上一首 / 下一首 ***********/
prevBtn.addEventListener("click", () => {
  if (!tracks.length) return;
  const nextIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
  loadTrack(nextIndex);
});

nextBtn.addEventListener("click", () => {
  if (!tracks.length) return;
  const nextIndex = currentIndex >= tracks.length - 1 || currentIndex === -1
    ? 0
    : currentIndex + 1;
  loadTrack(nextIndex);
});

audio.addEventListener("ended", () => {
  if (!tracks.length) return;
  const nextIndex = currentIndex >= tracks.length - 1 ? 0 : currentIndex + 1;
  loadTrack(nextIndex);
});

/*********** 9. 进度条 & 时间 ***********/
audio.addEventListener("timeupdate", () => {
  const { currentTime, duration } = audio;
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);

  if (duration && !isNaN(duration)) {
    progress.value = (currentTime / duration) * 100;
  }
});

progress.addEventListener("input", () => {
  if (audio.duration && !isNaN(audio.duration)) {
    audio.currentTime = audio.duration * (progress.value / 100);
  }
});

/*********** 10. 倍速播放 ***********/
speedBtn.addEventListener("click", () => {
  speedIndex = (speedIndex + 1) % speeds.length;
  audio.playbackRate = speeds[speedIndex];
  speedBtn.textContent = speeds[speedIndex] + "x";
});
