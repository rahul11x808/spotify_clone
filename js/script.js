console.log("Spotify Clone");

// ========== GLOBAL STATE ==========
let currentLang = "bangla";
let songs = [];
let songIndex = 0;

let audioElement = new Audio();
let masterPlay = document.getElementById("masterPlay");
let ProgressBar = document.getElementById("ProgressBar");
let masterSongName = document.getElementById("masterSongName");
let gif = document.getElementById("gif");
let songItems = Array.from(document.getElementsByClassName("songitem"));

// ========== LOAD SONGS FROM JSON ==========
// ========== LOAD SONGS FROM GLOBAL JS ==========
function loadSongs() {
  if (!window.songsData) {
    console.error("Window.songsData is missing!");
    return;
  }

  // Flatten nested data for home page usage
  let banglaSongs = [];
  if (window.songsData.bangla) {
    Object.values(window.songsData.bangla).forEach(artistSongs => {
      banglaSongs = [...banglaSongs, ...artistSongs];
    });
  }

  let hindiSongs = [];
  if (window.songsData.hindi) {
    Object.values(window.songsData.hindi).forEach(artistSongs => {
      hindiSongs = [...hindiSongs, ...artistSongs];
    });
  }

  songs = [...banglaSongs, ...hindiSongs];

  songIndex = 0;
  loadUI();
}


// ========== UI LOAD ==========
function loadUI() {
  // We only have 72 slots in HTML (based on previous view), but we might have fewer or matching songs.
  // Reset all first
  songItems.forEach(el => el.style.display = 'none');

  songItems.forEach((el, i) => {
    if (!songs[i]) return;
    el.style.display = 'block'; // Show if song exists

    // Use coverPath from JSON
    let img = el.querySelector("img");
    if (img) img.src = songs[i].coverPath;

    let name = el.querySelector(".songName");
    if (name) name.innerText = songs[i].songName;
  });
}

// ========== PLAY SONG ==========
function playSong(i) {
  if (!songs[i]) return;
  songIndex = i;

  // Use filePath from JSON
  audioElement.src = songs[i].filePath;
  masterSongName.innerText = songs[i].songName;

  audioElement.currentTime = 0;
  audioElement.play();

  masterPlay.classList.replace("fa-play-circle", "fa-pause-circle");
  gif.style.opacity = 1;
}

function makeAllPlays() {
  document.querySelectorAll('.songItemPlay').forEach(el => {
    el.classList.replace('fa-pause-circle', 'fa-play-circle');
  });
}

// ========== MASTER PLAY ==========
masterPlay.addEventListener("click", () => {
  if (audioElement.paused || audioElement.currentTime <= 0) {
    audioElement.play();
    masterPlay.classList.replace("fa-play-circle", "fa-pause-circle");
    gif.style.opacity = 1;
  } else {
    audioElement.pause();
    masterPlay.classList.replace("fa-pause-circle", "fa-play-circle");
    gif.style.opacity = 0;
  }
});

// ========== PROGRESS ==========
audioElement.addEventListener("timeupdate", () => {
  // Update progress bar
  let progress = (audioElement.currentTime / audioElement.duration) * 100 || 0;
  ProgressBar.value = progress;

  // Format Time Function (MM:SS)
  const formatTime = (time) => {
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
  };

  // Update Timers
  let currTime = document.getElementById('currTime');
  let durTime = document.getElementById('durTime');

  if (currTime) currTime.innerText = formatTime(audioElement.currentTime);
  if (durTime && !isNaN(audioElement.duration)) durTime.innerText = formatTime(audioElement.duration);
});

ProgressBar.addEventListener("change", () => {
  audioElement.currentTime = ProgressBar.value * audioElement.duration / 100;
});

// ========== SONG CLICK ==========
document.querySelectorAll(".songItemPlay").forEach((el, index) => { // Use index from forEach to ensure correct mapping
  el.id = index; // Ensure IDs match index
  el.addEventListener("click", e => {
    playSong(parseInt(e.target.id));
  });
});

// Allow clicking the image to play too
songItems.forEach((el, index) => {
  let img = el.querySelector("img");
  if (img) {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
      playSong(index);
      makeAllPlays();
      // Manually update the icon for this item since playSong doesn't find it by ID if not passed
      // Actually makeAllPlays resets all. playSong updates master play.
      // We need to update the specific icon to pause state:
      let icon = el.querySelector(".songItemPlay");
      if (icon) icon.classList.replace('fa-play-circle', 'fa-pause-circle');
    });
  }
});

// ========== NEXT / PREV ==========
document.getElementById("next").onclick = () => {
  let nextIndex = (songIndex + 1) % songs.length;
  playSong(nextIndex);
}

document.getElementById("previous").onclick = () => {
  let prevIndex = (songIndex - 1 + songs.length) % songs.length;
  playSong(prevIndex);
}

// ===================================================
// ================= PLAYLIST =========================
// ===================================================

let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

function addToPlaylist(index) {
  if (!playlist.includes(index)) {
    playlist.push(index);
    localStorage.setItem("playlist", JSON.stringify(playlist));
  }
}

function playPlaylist(index) {
  playSong(playlist[index]);
}

// ===================================================
// ========== INITIAL LOAD ==========
loadSongs();
