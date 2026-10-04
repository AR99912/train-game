const sceneryLayer = document.getElementById("scenery-layer");
const mountains = document.getElementById("mountains");
const railway = document.getElementById("railway");
const speedVal = document.getElementById("speed-val");
const scoreVal = document.getElementById("score-val");
const passengersVal = document.getElementById("passengers-val");
const stationAlert = document.getElementById("station-alert");
const gameContainer = document.getElementById("game-container");
const btnClearObstacle = document.getElementById("btn-clear-obstacle");
const wheels = document.querySelectorAll(".wheel");
const wagons = document.querySelectorAll(".wagon-windows");

// دکمه‌های کنترل حرکت
document
  .getElementById("btn-fast")
  .addEventListener(
    "click",
    () => (targetSpeed = Math.min(maxSpeed, targetSpeed + 3)),
  );
document
  .getElementById("btn-slow")
  .addEventListener(
    "click",
    () => (targetSpeed = Math.max(0, targetSpeed - 3)),
  );
document
  .getElementById("btn-stop")
  .addEventListener("click", () => (targetSpeed = 0));

// دکمه تغییر شب و روز
document.getElementById("btn-toggle-time").addEventListener("click", () => {
  gameContainer.classList.toggle("night");
});

// مدیریت رفع مانع
btnClearObstacle.addEventListener("click", () => {
  if (activeObstacleIndex !== null) {
    let el = elements[activeObstacleIndex];
    el.active = false;
    let dom = document.getElementById("el-" + activeObstacleIndex);
    if (dom) dom.classList.add("laser-hit"); // افکت انیمیشن حذف

    score += 30; // پاداش برای هشیاری راننده
    scoreVal.innerText = score;
    showScorePop("+30 رفع مانع", 500, 150);

    btnClearObstacle.style.display = "none";
    activeObstacleIndex = null;
  }
});

// وضعیت اولیه بازی
let speed = 0,
  targetSpeed = 0;
const maxSpeed = 14; // سریع تر از نسخه قبل
let score = 0,
  totalPassengers = 10;
let mountPosX = 0,
  railPosX = 0;
let activeObstacleIndex = null;

// انواع مختلف موانع جدید
const obstacleTypes = [
  { icon: "🪵", label: "🪓 خرد کردن چوب‌ها" },
  { icon: "🐄", label: "🔔 زدن زنگ خطر (دور کردن حیوان)" },
  { icon: "🚶", label: "📢 بوق ممتد (اخطار به عابر)" },
];

// چیدمان مپ بازی با موانع رندوم
let elements = [
  { type: "tree", x: 400 },
  {
    type: "station",
    x: 1000,
    name: "ایستگاه مرکزی آلفا",
    passengers: 6,
    visited: false,
  },
  { type: "tree", x: 1500 },
  { type: "obstacle", x: 2000, active: true, info: getRandomObstacle() },
  { type: "tree", x: 2600 },
  {
    type: "station",
    x: 3200,
    name: "ایستگاه نیو توکیو",
    passengers: 9,
    visited: false,
  },
  { type: "tree", x: 3900 },
  { type: "obstacle", x: 4400, active: true, info: getRandomObstacle() },
  {
    type: "station",
    x: 5100,
    name: "ایستگاه اکسپرس ساحلی",
    passengers: 14,
    visited: false,
  },
];
const mapLength = 6000;

function getRandomObstacle() {
  return obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
}

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
      for (let i = 0; i < el.passengers; i++) {
        pDiv.innerHTML += `<div class="person"><div class="person-head"></div><div class="person-body"></div></div>`;
      }
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

function showScorePop(text, x, y) {
  let pop = document.createElement("div");
  pop.className = "score-pop";
  pop.innerText = text;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  gameContainer.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

let wheelRotation = 0;
function animateWheels() {
  if (speed > 0.1) {
    wheelRotation += speed * 2.5;
    wheels.forEach((w) => (w.style.transform = `rotate(${wheelRotation}deg)`));
  }
}

function gameLoop() {
  speed += (targetSpeed - speed) * 0.05;
  if (speed < 0.02) speed = 0;

  speedVal.innerText = Math.round(speed * 25); // سرعت قطارهای سریع السیر بیشتر است
  animateWheels();

  if (speed > 0) {
    railPosX -= speed;
    if (railPosX <= -950) railPosX = 0;
    railway.style.transform = `translateX(${railPosX}px)`;

    mountPosX -= speed * 0.12;
    if (mountPosX <= -950) mountPosX = 0;
    mountains.style.transform = `translateX(${mountPosX}px)`;
  }

  let trainFrontX = 60 + 6 * 95; // نوک جلوی قطار سریع‌السیر
  let showAlert = false;
  let obstacleNear = false;

  elements.forEach((el, index) => {
    el.x -= speed;

    // تکرار مپ
    if (el.x < -300) {
      el.x += mapLength;
      if (el.type === "station") {
        el.visited = false;
        el.passengers = Math.floor(Math.random() * 6) + 4;
      }
      if (el.type === "obstacle") {
        el.active = true;
        el.info = getRandomObstacle();
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
        if (!el.active) {
          dom.style.display = "none";
        } else {
          dom.style.display = "flex";
          dom.innerText = el.info.icon;
        }
      }
    }

    // ۱. منطق ایستگاه
    if (el.type === "station") {
      let distanceToStation = el.x - trainFrontX;
      if (distanceToStation > 0 && distanceToStation < 350 && !el.visited) {
        showAlert = true;
      }

      if (el.x > 250 && el.x < 420 && speed === 0 && !el.visited) {
        el.visited = true;
        let points = el.passengers * 60;
        score += points;
        totalPassengers += el.passengers;
        scoreVal.innerText = score;
        el.passengers = 0;
        let pDiv = dom.querySelector(".station-passengers");
        if (pDiv) pDiv.innerHTML = "";
        updateWagonPassengers();
        showScorePop(`+${points} امتیاز ایستگاه`, 450, 140);
      }
    }

    // ۲. منطق نزدیک شدن به مانع و مدیریت اکشن
    if (el.type === "obstacle" && el.active) {
      let distanceToObstacle = el.x - trainFrontX;

      // بازیکن مانع را می‌بیند و دکمه اکشن فعال می‌شود
      if (distanceToObstacle > 0 && distanceToObstacle < 400) {
        obstacleNear = true;
        activeObstacleIndex = index;
        btnClearObstacle.innerText = el.info.label;
        btnClearObstacle.style.display = "block";
      }

      // تصادف (برخورد فیزیکی)
      if (distanceToObstacle > -10 && distanceToObstacle < 30) {
        if (speed > 1) {
          score = Math.max(0, score - 150);
          scoreVal.innerText = score;
          showScorePop(`⛔ تصادف! 150-`, trainFrontX - 40, 160);
          totalPassengers = Math.max(0, totalPassengers - 4);
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
