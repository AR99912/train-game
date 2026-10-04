const sceneryLayer = document.getElementById("scenery-layer");
const mountains = document.getElementById("mountains");
const railway = document.getElementById("railway");
const speedVal = document.getElementById("speed-val");
const scoreVal = document.getElementById("score-val");
const coinVal = document.getElementById("coin-val");
const passengersVal = document.getElementById("passengers-val");
const stationAlert = document.getElementById("station-alert");
const gameContainer = document.getElementById("game-container");
const trainGroup = document.getElementById("train-group");
const btnClearObstacle = document.getElementById("btn-clear-obstacle");
const btnTime = document.getElementById("btn-toggle-time");
const wagons = document.querySelectorAll(".wagon-windows");

// مدیریت فیزیک حرکت
document
  .getElementById("btn-fast")
  .addEventListener(
    "click",
    () => (targetSpeed = Math.min(maxSpeed, targetSpeed + 3.5)),
  );
document
  .getElementById("btn-slow")
  .addEventListener(
    "click",
    () => (targetSpeed = Math.max(0, targetSpeed - 3.5)),
  );
document
  .getElementById("btn-stop")
  .addEventListener("click", () => (targetSpeed = 0));

// ۱. چرخه زمان ۴ حالته
const times = ["morning", "noon", "evening", "night"];
const timeLabels = {
  morning: "صبح🌅",
  noon: "ظهر☀️",
  evening: "بعد از ظهر🌇",
  night: "شب🌙",
};
let currentTimeIndex = 1; // شروع از ظهر

btnTime.addEventListener("click", () => {
  gameContainer.classList.remove(...times);
  currentTimeIndex = (currentTimeIndex + 1) % times.length;
  let newTime = times[currentTimeIndex];
  gameContainer.classList.add(newTime);
  btnTime.innerText = `⏰ چرخه زمان (${timeLabels[newTime]})`;
});

// ۲. سوییچ رندوم استایل قطار (۳ حالت)
const trainStyles = ["train-maglev", "train-retro", "train-cyber"];
let currentStyleIndex = 0;
document.getElementById("btn-change-style").addEventListener("click", () => {
  trainGroup.classList.remove(...trainStyles);
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * trainStyles.length);
  } while (nextIndex === currentStyleIndex);
  currentStyleIndex = nextIndex;
  trainGroup.classList.add(trainStyles[currentStyleIndex]);
});

// ۳. مدیریت رفع مانع
btnClearObstacle.addEventListener("click", () => {
  if (activeObstacleIndex !== null) {
    elements[activeObstacleIndex].active = false;
    let dom = document.getElementById("el-" + activeObstacleIndex);
    if (dom) dom.classList.add("laser-hit");
    score += 40;
    scoreVal.innerText = score;
    createPopEffect("+40 امتیاز هشیاری", 500, 160, "pop-score");
    btnClearObstacle.style.display = "none";
    activeObstacleIndex = null;
  }
});

// وضعیت بازی
let speed = 0,
  targetSpeed = 0,
  maxSpeed = 15;
let score = 0,
  coins = 0,
  totalPassengers = 8;
let mountPosX = 0,
  railPosX = 0;
let activeObstacleIndex = null;

const obstacleTypes = [
  { icon: "🪵", label: "🪓 خرد کردن کنده‌ها" },
  { icon: "🐄", label: "🔔 راندن گله گاوها" },
  { icon: "🚶", label: "📢 بوق اخطار عابر" },
];

let elements = [
  { type: "tree", x: 450 },
  {
    type: "station",
    x: 1000,
    name: "ایستگاه شیراز پیاده‌روی",
    passengers: 5,
    visited: false,
  },
  { type: "tree", x: 1600 },
  { type: "obstacle", x: 2200, active: true, info: obstacleTypes[0] },
  { type: "tree", x: 2800 },
  {
    type: "station",
    x: 3400,
    name: "ایستگاه مگاپولیس تهران",
    passengers: 8,
    visited: false,
  },
  { type: "tree", x: 4100 },
  { type: "obstacle", x: 4700, active: true, info: obstacleTypes[1] },
  {
    type: "station",
    x: 5400,
    name: "ایستگاه نئون مشهد",
    passengers: 11,
    visited: false,
  },
];
const mapLength = 6200;

function updateWagonPassengers() {
  wagons.forEach((wagon, index) => {
    wagon.innerHTML = "";
    let pInWagon = Math.min(
      5,
      Math.max(
        0,
        Math.floor(totalPassengers / wagons.length) +
          (index < totalPassengers % wagons.length ? 1 : 0),
      ),
    );
    for (let i = 0; i < pInWagon; i++) {
      let head = document.createElement("div");
      head.className = "passenger-head";
      wagon.appendChild(head);
    }
  });
  passengersVal.innerText = totalPassengers;
}

function createMapElements() {
  sceneryLayer.innerHTML = "";
  elements.forEach((el, index) => {
    let div = document.createElement("div");
    if (el.type === "tree") {
      div.className = "tree";
    } else if (el.type === "station") {
      div.className = "station";
      div.innerHTML = `<div class="station-sign">${el.name}</div>`;
      let pDiv = document.createElement("div");
      pDiv.className = "station-passengers";
      for (let i = 0; i < el.passengers; i++)
        pDiv.innerHTML += `<div class="person"><div class="person-head"></div><div class="person-body"></div></div>`;
      div.appendChild(pDiv);
    } else if (el.type === "obstacle") {
      div.className = "obstacle";
      div.innerText = el.info.icon;
      if (!el.active) div.style.display = "none";
    }
    div.id = "el-" + index;
    div.style.left = el.x + "px";
    sceneryLayer.appendChild(div);
  });
}

// افکت پاپ آپ چندمنظوره برای سکه و امتیاز
function createPopEffect(text, x, y, className) {
  let pop = document.createElement("div");
  pop.className = `pop-effect ${className}`;
  pop.innerText = text;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  gameContainer.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

let wheelRotation = 0;
function gameLoop() {
  speed += (targetSpeed - speed) * 0.05;
  if (speed < 0.02) speed = 0;

  speedVal.innerText = Math.round(speed * 22);

  if (speed > 0.1) {
    wheelRotation += speed * 3;
    document
      .querySelectorAll(".wheel")
      .forEach((w) => (w.style.transform = `rotate(${wheelRotation}deg)`));

    railPosX -= speed;
    if (railPosX <= -950) railPosX = 0;
    railway.style.transform = `translateX(${railPosX}px)`;

    mountPosX -= speed * 0.12;
    if (mountPosX <= -950) mountPosX = 0;
    mountains.style.transform = `translateX(${mountPosX}px)`;
  }

  let trainFrontX = 60 + 6 * 95;
  let showAlert = false;
  let obstacleNear = false;

  elements.forEach((el, index) => {
    el.x -= speed;

    if (el.x < -300) {
      el.x += mapLength;
      if (el.type === "station") {
        el.visited = false;
        el.passengers = Math.floor(Math.random() * 6) + 5;
      }
      if (el.type === "obstacle") {
        el.active = true;
        el.info =
          obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      }

      let dom = document.getElementById("el-" + index);
      if (dom && el.type === "station") {
        let pDiv = dom.querySelector(".station-passengers");
        if (pDiv) {
          pDiv.innerHTML = "";
          for (let i = 0; i < el.passengers; i++)
            pDiv.innerHTML += `<div class="person"><div class="person-head"></div><div class="person-body"></div></div>`;
        }
      }
    }

    let dom = document.getElementById("el-" + index);
    if (dom) {
      dom.style.left = el.x + "px";
      if (el.type === "obstacle") {
        if (!el.active) dom.style.display = "none";
        else {
          dom.style.display = "flex";
          dom.innerText = el.info.icon;
        }
      }
    }

    // منطق ورود و توقف کامل در ایستگاه (امتیاز + دریافت سکه)
    if (el.type === "station") {
      let distanceToStation = el.x - trainFrontX;
      if (distanceToStation > 0 && distanceToStation < 350 && !el.visited) {
        showAlert = true;
      }

      if (el.x > 250 && el.x < 420 && speed === 0 && !el.visited) {
        el.visited = true;

        // محاسبه پاداش ها
        let pointsEarned = el.passengers * 50;
        let coinsEarned = el.passengers * 15; // درآمد مالی حاصل از مسافرگیری

        score += pointsEarned;
        coins += coinsEarned;
        totalPassengers += el.passengers;

        scoreVal.innerText = score;
        coinVal.innerText = coins;

        // پیاده شدن مجازی مسافران ایستگاه
        el.passengers = 0;
        let pDiv = dom.querySelector(".station-passengers");
        if (pDiv) pDiv.innerHTML = "";

        updateWagonPassengers();

        // نمایش دو انیمیشن مجزا برای امتیاز و سکه ها
        createPopEffect(`+${pointsEarned} Score`, 420, 140, "pop-score");
        setTimeout(() => {
          createPopEffect(`+${coinsEarned} 🪙`, 480, 170, "pop-coin");
        }, 250);
      }
    }

    // منطق برخورد فیزیکی با موانع
    if (el.type === "obstacle" && el.active) {
      let distanceToObstacle = el.x - trainFrontX;

      if (distanceToObstacle > 0 && distanceToObstacle < 400) {
        obstacleNear = true;
        activeObstacleIndex = index;
        btnClearObstacle.innerText = el.info.label;
        btnClearObstacle.style.display = "block";
      }

      if (distanceToObstacle > -10 && distanceToObstacle < 30) {
        if (speed > 1) {
          score = Math.max(0, score - 120);
          coins = Math.max(0, coins - 40); // خسارت مالی تصادف
          scoreVal.innerText = score;
          coinVal.innerText = coins;

          createPopEffect(
            `⛔ تصادف شدید! 120-`,
            trainFrontX - 30,
            150,
            "pop-score",
          );
          totalPassengers = Math.max(0, totalPassengers - 3);
          updateWagonPassengers();
        }
        el.active = false;
        targetSpeed = 0;
        speed = 0;
        btnClearObstacle.style.display = "none";
        activeObstacleIndex = null;
      }
    }
  });

  if (!obstacleNear && activeObstacleIndex !== null) {
    btnClearObstacle.style.display = "none";
    activeObstacleIndex = null;
  }

  stationAlert.style.display = showAlert ? "block" : "none";
  requestAnimationFrame(gameLoop);
}

createMapElements();
updateWagonPassengers();
gameLoop();
