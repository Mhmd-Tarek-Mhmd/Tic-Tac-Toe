(function () {
  const Modal = {
    user: "",
    bot: "",
    winner: "",
    isGameActive: false,
  };
  const Controller = {
    getUser: () => Modal.user,
    setUser: (val) => (Modal.user = val),

    getBot: () => Modal.bot,
    setBot: (val) => (Modal.bot = val),

    getWinner: () => Modal.winner,
    setWinner: (val) => (Modal.winner = val),

    getIsGameActive: () => Modal.isGameActive,
    toggleIsGameActive: () => (Modal.isGameActive = !Modal.isGameActive),
  };

  class GameBoard extends HTMLElement {
    static get observedAttributes() {
      return ["role"];
    }

    set role(player) {
      this.setAttribute("role", player);
    }

    constructor() {
      super();

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `
        <style>
          :host {
            width: 100vw;
            height: 100vh;
            max-width: 320px;
            max-height: 380px;
            position: relative;

            gap: 10px;
            display: grid;
            grid: repeat(3, 1fr) / repeat(3, 1fr);
          }
          :host(.no-click) {
            pointer-events: none;
          }
          .win-line {
            position: absolute;
            background-color: black;
            animation-duration: 0.3s;
            animation-timing-function: linear;
          }

          /* Vertical Line */
          .win-line.vert {
            top: -5%;
            width: 2px;
            height: 110%;
            will-change: height;
            animation-name: vert;
          }
          @keyframes vert {
            from {
              height: 0;
            }
            to {
              height: 110%;
            }
          }
          .win-line.left {
            left: 15%;
          }
          .win-line.center {
            left: 50% !important;
            transform: translateX(-50%);
          }
          .win-line.right {
            right: 15%;
          }

          /* Horizontal Line */
          .win-line.horz {
            left: -5%;
            width: 110%;
            height: 2px;
            will-change: width;
            animation-name: horz;
          }
          @keyframes horz {
            from {
              width: 0;
            }
            to {
              width: 110%;
            }
          }
          .win-line.top {
            top: 15%;
          }
          .win-line.middle {
            top: 50%;
            transform: translateY(-50%);
          }
          .win-line.bottom {
            bottom: 15%;
          }

          /* Diagonal Line */
          .win-line.diag {
            top: -5%;
            left: 50%;
            width: 2px;
            height: 110%;
            will-change: height;
            animation-name: diag;
          }
          @keyframes diag {
            from {
              height: 0;
            }
            to {
              height: 110%;
            }
          }

          .win-line.top-left {
            transform: skewX(40deg);
          }
          .win-line.top-right {
            transform: skewX(-40deg);
          }
          @media (max-width: 400px) {
            .win-line.top-left {
              transform: skewX(45deg);
            }
            .win-line.top-right {
              transform: skewX(-45deg);
            }
          }          
        </style>

        <board-slot aria-label='Slot 1-1'></board-slot>
        <board-slot aria-label='Slot 1-2'></board-slot>
        <board-slot aria-label='Slot 1-3'></board-slot>
        <board-slot aria-label='Slot 2-1'></board-slot>
        <board-slot aria-label='Slot 2-2'></board-slot>
        <board-slot aria-label='Slot 2-3'></board-slot>
        <board-slot aria-label='Slot 3-1'></board-slot>
        <board-slot aria-label='Slot 3-2'></board-slot>
        <board-slot aria-label='Slot 3-3'></board-slot>
      `;
    }

    connectedCallback() {
      Controller.getBot() === "X" && this._botRole();

      const slots = this.shadowRoot.querySelectorAll("board-slot");
      slots.forEach((slot) =>
        slot.addEventListener("click", this._onclick.bind(this))
      );
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.className = newValue === "user" ? "" : "no-click";
    }

    _onclick(e) {
      this._userRole(e);
      this._botRole();
    }

    _role(chosenSlot, playerLetter) {
      if (Controller.getIsGameActive()) {
        const ele = chosenSlot.shadowRoot.querySelector("button");

        chosenSlot.setAttribute("disabled", "");
        ele.setAttribute("disabled", "");
        ele.innerHTML = playerLetter;
        this._checkForWinner();
      }
    }

    _userRole(e) {
      this._role(e.target, Controller.getUser());
    }

    _botRole() {
      this.role = "bot";
      setTimeout(() => {
        let availableSlots = this.shadowRoot.querySelectorAll(
          "board-slot:not([disabled])"
        );

        this._role(
          availableSlots[Math.floor(Math.random() * availableSlots.length)],
          Controller.getBot()
        );

        this.role = "user";
      }, 500);
    }

    _endGame() {
      Controller.toggleIsGameActive();
      setTimeout(() => {
        this.remove();
        document.body.innerHTML = "<main-menu content='results'></main-menu>";
      }, 500);
    }

    _checkForWinner() {
      const slots = this.shadowRoot.querySelectorAll("board-slot");
      const winPositions = [
        // Horizontal Positions
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // Vertical Positions
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // Diagonal Positions
        [0, 4, 8],
        [2, 4, 6],
      ];

      winPositions.forEach((position, i) => {
        let a = slots[position[0]].shadowRoot.lastElementChild.innerHTML;
        let b = slots[position[1]].shadowRoot.lastElementChild.innerHTML;
        let c = slots[position[2]].shadowRoot.lastElementChild.innerHTML;

        if (a !== "" && b !== "" && c !== "")
          if (a === b && a === c) {
            this._winLine(i);
            Controller.setWinner(a);
            this._endGame();
          }
      });

      !this.shadowRoot.querySelectorAll("board-slot:not([disabled])").length &&
        this._endGame();
    }

    _winLine(index) {
      const divNode = document.createElement("div");
      const lineClasses = divNode.classList;
      divNode.className = "win-line";

      switch (index) {
        // Horizontal Positions
        case 0:
          lineClasses.add("horz", "top");
          break;
        case 1:
          lineClasses.add("horz", "middle");
          break;
        case 2:
          lineClasses.add("horz", "bottom");
          break;

        // Vertical Positions
        case 3:
          lineClasses.add("vert", "left");
          break;
        case 4:
          lineClasses.add("vert", "center");
          break;
        case 5:
          lineClasses.add("vert", "right");
          break;

        // Diagonal Positions
        case 6:
          lineClasses.add("diag", "top-left");
          break;
        case 7:
          lineClasses.add("diag", "top-right");
          break;
      }

      this.shadowRoot.appendChild(divNode);
    }
  }

  class MainMenu extends HTMLElement {
    static get observedAttributes() {
      return ["content"];
    }

    constructor() {
      super();

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `
        <style>
          :host {
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            position: fixed;
            background-color: lightblue;
          }
          h1 {
            color: whitesmoke;
            font-size: 4.75rem;
            text-align: center;
          }
          @media (max-width: 400px) {
            h1 {
              font-size: 3.5rem;
            }
          }
          @media (min-width: 350px) {
            h1 {
            margin-bottom: 1.3em;
            }
          }
          .user-selection {
            gap: 15px;
            display: grid;
            grid: 1fr / 1fr .5fr 1fr;
            width: 100vw;
            height: calc(100vh - 190px);
            max-width: 320px;
            max-height: 150px;
            margin: auto;
            text-align: center;
            padding: 15px 10px;
            box-sizing: border-box;
          }
          .results {
            top: 50%;
            left: 50%;
            width: 100%;
            position: absolute;
            text-align: center;
            transform: translate(-50%, -50%);
          }
          span {
            color: #222;
            font-size: 2rem;
            font-weight: bold;
            align-self: center;
          }
          button {
            border: none;
            padding: 10px;
            color: inherit;
            font-size: 20px;
            cursor: pointer;
            border-radius: 3px;
            background-color: #00bcd4;
          }
          h2 {
            margin-top: 0;
            font-size: 4.5rem;
            font-family: 'Arial';
          }
        </style>
        `;
    }

    connectedCallback() {
      this.shadowRoot.querySelectorAll("board-slot").forEach((node) => {
        node.onclick = (e) => this._onclick(e);
      });
    }

    disconnectedCallback() {
      document.body.innerHTML = "<game-board></game-board>";
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this.shadowRoot.innerHTML +=
        newValue === "selection"
          ? `
            <h1>Tic Tac Toe</h1>
            <div class='user-selection'>
              <board-slot content='X' aria-label='Choose x'></board-slot>
              <span>OR</span>
              <board-slot content='O' aria-label='Choose o'></board-slot>
            </div>
          `
          : `
          <div class='results'>
            <h2>${
              Controller.getWinner() !== ""
                ? Controller.getWinner() + " WINS"
                : "DRAW"
            }</h2>
            <button onclick="location.reload()">Play Again</button>
          </div>
        `;
    }

    _onclick(e) {
      Controller.setUser(e.target.getAttribute("content"));
      Controller.getUser() === "X"
        ? Controller.setBot("O")
        : Controller.setBot("X");

      Controller.toggleIsGameActive();
      this.remove();
    }
  }

  class BoardSlot extends HTMLElement {
    constructor() {
      super();

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `
        <style>
          button {
            width: 100%;
            height: 100%;
            color: inherit;
            font: inherit;
            border: none;
            font-size: 4.5rem;
            border-radius: 5px;
            background: lightskyblue;
          }
          button:hover {
            opacity: 0.8;
          }
          @media (max-width: 400px) {
            button {
              font-size: 3rem;
            }
          }
        </style>

        <button></button>
      `;

      shadowRoot.querySelector("button").innerHTML =
        this.getAttribute("content");
    }
  }

  customElements.define("game-board", GameBoard);
  customElements.define("main-menu", MainMenu);
  customElements.define("board-slot", BoardSlot);
})();
