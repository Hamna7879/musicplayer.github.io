
const songs = [
  {
    title: "Sanu ek pal chain",
    artist: "Chill Artist",
    file: "./songs/song1.mp3",
    duration: "3:30",
    playlist: "Chill Vibes",
    color: "#6366f1"
  },
  {
    title: "Soch na sake",
    artist: "Synth Artist",
    file: "./songs/song2.mp3",
    duration: "4:41",
    playlist: "Night Drive",
    color: "#db2777"
  },
  {
    title: "Tere liye",
    artist: "Indie Artist",
    file: "./songs/song3.mp3",
    duration: "5:35",
    playlist: "Daily Mix",
    color: "#f59e0b"
  },
  {
    title: "Tera Fitoor",
    artist: "Relax Artist",
    file: "./songs/song4.mp3",
    duration: "5:10",
    playlist: "Chill Vibes",
    color: "#0891b2"
  }
];

const playlists = [
  {
    name: "Chill Vibes",
    emoji: "./images/chill.png ",
    color: "#4f46e5"
  },
  {
    name: "Night Drive",
    emoji: "./images/night.png",
    color: "#be185d"
  },
  {
    name: "Daily Mix",
    emoji: "./images/daily.png",
    color: "#b45309"
  },
  {
    name: "Uploaded Songs",
    emoji: "./images/upload.png",
    color: "#15803d"
  }
];

// HTML elements
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const songList = document.getElementById("songList");
const playlistGrid = document.getElementById("playlistGrid");
const playlistMenu = document.getElementById("playlistMenu");
const searchInput = document.getElementById("searchInput");
const musicUpload = document.getElementById("musicUpload");
const uploadStatus = document.getElementById("uploadStatus");

let currentIndex = 0;
let activePlaylist = "All Songs";
let shuffle = false;
let repeat = false;
let hasSelectedSong = false;

const uploadedUrls = new Set();

// CREATE PLAYLIST CARDS
function renderPlaylists() {
  playlistGrid.innerHTML = "";
  playlistMenu.innerHTML = "";

  playlists.forEach(playlist => {
    const card = document.createElement("div");
    card.className = "playlist-card";

    const cover = document.createElement("div");
    cover.className = "playlist-cover";
    cover.style.background = playlist.color;
    cover.innerHTML = `<img src="${playlist.emoji}" alt="${playlist.name}" style="width: 100%; height: 100%; object-fit: cover;">`;

    const name = document.createElement("h3");
    name.textContent = playlist.name;

    const description = document.createElement("p");
    description.textContent = "Your favorite music";

    card.append(cover, name, description);

    card.addEventListener("click", () => {
      selectPlaylist(playlist.name);
    });

    playlistGrid.appendChild(card);

    const button = document.createElement("button");
    button.textContent = "♫ " + playlist.name;

    button.classList.toggle(
      "active",
      activePlaylist === playlist.name
    );

    button.addEventListener("click", () => {
      selectPlaylist(playlist.name);
    });

    playlistMenu.appendChild(button);
  });
}

// SELECT PLAYLIST
function selectPlaylist(name) {
  activePlaylist = name;
  searchInput.value = "";

  document.getElementById("pageTitle").textContent = name;
  document.getElementById("songHeading").textContent =
    name === "All Songs" ? "All Songs" : "Playlist Songs";

  renderPlaylists();
  renderSongs();
}

// DISPLAY SONGS
function renderSongs() {
  songList.innerHTML = "";

  const query = searchInput.value.toLowerCase().trim();

  const filtered = songs
    .map((song, index) => ({ ...song, index }))
    .filter(song => {
      const matchesPlaylist =
        activePlaylist === "All Songs" ||
        song.playlist === activePlaylist;

      const matchesSearch =
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query);

      return matchesPlaylist && matchesSearch;
    });

  filtered.forEach((song, position) => {
    const row = document.createElement("div");
    row.className = "song-row";

    if (song.uploaded) {
      row.classList.add("uploaded");
    }

    if (hasSelectedSong && song.index === currentIndex) {
      row.classList.add("active");
    }

    const number = document.createElement("span");
    number.textContent = position + 1;

    const details = document.createElement("div");

    const songName = document.createElement("div");
    songName.className = "song-name";
    songName.textContent = song.title;

    const artist = document.createElement("p");
    artist.textContent = song.artist;

    details.append(songName, artist);

    const artistColumn = document.createElement("span");
    artistColumn.className = "artist-column";
    artistColumn.textContent = song.playlist;

    const duration = document.createElement("span");
    duration.textContent = song.duration;

    row.append(number, details, artistColumn, duration);

    row.addEventListener("click", () => {
      loadSong(song.index);
      playSong();
    });

    songList.appendChild(row);
  });

  if (filtered.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No songs found.";
    songList.appendChild(message);
  }
}

// LOAD SONG
function loadSong(index) {
  currentIndex = index;
  hasSelectedSong = true;

  const song = songs[currentIndex];

  audio.src = song.file;

  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("artistName").textContent = song.artist;
  document.getElementById("cover").style.background = song.color;

  progress.value = 0;

  document.getElementById("currentTime").textContent = "0:00";
  document.getElementById("duration").textContent = "0:00";

  renderSongs();
}

// PLAY SONG
async function playSong() {
  if (!hasSelectedSong) {
    loadSong(currentIndex);
  }

  try {
    await audio.play();
    playBtn.textContent = "⏸";
  } catch (error) {
    console.error("Unable to play:", error);
    playBtn.textContent = "▶";
  }
}

// PAUSE SONG
function pauseSong() {
  audio.pause();
  playBtn.textContent = "▶";
}

// PLAY / PAUSE BUTTON
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

// GET PLAYLIST QUEUE
function getQueue() {
  const queue = songs
    .map((song, index) => ({ ...song, index }))
    .filter(song =>
      activePlaylist === "All Songs" ||
      song.playlist === activePlaylist
    )
    .map(song => song.index);

  return queue.length ? queue : songs.map((_, i) => i);
}

// NEXT SONG
function nextSong() {
  const queue = getQueue();

  if (shuffle && queue.length > 1) {
    const choices = queue.filter(i => i !== currentIndex);
    currentIndex = choices[
      Math.floor(Math.random() * choices.length)
    ];
  } else {
    const position = queue.indexOf(currentIndex);

    currentIndex = queue[
      (position + 1 + queue.length) % queue.length
    ];
  }

  loadSong(currentIndex);
  playSong();
}

// PREVIOUS SONG
function previousSong() {
  const queue = getQueue();
  const position = queue.indexOf(currentIndex);

  currentIndex = queue[
    (position - 1 + queue.length) % queue.length
  ];

  loadSong(currentIndex);
  playSong();
}

nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", previousSong);

// SHUFFLE
shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
});

// REPEAT
repeatBtn.addEventListener("click", () => {
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
});

// FORMAT TIME
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

// UPDATE PROGRESS
audio.addEventListener("timeupdate", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progress.value =
      (audio.currentTime / audio.duration) * 100;
  }

  document.getElementById("currentTime").textContent =
    formatTime(audio.currentTime);
});

// GET AUDIO DURATION
audio.addEventListener("loadedmetadata", () => {
  document.getElementById("duration").textContent =
    formatTime(audio.duration);
});

// SEEK SONG
progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime =
      (progress.value / 100) * audio.duration;
  }
});

// VOLUME
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
});

// AUTO NEXT
audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

// SYNC BUTTONS
audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
});

audio.addEventListener("play", () => {
  playBtn.textContent = "⏸";
});

// SEARCH
searchInput.addEventListener("input", renderSongs);

// NAVIGATION
document.getElementById("homeBtn").addEventListener("click", () => {
  selectPlaylist("All Songs");
});

document.getElementById("libraryBtn").addEventListener("click", () => {
  selectPlaylist("All Songs");
});

document.getElementById("searchBtn").addEventListener("click", () => {
  searchInput.focus();
});

// UPLOAD MP3 FILES
musicUpload.addEventListener("change", event => {
  const files = Array.from(event.target.files);
  let uploadedCount = 0;

  files.forEach(file => {
    const isMp3 =
      file.type === "audio/mpeg" ||
      file.name.toLowerCase().endsWith(".mp3");

    if (!isMp3) {
      console.warn("Skipped non-MP3 file:", file.name);
      return;
    }

    const audioUrl = URL.createObjectURL(file);
    uploadedUrls.add(audioUrl);

    const songName = file.name.replace(/\.mp3$/i, "");

    const newSong = {
      title: songName,
      artist: "Local Music",
      file: audioUrl,
      duration: "—",
      playlist: "Uploaded Songs",
      color: "#1ed760",
      uploaded: true
    };

    songs.push(newSong);
    uploadedCount++;
  });

  if (uploadedCount > 0) {
    selectPlaylist("Uploaded Songs");

    uploadStatus.textContent =
      `${uploadedCount} song(s) uploaded successfully!`;
  } else {
    uploadStatus.textContent = "Please select MP3 files.";
  }

  musicUpload.value = "";
});

// RELEASE TEMPORARY AUDIO URLS
window.addEventListener("pagehide", () => {
  uploadedUrls.forEach(url => {
    URL.revokeObjectURL(url);
  });
});

// INITIALIZE PLAYER
renderPlaylists();
renderSongs();

/* ===========================
   MOBILE HAMBURGER MENU
=========================== */

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const menuOverlay = document.getElementById("menuOverlay");

if (menuToggle && sidebar && menuOverlay) {

  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");

    menuOverlay.classList.toggle("active", isOpen);

    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking outside
  menuOverlay.addEventListener("click", closeMenu);

  // Close menu after selecting a navigation item
  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("nav button, #playlistMenu button")) {
      closeMenu();
    }
  });

  // Close menu using Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

} else {
  console.error("Hamburger menu HTML elements are missing.");
}

function closeMenu() {
  if (!menuToggle || !sidebar || !menuOverlay) return;

  sidebar.classList.remove("open");
  menuOverlay.classList.remove("active");

  menuToggle.textContent = "☰";
  menuToggle.setAttribute("aria-expanded", "false");
}
