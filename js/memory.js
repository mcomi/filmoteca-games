let datos;
fetch("http://localhost:8080/api/images")
  .then((res) => res.json())
  .then((json) => {
    datos = json.data;
    generateCardsHtml(datos);
  });

function generateImageObjectUrl(imageData) {
  if (imageData !== null) {
    var arrayBufferView = new Uint8Array(imageData);
    var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    return imageUrl;
  } else {
    return "";
  }
}

// cards array holds all cards
var card;
var cards;

// deck of all cards in game
var deck = document.getElementById("card-deck");
function generateCardsHtml(arrImagenes) {
  const html = arrImagenes
    .map((item) => {
      return `<li class="card" type="${item.nombre_img.split(".")[0]}">
    <div class="content">
      <div class="front">
        <img src="${
          item.data !== null ? generateImageObjectUrl(item.data.data) : ""
        }" alt="" />
      </div>
      <div class="back">
        <img
          src="https://www.filmoteca.unam.mx/wp-content/uploads/2020/01/LogoFilmoteca-60-blanco-e1580510160631.png"
          alt=""
        />
      </div>
    </div>
  </li>
  <li class="card" type="${item.nombre_img.split(".")[0]}">
    <div class="content">
      <div class="front">
        <img src="${
          item.data !== null ? generateImageObjectUrl(item.data.data) : ""
        }" alt="" />
      </div>
      <div class="back">
        <img
          src="https://www.filmoteca.unam.mx/wp-content/uploads/2020/01/LogoFilmoteca-60-blanco-e1580510160631.png"
          alt=""
        />
      </div>
    </div>
  </li>`;
    })
    .join("");
  deck.innerHTML = html;
  // cards array holds all cards
  card = document.getElementsByClassName("card");
  cards = [...card];
  // @description shuffles cards when page is refreshed / loads
  // loop to add event listeners to each card
  startGame();
  for (var i = 0; i < cards.length; i++) {
    card = cards[i];
    card.addEventListener("click", displayCard);
    card.addEventListener("click", cardOpen);
    // card.addEventListener("click", congratulations);
  }
}

// declaring move variable
let moves = 0;
let counter = document.querySelector(".moves");

// declare variables for star icons
const stars = document.querySelectorAll(".fa-star");

// declaring variable of matchedCards
let matchedCard = document.getElementsByClassName("match");

// stars list
let starsList = document.querySelectorAll(".stars li");

// close icon in modal
let closeicon = document.querySelector(".close");

// declare modal
let modal = document.getElementById("popup1");

// array for opened cards
var openedCards = [];

// @description shuffles cards
// @param {array}
// @returns shuffledarray
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// @description function to start a new play
function startGame() {
  // empty the openCards array
  openedCards = [];

  // shuffle deck
  cards = shuffle(cards);
  // remove all exisiting classes from each card
  for (var i = 0; i < cards.length; i++) {
    deck.innerHTML = "";
    [].forEach.call(cards, function (item) {
      deck.appendChild(item);
    });
    cards[i].classList.remove("show", "open", "match", "disabled");
  }
  // reset moves
  moves = 0;
  counter.innerHTML = moves;
  // reset rating
  for (var i = 0; i < stars.length; i++) {
    stars[i].style.color = "#FFD700";
    stars[i].style.visibility = "visible";
  }
  //reset timer
  second = 0;
  minute = 0;
  hour = 0;
  var timer = document.querySelector(".timer");
  timer.innerHTML = "0 mins 0 secs";
  clearInterval(interval);
  document.getElementById("loader").style.display = "none";
}

// @description toggles open and show class to display cards
var displayCard = function () {
  this.classList.toggle("open");
  this.classList.toggle("show");
  this.classList.toggle("disabled");
};

// @description add opened cards to OpenedCards list and check if cards are match or not
function cardOpen() {
  openedCards.push(this);
  var len = openedCards.length;
  if (len === 2) {
    moveCounter();
    if (openedCards[0].type === openedCards[1].type) {
      setTimeout(function () {
        matched();
      }, 500);
    } else {
      setTimeout(function () {
        unmatched();
      }, 500);
    }
  }
}

// @description when cards match
function matched() {
  openedCards[0].classList.add("match", "disabled");
  openedCards[1].classList.add("match", "disabled");
  openedCards[0].classList.remove("no-event");
  openedCards[1].classList.remove("no-event");
  openedCards = [];
  congratulations();
}

// description when cards don't match
function unmatched() {
  openedCards[0].classList.add("unmatched");
  openedCards[1].classList.add("unmatched");
  disable();
  setTimeout(function () {
    openedCards[0].classList.remove("show", "open", "no-event", "unmatched");
    openedCards[1].classList.remove("show", "open", "no-event", "unmatched");
    enable();
    openedCards = [];
  }, 1100);
}

// @description disable cards temporarily
function disable() {
  Array.prototype.filter.call(cards, function (card) {
    card.classList.add("disabled");
  });
}

// @description enable cards and disable matched cards
function enable() {
  Array.prototype.filter.call(cards, function (card) {
    card.classList.remove("disabled");
    for (var i = 0; i < matchedCard.length; i++) {
      matchedCard[i].classList.add("disabled");
    }
  });
}

// @description count player's moves
function moveCounter() {
  moves++;
  counter.innerHTML = moves;
  //start timer on first click
  if (moves == 1) {
    second = 0;
    minute = 0;
    hour = 0;
    startTimer();
  }
  // setting rates based on moves
  if (moves > 8 && moves < 12) {
    for (i = 0; i < 3; i++) {
      if (i > 1) {
        stars[i].style.visibility = "collapse";
      }
    }
  } else if (moves > 13) {
    for (i = 0; i < 3; i++) {
      if (i > 0) {
        stars[i].style.visibility = "collapse";
      }
    }
  }
}

// @description game timer
var second = 0,
  minute = 0;
hour = 0;
var timer = document.querySelector(".timer");
var interval;
function startTimer() {
  interval = new IntervalTimer(function () {
    timer.innerHTML = minute + "mins " + second + "secs";
    second++;
    if (second == 60) {
      minute++;
      second = 0;
    }
    if (minute == 60) {
      hour++;
      minute = 0;
    }
  }, 1000);
}

function IntervalTimer(callback, interval) {
  var timerId,
    startTime,
    remaining = 0;
  var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

  this.pause = function () {
    if (state != 1) return;

    remaining = interval - (new Date() - startTime);
    window.clearInterval(timerId);
    state = 2;
  };

  this.resume = function () {
    if (state != 2) return;

    state = 3;
    window.setTimeout(this.timeoutCallback, remaining);
  };

  this.timeoutCallback = function () {
    if (state != 3) return;

    callback();

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
  };

  startTime = new Date();
  timerId = window.setInterval(callback, interval);
  state = 1;
}

// @description congratulations when all cards match, show modal and moves, time and rating
const btnShowForm = document.getElementById("submit-score");
const submitForm = document.getElementById("form-submit");
const winDialog = document.getElementById("win-dialog");
const countrySelect = document.getElementById("country");
const estadosSelect = document.getElementById("estados");

btnShowForm.addEventListener("click", function () {
  submitForm.classList.remove("hidden");
  winDialog.classList.add("hidden");
});

countrySelect.addEventListener("change", function () {
  if (this.value === "MEX") {
    estadosSelect.classList.remove("hidden");
  }
});
function congratulations() {
  if (matchedCard.length == 16) {
    interval.pause();
    finalTime = timer.innerHTML;
    console.log(hour, minute, second);
    // show congratulations modal
    modal.classList.add("show");

    // declare star rating variable
    var starRating = document.querySelector(".stars").innerHTML;

    //showing move, rating, time on modal
    document.getElementById("finalMove").innerHTML = moves;
    document.getElementById("starRating").innerHTML = starRating;
    document.getElementById("totalTime").innerHTML = finalTime;

    //closeicon on modal
    closeModal();
  }
}

// @description close icon on modal
function closeModal() {
  closeicon.addEventListener("click", function (e) {
    modal.classList.remove("show");
    startGame();
  });
}

// @desciption for user to play Again
function playAgain() {
  modal.classList.remove("show");
  startGame();
}

function Results() {
  this.juego = "memoria";
  this.seudonimo = "";
  this.pais = null;
  this.estado_mex = null;
  this.clicks = 0;
  this.tiempoSec = 0;
}
