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
const btnWeather = document.getElementById("btn-toggle-weather");
const btnHorn = document.getElementById("btn-horn");
const wagons = document.querySelectorAll(".wagon-windows");
const bloodCanvas = document.getElementById("blood-canvas");
const ctx = bloodCanvas.getContext("2d");

// ابرها برای تحرک هوشمند
const cloud1 = document.getElementById("cloud1");
const cloud2 = document.getElementById("cloud2");
let cloud1X = 100,
  cloud2X = 500;

// وب آدیو برای شبیه‌سازی صدای بوق (بیب بیب) کاملاً بومی بدون فایل خارجی
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playHornSound() {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // فرکانس صدا
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    // تولید حالت بیب بیب مقطع کوتاه
    setTimeout(() => osc.stop(), 150);
  } catch (e) {}
}

// فیزیک حرکت
document.getElementById("btn-fast").addEventListener("click", () => {
  targetSpeed = Math.min(maxSpeed, targetSpeed + 3.5);
});
document.getElementById("btn-slow").addEventListener("click", () => {
  targetSpeed = Math.max(0, targetSpeed - 3.5);
});
document.getElementById("btn-stop").addEventListener("click", () => {
  targetSpeed = 0;
});

// چرخه زمان ۴ حالته
const times = ["morning", "noon", "evening", "night"];
const timeLabels = {
  morning: "صبح🌅",
  noon: "ظهر☀️",
  evening: "بعد از ظهر🌇",
  night: "شب🌙",
};
let currentTimeIndex = 1;

btnTime.addEventListener("click", () => {
  gameContainer.classList.remove(...times);
  currentTimeIndex = (currentTimeIndex + 1) % times.length;
  let newTime = times[currentTimeIndex];
  gameContainer.classList.add(newTime);
  btnTime.innerText = `⏰ چرخه زمان (${timeLabels[newTime]})`;
});

// سیستم آب و هوای هوشمند ۴ فصل
const seasons = ["summer", "autumn", "winter", "spring"];
const seasonLabels = {
  summer: "تابستان☀️",
  autumn: "پاییز🍁",
  winter: "زمستان❄️",
  spring: "بهار🌸",
};
let currentSeasonIndex = 0;
let snowParticles = [];

btnWeather.addEventListener("click", () => {
  currentSeasonIndex = (currentSeasonIndex + 1) % seasons.length;
  let currentSeason = seasons[currentSeasonIndex];
  btnWeather.innerText = `🌦️ فصل: ${seasonLabels[currentSeason]}`;

  if (currentSeason === "winter") {
    mountains.classList.add("winter-mountains");
    initSnow();
  } else {
    mountains.classList.remove("winter-mountains");
    clearSnow();
  }
});

function initSnow() {
  clearSnow();
  for (let i = 0; i < 40; i++) {
    let flake = document.createElement("div");
    flake.className = "snowflake";
    flake.style.left = Math.random() * 950 + "px";
    flake.style.width = flake.style.height = Math.random() * 4 + 2 + "px";
    flake.style.animationDuration = Math.random() * 3 + 2 + "s";
    flake.style.animationDelay = Math.random() * 2 + "s";
    gameContainer.appendChild(flake);
    snowParticles.push(flake);
  }
}
function clearSnow() {
  snowParticles.forEach((p) => p.remove());
  snowParticles = [];
}

// عملکرد بوق زدن
function triggerHorn() {
  playHornSound();
  createPopEffect("🔊 بیب بیب!", 600, 200, "pop-horn");
}
btnHorn.addEventListener("click", triggerHorn);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    triggerHorn();
  }
});

// سوییچ رندوم بین ۵ استایل قطار مدرن
const trainStyles = [
  "train-maglev",
  "train-retro",
  "train-cyber",
  "train-gold",
  "train-silver",
];
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

// مدیریت رفع مانع
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

// مقادیر پایه وضعیت بازی
let speed = 0,
  targetSpeed = 0,
  maxSpeed = 15;
let score = 0,
  coins = 0,
  totalPassengers = 8;
let mountPosX = 0,
  railPosX = 0;
let activeObstacleIndex = null;
let bloodSpots = [];

const obstacleTypes = [
  { icon: "🪵", label: "🪓 خرد کردن کنده‌ها", isLiving: false },
  { icon: "🐄", label: "🔔 راندن گله گاوها", isLiving: true },
  { icon: "🚶", label: "📢 بوق اخطار عابر", isLiving: true },
];

let elements = [];
const mapLength = 6200;

function resetMapData() {
  elements = [
    { type: "tree", x: 450 },
    {
      type: "station",
      x: 1000,
      name: "ایستگاه شیراز",
      passengers: 5,
      visited: false,
    },
    { type: "tree", x: 1600 },
    { type: "obstacle", x: 2200, active: true, info: obstacleTypes[0] },
    { type: "tree", x: 2800 },
    {
      type: "station",
      x: 3400,
      name: "ایستگاه تهران",
      passengers: 8,
      visited: false,
    },
    { type: "tree", x: 4100 },
    { type: "obstacle", x: 4700, active: true, info: obstacleTypes[1] },
    { type: "tree", x: 5100 },
    {
      type: "station",
      x: 5700,
      name: "ایستگاه مشهد",
      passengers: 11,
      visited: false,
    },
  ];
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

function createPopEffect(text, x, y, className) {
  let pop = document.createElement("div");
  pop.className = `pop-effect ${className}`;
  pop.innerText = text;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  gameContainer.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

// افکت جذاب پاشیدن لکه‌های خون تصادفی رو تصویر (بدون گیم اور شدن)
function splatterBloodEffect() {
  createPopEffect("💥 برخورد کردی!", 550, 180, "pop-loss");
  // تولید ۱۰ لکه خون تصادفی در کادر تصویر
  for (let i = 0; i < 12; i++) {
    bloodSpots.push({
      x: Math.random() * bloodCanvas.width,
      y: Math.random() * bloodCanvas.height,
      radius: Math.random() * 25 + 8,
      alpha: 0.9,
    });
  }
}

// رندر و محو شدن تدریجی لکه‌های خون روی بوم
function drawBloodSplatter() {
  ctx.clearRect(0, 0, bloodCanvas.width, bloodCanvas.height);
  for (let i = bloodSpots.length - 1; i >= 0; i--) {
    let spot = bloodSpots[i];
    ctx.beginPath();
    ctx.fillStyle = `rgba(185, 28, 28, ${spot.alpha})`;
    ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
    ctx.fill();

    // افزودن چند قطره کوچک اطراف لکه اصلی برای طبیعی تر شدن
    ctx.beginPath();
    ctx.fillStyle = `rgba(153, 27, 27, ${spot.alpha * 0.8})`;
    ctx.arc(
      spot.x + spot.radius * 0.5,
      spot.y + spot.radius * 0.4,
      spot.radius * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    spot.alpha -= 0.004; // سرعت محو شدن لکه‌ها
    if (spot.alpha <= 0) {
      bloodSpots.splice(i, 1);
    }
  }
}

let wheelRotation = 0;
function gameLoop() {
  speed += (targetSpeed - speed) * 0.05;
  if (speed < 0.02) speed = 0;

  let currentDisplaySpeed = Math.round(speed * 22);
  speedVal.innerText = currentDisplaySpeed;

  drawBloodSplatter();

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
    mountMountains(mountPosX);

    cloud1X -= speed * 0.2;
    if (cloud1X < -150) cloud1X = 1000;
    cloud2X -= speed * 0.15;
    if (cloud2X < -150) cloud2X = 1000;
    cloud1.style.left = cloud1X + "px";
    cloud2.style.left = cloud2X + "px";
  }

  let trainFrontX = 60 + 6 * 95;
  let showAlert = false;

  // پیدا کردن نزدیک‌ترین ایستگاه پیش‌رو برای محاسبه کیلومتر و زمان
  let nextStation = null;
  elements.forEach((el) => {
    if (el.type === "station" && el.x - trainFrontX > -100) {
      if (!nextStation || el.x < nextStation.x) {
        nextStation = el;
      }
    }
  });

  if (nextStation) {
    document.getElementById("next-station-name").innerText = nextStation.name;
    // فرمول تبدیل لوکال مختصات به کیلومتر فرضی بازی
    let distanceKm = Math.max(
      0,
      ((nextStation.x - trainFrontX) / 100).toFixed(1),
    );
    document.getElementById("distance-val").innerText = distanceKm;

    // محاسبه زمان باقی مانده بر اساس سرعت لحظه‌ای: T = D / V
    if (currentDisplaySpeed > 0) {
      let etaSeconds = Math.round((distanceKm / currentDisplaySpeed) * 3600);
      if (etaSeconds > 60) {
        document.getElementById("eta-val").innerText =
          `${Math.floor(etaSeconds / 60)} دقیقه`;
      } else {
        document.getElementById("eta-val").innerText = `${etaSeconds} ثانیه`;
      }
    } else {
      document.getElementById("eta-val").innerText = "متوقف شده";
    }
  }

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

    if (el.type === "station") {
      let distanceToStation = el.x - trainFrontX;
      if (distanceToStation > 0 && distanceToStation < 350 && !el.visited) {
        showAlert = true;
      }

      if (el.x > 250 && el.x < 420 && speed === 0 && !el.visited) {
        el.visited = true;

        let leftPassengers = 0;
        if (totalPassengers > 2) {
          leftPassengers = Math.floor(Math.random() * 3) + 1;
          leftPassengers = Math.min(leftPassengers, totalPassengers - 1);
          totalPassengers -= leftPassengers;
          let cashEarned = leftPassengers * 25;
          coins += cashEarned;
          createPopEffect(
            `💸 خروج مسافر: +${cashEarned}🪙`,
            320,
            170,
            "pop-coin",
          );
        }

        let pointsEarned = el.passengers * 50;
        let initialCoins = el.passengers * 15;

        score += pointsEarned;
        coins += initialCoins;
        totalPassengers += el.passengers;

        scoreVal.innerText = score;
        coinVal.innerText = coins;

        el.passengers = 0;
        let pDiv = dom.querySelector(".station-passengers");
        if (pDiv) pDiv.innerHTML = "";

        updateWagonPassengers();

        setTimeout(() => {
          createPopEffect(`+${pointsEarned} Score`, 450, 130, "pop-score");
        }, 200);
      }
    }

    if (el.type === "obstacle" && el.active) {
      let distanceToObstacle = el.x - trainFrontX;

      if (distanceToObstacle > 0 && distanceToObstacle < 400) {
        activeObstacleIndex = index;
        btnClearObstacle.innerText = el.info.label;
        btnClearObstacle.style.display = "block";
      }

      // تلاقی و تصادف قطار با مانع جاندار یا بی‌جان
      if (distanceToObstacle > -10 && distanceToObstacle < 30) {
        if (speed > 1) {
          if (el.info.isLiving) {
            // طبق ایده جدید شما: پاشیدن خون روی تصویر بدون گیم اور یا ریست شدن بازی!
            splatterBloodEffect();
            score = Math.max(0, score - 80);
            scoreVal.innerText = score;
          } else {
            score = Math.max(0, score - 120);
            coins = Math.max(0, coins - 45);
            scoreVal.innerText = score;
            coinVal.innerText = coins;
            createPopEffect(
              `🪵 صدمه به ریل! 120-`,
              trainFrontX - 30,
              150,
              "pop-loss",
            );
            totalPassengers = Math.max(1, totalPassengers - 2);
            updateWagonPassengers();
          }
        }
        el.active = false;
        btnClearObstacle.style.display = "none";
      }
    }
  });

  stationAlert.style.display = showAlert ? "block" : "none";
  requestAnimationFrame(gameLoop);
}

function mountMountains(pos) {
  mountains.style.transform = `translateX(${pos}px)`;
}

// استارت اولیه بازی
resetMapData();
createMapElements();
updateWagonPassengers();
gameLoop();
