const sceneryLayer = document.getElementById("scenery-layer");
const mountains = document.getElementById("mountains");
const railway = document.getElementById("railway");
const speedVal = document.getElementById("speed-val");
const scoreVal = document.getElementById("score-val");
const passengersVal = document.getElementById("passengers-val");
const stationAlert = document.getElementById("station-alert");
const wheels = document.querySelectorAll(".wheel");
const wagons = document.querySelectorAll(".wagon-windows");

// دکمه‌ها
document
  .getElementById("btn-fast")
  .addEventListener(
    "click",
    () => (targetSpeed = Math.min(maxSpeed, targetSpeed + 2.5)),
  );
document
  .getElementById("btn-slow")
  .addEventListener(
    "click",
    () => (targetSpeed = Math.max(0, targetSpeed - 2.5)),
  );
document
  .getElementById("btn-stop")
  .addEventListener("click", () => (targetSpeed = 0));

// وضعیت بازی
let speed = 0;
let targetSpeed = 0;
const maxSpeed = 10;
let score = 0;
let totalPassengers = 15;

let mountPosX = 0;
let railPosX = 0;

// لیست دقیق المان‌های چیدمان نقشه بازی (موقعیت بر اساس پیکسل)
let elements = [
  { type: "tree", x: 400 },
  { type: "tree", x: 700 },
  {
    type: "station",
    x: 1100,
    name: "ایستگاه شیراز",
    passengers: 5,
    visited: false,
  },
  { type: "tree", x: 1600 },
  { type: "obstacle", x: 2100, active: true },
  { type: "tree", x: 2500 },
  {
    type: "station",
    x: 3000,
    name: "ایستگاه تهران",
    passengers: 8,
    visited: false,
  },
  { type: "tree", x: 3600 },
  { type: "obstacle", x: 4100, active: true },
  {
    type: "station",
    x: 4800,
    name: "ایستگاه مشهد",
    passengers: 12,
    visited: false,
  },
];

// طول کل مپ بازی برای لوپ شدن دوباره آن
const mapLength = 5600;

// رندر اولیه مسافران داخل واگن‌ها
function updateWagonPassengers() {
  wagons.forEach((wagon, index) => {
    wagon.innerHTML = "";
    // بر اساس تعداد مسافران کل، سرها را در پنجره واگن‌ها پخش می‌کنیم
    let passengersInThisWagon = Math.min(
      4,
      Math.max(
        0,
        Math.floor(totalPassengers / wagons.length) +
          (index < totalPassengers % wagons.length ? 1 : 0),
      ),
    );
    for (let i = 0; i < passengersInThisWagon; i++) {
      let head = document.createElement("div");
      head.className = "passenger-head";
      wagon.appendChild(head);
    }
  });
  passengersVal.innerText = totalPassengers;
}

// ایجاد فیزیکی المان‌ها در صفحه HTML
function createMapElements() {
  sceneryLayer.innerHTML = "";
  elements.forEach((el, index) => {
    let div = document.createElement("div");
    if (el.type === "tree") {
      div.className = "tree";
    } else if (el.type === "station") {
      div.className = "station";
      div.innerHTML = `<div class="station-sign">${el.name}</div>`;

      // افزودن آدمک‌های ایستگاه
      let pDiv = document.createElement("div");
      pDiv.className = "station-passengers";
      for (let i = 0; i < el.passengers; i++) {
        pDiv.innerHTML += `<div class="person"><div class="person-head"></div><div class="person-body"></div></div>`;
      }
      div.appendChild(pDiv);
    } else if (el.type === "obstacle") {
      div.className = "obstacle";
      div.innerText = "🚧";
      if (!el.active) div.style.display = "none";
    }
    div.id = "el-" + index;
    div.style.left = el.x + "px";
    sceneryLayer.appendChild(div);
  });
}

// نمایش پاپ آپ امتیاز
function showScorePop(text, x, y) {
  let pop = document.createElement("div");
  pop.className = "score-pop";
  pop.innerText = text;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  document.getElementById("game-container").appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
}

// انیمیشن چرخ‌ها بر اساس سرعت قطار
let wheelRotation = 0;
function animateWheels() {
  if (speed > 0.1) {
    wheelRotation += speed * 2;
    wheels.forEach((w) => (w.style.transform = `rotate(${wheelRotation}deg)`));
  }
}

// مدیریت منطق اصلی و جابجایی مپ (Game Loop)
function gameLoop() {
  // شتاب گیری و ترمز نرم
  speed += (targetSpeed - speed) * 0.04;
  if (speed < 0.02) speed = 0;

  speedVal.innerText = Math.round(speed * 15);
  animateWheels();

  // حرکت ریل و کوه‌ها
  if (speed > 0) {
    railPosX -= speed;
    if (railPosX <= -900) railPosX = 0;
    railway.style.transform = `translateX(${railPosX}px)`;

    mountPosX -= speed * 0.15;
    if (mountPosX <= -900) mountPosX = 0;
    mountains.style.transform = `translateX(${mountPosX}px)`;
  }

  let trainFrontX = 80 + 6 * 85; // موقعیت جلوی قطار در کانتینر بازی
  let showAlert = false;

  // جابجایی تمام المان‌های محیطی به سمت چپ (شبیه‌سازی حرکت قطار)
  elements.forEach((el, index) => {
    el.x -= speed;

    // لوپ بی‌نهایت نقشه بازی
    if (el.x < -300) {
      el.x += mapLength;
      if (el.type === "station") {
        el.visited = false;
        el.passengers = Math.floor(Math.random() * 5) + 4;
      }
      if (el.type === "obstacle") el.active = true;

      // بازسازی المان در موقعیت جدید
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
      if (el.type === "obstacle" && !el.active) dom.style.display = "none";
      if (el.type === "obstacle" && el.active) dom.style.display = "flex";
    }

    // ۱. منطق توقف واقعی در ایستگاه
    if (el.type === "station") {
      let distanceToStation = el.x - trainFrontX;
      if (distanceToStation > 0 && distanceToStation < 300 && !el.visited) {
        showAlert = true;
      }

      // قطار داخل ایستگاه متوقف شده است
      if (el.x > 300 && el.x < 450 && speed === 0 && !el.visited) {
        el.visited = true;
        let earnedPoints = el.passengers * 50;
        score += earnedPoints;
        totalPassengers += el.passengers;
        scoreVal.innerText = score;

        // خالی کردن مسافرین ایستگاه
        el.passengers = 0;
        let pDiv = dom.querySelector(".station-passengers");
        if (pDiv) pDiv.innerHTML = "";

        updateWagonPassengers();
        showScorePop(`+${earnedPoints} امتیاز (مسافرگیری)`, 400, 150);
      }
    }

    // ۲. منطق برخورد با مانع
    if (el.type === "obstacle" && el.active) {
      let distanceToObstacle = el.x - trainFrontX;
      if (distanceToObstacle > -20 && distanceToObstacle < 30) {
        if (speed > 1) {
          // جریمه تصادف
          score = Math.max(0, score - 100);
          scoreVal.innerText = score;
          showScorePop(`⛔ تصادف! 100-`, trainFrontX - 50, 180);

          totalPassengers = Math.max(0, totalPassengers - 3);
          updateWagonPassengers();
        }
        el.active = false;
        targetSpeed = 0;
        speed = 0;
      }
    }
  });

  stationAlert.style.display = showAlert ? "block" : "none";

  requestAnimationFrame(gameLoop);
}

// راه اندازی اولیه بازی
createMapElements();
updateWagonPassengers();
gameLoop();
