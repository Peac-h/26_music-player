import { playlist } from "./playlist.js";

// Selectors
// card main
const cardEl = document.getElementById("card");
const frontCardEl = document.getElementById("frontCard");
const backCardEl = document.getElementById("backCard");
// track info
const trackEl = document.getElementById("track");
const imageEl = document.getElementById("img");
const titleEl = document.getElementById("currTrackTitle");
const artistEl = document.getElementById("currTrackArtist");
// controls
const controlsEl = document.getElementById("controls");
const repeatBtnEl = document.getElementById("repeatBtn");
const shuffleBtnEl = document.getElementById("shuffleBtn");
// duration
const progressBar = document.getElementById("progressBar");
const progressArea = document.getElementById("progressArea");
// pages
const nextPageBtn = document.getElementById("nextPage");
const prevPageBtn = document.getElementById("prevPage");
// back side
const playlistEl = document.getElementById("playlist");
const allBackTrackEls = document.querySelectorAll(".track");
const allBackPauseEls = document.querySelectorAll(".btn-pause--back");
const allBackPlayEls = document.querySelectorAll(".card--back__play");
// lines
const lines = document.querySelectorAll(".line");

// Architecture
class App {
  isPlaying = false;

  curr_track_index = 0;

  constructor() {
    window.addEventListener("load", this._loadTrack.bind(this));
    cardEl.addEventListener("click", this._handleLines.bind(this));
    trackEl.addEventListener("timeupdate", this._updateTime.bind(this));
    controlsEl.addEventListener("click", this._handleControls.bind(this));
    progressArea.addEventListener("click", this._handleDuration.bind(this));

    trackEl.addEventListener("ended", () => this._changeTrack("next"));

    [nextPageBtn, prevPageBtn].forEach((el) =>
      el.addEventListener("click", this._showAnotherPage.bind(this))
    );

    allBackTrackEls.forEach((track) =>
      track.addEventListener("click", this._handleBackClick.bind(this))
    );

    allBackPauseEls.forEach((pause) =>
      pause.addEventListener("click", this._backPause.bind(this))
    );

    allBackPlayEls.forEach((play) =>
      play.addEventListener("click", this._backPlay.bind(this))
    );
  }

  _loadTrack(_, trackIndex = this.curr_track_index) {
    trackEl.src = playlist[trackIndex].source;

    this._renderTrackInfo(trackIndex);
  }

  _renderTrackInfo(trackIndex) {
    titleEl.textContent = playlist[trackIndex].track;

    artistEl.textContent = playlist[trackIndex].artist;

    allBackTrackEls.forEach((el, i) => {
      const markup = `${playlist[i].track} <span>${playlist[i].artist}</span>`;

      el.innerHTML = markup;
    });
  }

  _handleControls(e) {
    const id = e.target.closest("button")?.id;

    if (id === "btnPlay") this._playTrack();
    if (id === "btnPause") this._pauseTrack();

    if (id === "prevTrackBtn") this._changeTrack("prev");
    if (id === "nextTrackBtn") this._changeTrack("next");

    if (id === "shuffleBtn") this._handleState(e.target, "shuffle");
    if (id === "repeatBtn") this._handleState(e.target, "repeat");
  }

  _playTrack() {
    trackEl.play();

    this.isPlaying = true;

    this._renderBackPause(); // this

    this._handlePlayPause();
  }

  _pauseTrack() {
    trackEl.pause();

    this.isPlaying = false;

    this._handlePlayPause();

    this._hideAllBackPauses(); // this
  }

  _handlePlayPause() {
    if (this.isPlaying) {
      btnPlay.classList.add("hide");
      btnPause.classList.remove("hide");
    } else {
      btnPlay.classList.remove("hide");
      btnPause.classList.add("hide");
    }
  }

  _handleDuration(e) {
    let width = progressArea.clientWidth;
    let offsetX = e.offsetX;
    let duration = trackEl.duration;

    trackEl.currentTime = (offsetX / width) * duration;

    this._playTrack();

    this.isPlaying = true;
  }

  _updateTime(e) {
    let currTime = e.target.currentTime;
    let duration = e.target.duration;
    let width = (currTime / duration) * 100;

    progressBar.style.width = `${width}%`;
  }

  _handleState(target, type) {
    const button = target.closest("button");

    if (button.dataset[type] === "off") {
      button.dataset[type] = "on";
      button.classList.add("button--state-active");
    } else {
      button.dataset[type] = "off";
      button.classList.remove("button--state-active");
    }
  }

  _changeTrack(direction) {
    if (repeatBtnEl.dataset.repeat === "on") {
      this._loadTrack(this.curr_track_index);
      this._playTrack();
      return;
    }

    if (shuffleBtnEl.dataset.shuffle === "on") {
      let randomIndex = Math.floor(Math.random() * playlist.length);
      this.curr_track_index = randomIndex;
      this._loadTrack(this.curr_track_index);
      this._playTrack();
      return;
    }

    if (direction === "prev") {
      this.curr_track_index--;
      if (this.curr_track_index < 0) {
        this.curr_track_index = playlist.length - 1;
      }
    } else if (direction === "next") {
      this.curr_track_index++;
      if (this.curr_track_index > playlist.length - 1) {
        this.curr_track_index = 0;
      }
    }

    this._loadTrack(this.curr_track_index);
    this._playTrack();
  }

  _handleLines() {
    this.isPlaying
      ? lines.forEach((line) => line.classList.add("playing"))
      : lines.forEach((line) => line.classList.remove("playing"));
  }

  _showAnotherPage() {
    backCardEl.classList.toggle("show");

    frontCardEl.classList.toggle("hide");
  }

  _renderBackPause() {
    this._hideAllBackPauses();

    const play = playlistEl
      .querySelector(`[data-index='${this.curr_track_index}']`)
      .querySelector(".card--back__play");

    const pause = playlistEl
      .querySelector(`[data-index='${this.curr_track_index}']`)
      .querySelector(".btn-pause--back");

    play.classList.add("hide");

    pause.classList.remove("hide");
  }

  _hideAllBackPauses() {
    allBackPauseEls.forEach((el) => {
      el.classList.add("hide");
    });

    allBackPlayEls.forEach((el) => {
      el.classList.remove("hide");
    });
  }

  _handleBackClick(e) {
    this.curr_track_index = e.target.closest("li").dataset.index;

    this._loadTrack(this.curr_track_index);

    this._playTrack();

    this._showAnotherPage();
  }

  _backPlay(e) {
    this._showAnotherPage();

    const index = e.target.closest("li").dataset.index;

    if (index == this.curr_track_index) {
      this._playTrack();
      return;
    }

    this.curr_track_index = index;

    this._loadTrack(this.curr_track_index);

    this._playTrack();
  }

  _backPause() {
    this._pauseTrack();

    allBackPauseEls.forEach((el) => {
      el.classList.add("hide");
    });

    allBackPlayEls.forEach((el) => {
      el.classList.remove("hide");
    });
  }
}

const app = new App();
