let audio = new Audio();
let currentPlaylist = [];
let index = 0;

const masterPlay = document.getElementById("masterPlay");
const progressBar = document.getElementById("ProgressBar");
const gif = document.getElementById("gif");
const masterSongName = document.getElementById("masterSongName");

// ===== Load songs artist + language wise =====
function loadLibrary() {
    document.querySelectorAll(".lib-container").forEach(container => {
        const artist = container.dataset.artist;
        const lang = container.dataset.lang;

        const songs = window.songsData[lang]?.[artist];
        if (!songs) return;

        const items = container.querySelectorAll(".songitem");

        items.forEach((item, i) => {
            if (!songs[i]) {
                item.style.display = "none";
                return;
            }

            item.querySelector("img").src = songs[i].coverPath;
            item.querySelector(".songName").innerText = songs[i].songName;

            // ...
            item.querySelector("img").onclick = () => {
                playSong(songs, i);
            };

            item.querySelector(".songItemPlay").onclick = () => {
                playSong(songs, i);
            };
        });
    });
}

// ===== Play =====
function playSong(list, i) {
    currentPlaylist = list;
    index = i;

    audio.src = list[i].filePath;
    masterSongName.innerText = list[i].songName;
    audio.play();

    masterPlay.classList.replace("fa-play-circle", "fa-pause-circle");
    gif.style.opacity = 1;
}

// ===== Controls =====
masterPlay.onclick = () => {
    if (audio.paused) {
        audio.play();
        masterPlay.classList.replace("fa-play-circle", "fa-pause-circle");
        gif.style.opacity = 1;
    } else {
        audio.pause();
        masterPlay.classList.replace("fa-pause-circle", "fa-play-circle");
        gif.style.opacity = 0;
    }
};

document.getElementById("next").onclick = () => {
    index = (index + 1) % currentPlaylist.length;
    playSong(currentPlaylist, index);
};

document.getElementById("previous").onclick = () => {
    index = (index - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist, index);
};

// ===== Time & Progress =====
const currTime = document.getElementById("currTime");
const durTime = document.getElementById("durTime");

audio.ontimeupdate = () => {
    // Update Progress Bar
    const progress = (audio.currentTime / audio.duration) * 100 || 0;
    progressBar.value = progress;

    // Update Current Time Text
    const min = Math.floor(audio.currentTime / 60);
    const sec = Math.floor(audio.currentTime % 60);
    if (currTime) {
        currTime.innerText = `${min}:${sec < 10 ? "0" + sec : sec}`;
    }

    // Update Duration Text (if available)
    if (durTime && !isNaN(audio.duration)) {
        const minD = Math.floor(audio.duration / 60);
        const secD = Math.floor(audio.duration % 60);
        durTime.innerText = `${minD}:${secD < 10 ? "0" + secD : secD}`;
    }
};

progressBar.onchange = () => {
    audio.currentTime = (progressBar.value * audio.duration) / 100;
};

// ===== Init =====
loadLibrary();
