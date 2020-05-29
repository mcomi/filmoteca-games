(function () {
  "use strict";

  var MemoryGame = (function () {
    let datosApi;

    // @description game timer
    var second = 0,
      minute = 0,
      hour = 0;
    var timer = document.querySelector(".timer");
    timer.innerHTML = minute + "mins " + second + "segs";
    var interval;
    function startTimer() {
      clearInterval(interval);
      interval = new IntervalTimer(function () {
        timer.innerHTML = minute + "mins " + second + "segs";
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

    const prod = true;
    const url = prod ? "http://132.247.164.46:8096/" : "http://localhost:8080/";
    // get images from api
    function getImagesFromApi() {
      fetch(url + "api/images")
        .then((res) => res.json())
        .then((json) => {
          datosApi = json.data;
          if (datosApi.length < 8) {
            alert("faltan suficientes imágenes");
            return;
          }
          generateCardsHtml(datosApi);
        })
        .catch((err) => {
          alert("ocurrió un error al cargar");
        });
    }

    // function to generate an object url so the image in the db can be display
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

    // generates de html by mapping all the image objects in the array received
    function generateCardsHtml(arrImagenes) {
      const html = arrImagenes
        .map((item) => {
          return `<li class="card" type="${item.nombre_img.split(".")[0]}">
    <div class="content">
      <div class="front">
        <img src="${
          item.data_blob !== null
            ? generateImageObjectUrl(item.data_blob.data)
            : ""
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
          item.data_blob !== null
            ? generateImageObjectUrl(item.data_blob.data)
            : ""
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
      for (var i = 0; i < cards.length; i++) {
        card = cards[i];
        card.addEventListener("click", displayCard);
        card.addEventListener("click", cardOpen);
      }
      startGame();
    }

    const infoModal = document.getElementById("info-modal");
    const infoContent = document.getElementById("content-info");
    function generateModalDescription(type) {
      const itemToShow = datosApi.find((item) => {
        return item.nombre_img.includes(type);
      });
      infoContent.innerHTML = itemToShow.info_img;
      infoModal.classList.add("show");
      closeInfoModal();
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
      interval && interval.pause();
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
      timer = document.querySelector(".timer");
      timer.innerHTML = minute + "mins " + second + "segs";
      interval;
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
        disable();
        moveCounter();
        if (openedCards[0].type === openedCards[1].type) {
          var type = openedCards[0].type;
          setTimeout(function () {
            generateModalDescription(type);
            interval.pause();
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
      enable();
    }

    // description when cards don't match
    function unmatched() {
      openedCards[0].classList.add("unmatched");
      openedCards[1].classList.add("unmatched");
      disable();
      setTimeout(function () {
        openedCards[0].classList.remove(
          "show",
          "open",
          "no-event",
          "unmatched"
        );
        openedCards[1].classList.remove(
          "show",
          "open",
          "no-event",
          "unmatched"
        );
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
        for (let i = 0; i < 3; i++) {
          if (i > 1) {
            stars[i].style.visibility = "collapse";
          }
        }
      } else if (moves > 13) {
        for (let i = 0; i < 3; i++) {
          if (i > 0) {
            stars[i].style.visibility = "collapse";
          }
        }
      }
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
    const inputNickname = document.getElementById("nickname");
    const btnShowForm = document.getElementById("submit-score");
    const submitForm = document.getElementById("form-submit");
    const winDialog = document.getElementById("win-dialog");
    const countrySelect = document.getElementById("country");
    const estadosSelect = document.getElementById("estados");
    const btnSendResults = document.getElementById("submit-results");

    function validateForm() {
      if (countrySelect.value !== "MEX" && inputNickname.value !== "") {
        btnSendResults.disabled = false;
      }
      if (
        countrySelect.value === "MEX" &&
        estadosSelect.value !== "" &&
        inputNickname.value !== ""
      ) {
        btnSendResults.disabled = false;
      }
    }

    btnShowForm.addEventListener("click", function () {
      submitForm.classList.remove("hidden");
      winDialog.classList.add("hidden");
    });

    countrySelect.addEventListener("change", function () {
      if (this.value === "MEX") {
        estadosSelect.classList.remove("hidden");
      } else {
        estadosSelect.classList.add("hidden");
        validateForm();
      }
    });

    estadosSelect.addEventListener("change", validateForm);

    btnSendResults.addEventListener("click", function () {
      this.disabled = true;
      submitResult();
    });

    let finalTime;
    function congratulations() {
      if (matchedCard.length == 16) {
        interval.pause();
        finalTime = timer.innerHTML;
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
      } else {
        setTimeout(function () {
          interval.resume();
        }, 500);
      }
    }

    // @description close icon on modal
    function closeModal() {
      closeicon.addEventListener("click", function (e) {
        modal.classList.remove("show");
        startGame();
      });
    }

    const closeIconInfo = document.querySelector(".close-icon");
    function closeInfoModal() {
      closeIconInfo.addEventListener("click", function (e) {
        infoModal.classList.remove("show");
        congratulations();
      });
    }

    // @desciption for user to play Again
    function playAgain() {
      modal.classList.remove("show");
      gameContainer.classList.contains("hidden") &&
        gameContainer.classList.remove("hidden");
      !resultsContainer.classList.contains("hidden") &&
        resultsContainer.classList.add("hidden");
      document.getElementById("loader").style.display = "block";
      getImagesFromApi();
    }

    let result;

    const loaderSubmit = document.getElementById("loading-result");
    function submitResult(overwrite = false) {
      if (!result) {
        result = new Result(
          inputNickname.value,
          countrySelect.value,
          estadosSelect.value,
          moves,
          convertToSeconds(hour, minute, second)
        );
      }
      loaderSubmit.style.display = "block";
      const data = JSON.stringify(result);
      fetch(url + `api/results?overwrite=${overwrite}`, {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.data.order_rank) {
            console.log("TRaigo el ranking");
            resetModals();
            getResults();
            informResults();
          } else {
            loaderSubmit.style.display = "none";
            askOverrideResult({ ...json.data });
          }
        })
        .catch((err) => {
          loaderSubmit.style.display = "none";
          document.getElementById("error-message").innerHTML =
            "Ocurrió un error, intente de nuevo";
        });
    }

    function informResults() {
      console.log("TODO ranking");
    }

    const overrideScore = document.getElementById("override-score");
    function askOverrideResult({
      seudonimo,
      pais,
      estado_mex,
      clicks,
      tiempoSec,
    }) {
      submitForm.classList.add("hidden");
      const htmlPreviousResult = `<p>
    Encontramos un score previo con estos datos: <br/>
    ${seudonimo} 
    <span class="f32"><span class="flag ${pais.toLowerCase()} inline"></span></span>
    ${estado_mex ? estado_mex : ""}
    </p>
    <p class="p-bold">Score registrado</p>
    <p>
    ${clicks} intentos en ${formatTime(tiempoSec)}
    </p>
    <p class="p-bold">Score partida actual </p> 
    <p>  ${moves} intentos en ${finalTime} </p>
    <button id="btn-update-score" class="btn">
        Actualizar mi score 🏆
    </button>
    <button id="btn-change-data" class="btn">
        Modificar mi seudónimo ✎
    </button>`;
      overrideScore.innerHTML = htmlPreviousResult;
      overrideScore.classList.remove("hidden");
      const btnUpdateScore = document.getElementById("btn-update-score");
      btnUpdateScore.addEventListener("click", function () {
        submitResult(true);
      });
      const btnChangeData = document.getElementById("btn-change-data");
      btnChangeData.addEventListener("click", function () {
        changeDataToSubmit();
      });
    }

    function changeDataToSubmit() {
      inputNickname.value = "";
      countrySelect.value = "";
      estadosSelect.value = "";
      result = null;
      submitForm.classList.remove("hidden");
      overrideScore.classList.add("hidden");
    }

    function resetModals() {
      document.getElementById("error-message").innerHTML = "";
      loaderSubmit.style.display = "none";
      inputNickname.value = "";
      countrySelect.value = "";
      estadosSelect.value = "";
      winDialog.classList.remove("hidden");
      submitForm.classList.add("hidden");
      overrideScore.classList.add("hidden");
      result = null;
    }

    const btnWorldResults = document.getElementById("btn-world-results");
    const btnMexicoResults = document.getElementById("btn-mexico-results");
    const btnsPlayAgain = document.querySelectorAll(".play-again");

    btnsPlayAgain.forEach((btn) => {
      btn.addEventListener("click", playAgain);
    });

    btnWorldResults.addEventListener("click", function () {
      getResults();
    });
    btnMexicoResults.addEventListener("click", function () {
      getResults(true);
    });

    function getResults(mexicoResults) {
      document.getElementById("loading-leaderboard").style.display = "block";
      fetch(`${url}api/results${mexicoResults ? "?country=MEX" : ""}`)
        .then((res) => res.json())
        .then((res) => loadResults(res.data, mexicoResults))
        .catch((err) => {
          document.getElementById("loading-leaderboard").style.display = "none";
        });
    }

    const gameContainer = document.getElementById("game-container");
    const resultsContainer = document.getElementById("results-table");
    const resultsHtml = document.getElementById("results");
    function loadResults(resultados, mexicoResults) {
      const theader = document.getElementById("t-header");
      if (mexicoResults) {
        const headerHTML = `<th scope="col">Lugar</th>
    <th scope="col">País</th>
    <th scope="col">Estado</th>
    <th scope="col">Seudónimo</th>
    <th scope="col">Intentos</th>
    <th scope="col">Tiempo</th>`;
        theader.innerHTML = headerHTML;
      } else {
        const headerHTML = `<th scope="col">Lugar</th>
    <th scope="col">País</th>
    <th scope="col">Seudónimo</th>
    <th scope="col">Intentos</th>
    <th scope="col">Tiempo</th>`;
        theader.innerHTML = headerHTML;
      }
      const htmlResultados = resultados
        .map((item, index) => {
          return `<tr>
   <td data-label="Lugar">${index + 1}</td>
   <td data-label="País" class="f32"><span class="flag ${item.pais.toLowerCase()}"></span></td>
   ${
     item.pais === "MEX" && mexicoResults
       ? `<td data-label="Estado">${item.estado_mex}</td>`
       : ""
   }
   <td data-label="Seudónimo">${item.seudonimo}</td>
   <td data-label="Intentos">${item.clicks}</td>
   <td data-label="Tiempo">${formatTime(item.tiempoSec)}</td>`;
        })
        .join("");
      document.getElementById("loading-leaderboard").style.display = "none";
      gameContainer.classList.add("hidden");
      resultsContainer.classList.remove("hidden");
      resultsHtml.innerHTML = htmlResultados;
    }

    const btnLeader = document.querySelectorAll(".btn-leaders");

    [].forEach.call(btnLeader, (el) => {
      el.addEventListener("click", btnClick, false);
    });

    function btnClick() {
      // use Array function for lexical this
      [].forEach.call(btnLeader, (el) => {
        // except for the element clicked, remove active class
        if (el !== this) el.classList.remove("active");
      });

      // toggle active on the clicked button
      this.classList.contains("active") ? "" : this.classList.toggle("active");
    }

    function Result(seudonimo, pais, estado_mex, clicks, tiempoSec) {
      this.juego = "memoria";
      this.seudonimo = seudonimo || "";
      this.pais = pais || null;
      this.estado_mex = estado_mex || null;
      this.clicks = clicks || 0;
      this.tiempoSec = tiempoSec || 0;
    }

    function convertToSeconds(hours = 0, minutes, seconds) {
      const secs = seconds - 1;
      return hours * 3600 + minutes * 60 + secs;
    }

    function formatTime(timestamp) {
      var hours = Math.floor(timestamp / 60 / 60);
      var minutes = Math.floor(timestamp / 60) - hours * 60;
      var seconds = timestamp % 60;
      if (hours > 0) {
        return `${hours} horas ${minutes} minutos ${seconds} segundos`;
      } else if (minutes > 0) {
        return `${minutes} minutos ${seconds} segundos`;
      } else {
        return `${seconds} segundos`;
      }
    }

    return {
      init: function () {
        getImagesFromApi();
      },
    };
  })();

  MemoryGame.init();
})();
