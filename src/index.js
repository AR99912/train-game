const sceneryLayer = document.getElementById("scenery-layer");
const mountainBox = document.getElementById("mountain-box");
const mountains = document.getElementById("mountains");
const mountainCaps = document.getElementById("mountain-caps");
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

const cloud1 = document.getElementById("cloud1");
const cloud2 = document.getElementById("cloud2");
let cloud1X = 100,
  cloud2X = 500;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playHornSound() {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    setTimeout(() => osc.stop(), 150);
  } catch (e) {}
}

document.getElementById("btn-fast").addEventListener("click", () => {
  targetSpeed = Math.min(maxSpeed, targetSpeed + 3.5);
});
document.getElementById("btn-slow").addEventListener("click", () => {
  targetSpeed = Math.max(0, targetSpeed - 3.5);
});
document.getElementById("btn-stop").addEventListener("click", () => {
  targetSpeed = 0;
});

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

// سیستم پیشرفته جلوه‌های ۴ فصل
const seasons = ["summer", "autumn", "winter", "spring"];
const seasonLabels = {
  summer: "تابستان☀️",
  autumn: "پاییز🍁",
  winter: "زمستان❄️",
  spring: "بهار🌸",
};
let currentSeasonIndex = 0;
let weatherParticles = [];
let lightningTimer = 0;

btnWeather.addEventListener("click", () => {
  currentSeasonIndex = (currentSeasonIndex + 1) % seasons.length;
  let currentSeason = seasons[currentSeasonIndex];
  btnWeather.innerText = `🌦️ فصل: ${seasonLabels[currentSeason]}`;

  // مدیریت پوشش برف کوه‌ها متناسب با زمستان 🏔️
  if (currentSeason === "winter") {
    mountainCaps.style.opacity = "1";
  } else {
    mountainCaps.style.opacity = "0";
  }
  initWeatherFX(currentSeason);
});

function initWeatherFX(season) {
  weatherParticles.forEach((p) => p.element.remove());
  weatherParticles = [];
  gameContainer.classList.remove("lightning-flash");

  let count = 0;
  if (season === "winter")
    count = 45; // دانه برف
  else if (season === "spring")
    count = 50; // باران شدید
  else if (season === "autumn")
    count = 35; // باران + برگ پاییزی
  else if (season === "summer") count = 12; // خطوط وزش باد

  for (let i = 0; i < count; i++) {
    let p = document.createElement("div");
    p.className = "weather-particle";

    let pObj = {
      element: p,
      type: season,
      x: Math.random() * 950,
      y: Math.random() * 480,
      speedY: 0,
      speedX: 0,
    };

    if (season === "winter") {
      p.style.background = "#fff";
      p.style.borderRadius = "50%";
      let size = Math.random() * 4 + 2;
      p.style.width = size + "px";
      p.style.height = size + "px";
      pObj.speedY = Math.random() * 1.5 + 1;
      pObj.speedX = Math.random() * 0.8 - 0.2;
    } else if (season === "spring") {
      p.style.background = "linear-gradient(to bottom, transparent, #93c5fd)";
      p.style.width = "2px";
      p.style.height = Math.random() * 18 + 12 + "px";
      p.style.transform = "rotate(-15deg)";
      pObj.speedY = Math.random() * 8 + 7;
      pObj.speedX = -2;
    } else if (season === "autumn") {
      if (Math.random() > 0.4) {
        // قطرات باران پاییز
        p.style.background =
          "linear-gradient(to bottom, transparent, rgba(148,163,184,0.6))";
        p.style.width = "1.5px";
        p.style.height = "14px";
        pObj.speedY = Math.random() * 5 + 5;
        pObj.speedX = -0.5;
      } else {
        // برگ‌های ریز پاییزی
        let colors = ["#f97316", "#eab308", "#ca8a04", "#b45309"];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = "2px 8px 2px 8px";
        let size = Math.random() * 5 + 4;
        p.style.width = size + "px";
        p.style.height = size - 1 + "px";
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        pObj.speedY = Math.random() * 1.2 + 0.8;
        pObj.speedX = Math.random() * 1.5 + 1; // حرکت رقصان همراه با باد
      }
    } else if (season === "summer") {
      // افکت خطوط افقی جریان هوای داغ
      p.style.background =
        "linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)";
      p.style.width = Math.random() * 90 + 60 + "px";
      p.style.height = "1.5px";
      pObj.speedY = 0;
      pObj.speedX = -(Math.random() * 6 + 10); // حرکت بسیار سریع افقی به چپ
    }

    p.style.left = pObj.x + "px";
    p.style.top = pObj.y + "px";
    gameContainer.appendChild(p);
    weatherParticles.push(pObj);
  }
}

function updateWeatherFX() {
  let currentSeason = seasons[currentSeasonIndex];

  // شبیه‌سازی مکانیزم رعد و برق اختصاصی بهار ⚡
  if (currentSeason === "spring") {
    lightningTimer++;
    if (lightningTimer > 160) {
      if (Math.random() > 0.97) {
        gameContainer.classList.add("lightning-flash");
        setTimeout(() => gameContainer.classList.remove("lightning-flash"), 60);
        setTimeout(() => {
          if (Math.random() > 0.5) {
            gameContainer.classList.add("lightning-flash");
            setTimeout(
              () => gameContainer.classList.remove("lightning-flash"),
              40,
            );
          }
        }, 150);
        lightningTimer = 0;
      }
    }
  }

  weatherParticles.forEach((p) => {
    p.y += p.speedY;
    p.x += p.speedX;

    // مدیریت فیزیک برخورد و برگشت ذرات به کادر بازی
    if (p.y > 480) {
      p.y = -20;
      p.x = Math.random() * 950;
    }
    if (p.x < -100) {
      p.x = 960;
      p.y = Math.random() * 480;
    }
    if (p.x > 960) {
      p.x = -90;
      p.y = Math.random() * 480;
    }

    p.element.style.top = p.y + "px";
    p.element.style.left = p.x + "px";
  });
}

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

// سیستم مدیریت افکت پاشش قطرات خون غلیظ و اقماری با ابعاد بزرگ‌تر 🩸
function splatterBloodEffect() {
  createPopEffect("💥 برخورد شدید!", 550, 180, "pop-loss");

  // افزایش چشمگیر تعداد ذرات اصلی به ۳۵ لکه
  for (let i = 0; i < 35; i++) {
    // تمرکز پاشش اولیه در لبه‌های جلویی حرکت قطار و پخش تصادفی در کل کادر
    let baseLinesX = 500 + Math.random() * 450;
    bloodSpots.push({
      x: Math.random() > 0.4 ? baseLinesX : Math.random() * bloodCanvas.width,
      y: Math.random() * bloodCanvas.height,
      radius: Math.random() * 38 + 12, // ابعاد بزرگتر لکه‌های اصلی
      alpha: 1.0,
      type: "drop",
    });
  }

  // اضافه کردن ۴۰ لکه فرعی اقماری بسیار ریز جهت حس پاشش داینامیک مایع بر شیشه دوربین
  for (let j = 0; j < 40; j++) {
    bloodSpots.push({
      x: Math.random() * bloodCanvas.width,
      y: Math.random() * bloodCanvas.height,
      radius: Math.random() * 6 + 2,
      alpha: 0.85,
      type: "spray",
    });
  }
}

function drawBloodSplatter() {
  ctx.clearRect(0, 0, bloodCanvas.width, bloodCanvas.height);
  for (let i = bloodSpots.length - 1; i >= 0; i--) {
    let spot = bloodSpots[i];
    ctx.beginPath();

    if (spot.type === "drop") {
      ctx.fillStyle = `rgba(153, 27, 27, ${spot.alpha})`; // قرمز تیره و غلیظ متراکم
      ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
      ctx.fill();

      // سایه اقماری جانبی متصل به لکه اصلی
      ctx.beginPath();
      ctx.fillStyle = `rgba(185, 28, 28, ${spot.alpha * 0.85})`;
      ctx.arc(
        spot.x + spot.radius * 0.4,
        spot.y + spot.radius * 0.3,
        spot.radius * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    } else {
      // رندر ذرات اقماری ریز پاشیده شده
      ctx.fillStyle = `rgba(127, 29, 29, ${spot.alpha})`;
      ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    spot.alpha -= 0.0025; // کاهش سرعت محو شدن لکه‌ها برای ماندگاری طولانی‌تر حس سینمایی
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
  updateWeatherFX(); // موتور پویای ذرات آب و هوا

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
    mountainBox.style.transform = `translateX(${mountPosX}px)`;

    cloud1X -= speed * 0.2;
    if (cloud1X < -150) cloud1X = 1000;
    cloud2X -= speed * 0.15;
    if (cloud2X < -150) cloud2X = 1000;
    cloud1.style.left = cloud1X + "px";
    cloud2.style.left = cloud2X + "px";
  }

  let trainFrontX = 60 + 6 * 95;
  let showAlert = false;

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
    let distanceKm = Math.max(
      0,
      ((nextStation.x - trainFrontX) / 100).toFixed(1),
    );
    document.getElementById("distance-val").innerText = distanceKm;

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

      if (distanceToObstacle > -10 && distanceToObstacle < 30) {
        if (speed > 1) {
          if (el.info.isLiving) {
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

resetMapData();
createMapElements();
updateWagonPassengers();
initWeatherFX("summer"); // لود اولیه افکت تابستانی بازی
gameLoop();
