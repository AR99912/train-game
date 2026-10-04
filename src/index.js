// گرفتن المان‌های DOM
const mountains = document.getElementById("mountains");
const sceneryLayer = document.getElementById("scenery-layer");
const railway = document.getElementById("railway");
const speedVal = document.getElementById("speed-val");

const btnFast = document.getElementById("btn-fast");
const btnSlow = document.getElementById("btn-slow");
const btnStop = document.getElementById("btn-stop");

// متغیرهای وضعیت بازی
let speed = 0; // سرعت فعلی قطار (پیکسل بر فریم)
let maxSpeed = 8;
let targetSpeed = 0; // سرعتی که بازیکن می‌خواهد به آن برسد

// موقعیت افقی لایه‌ها
let mountPosX = 0;
let sceneryPosX = 0;
let railPosX = 0;

// گوش دادن به دکمه‌ها برای تغییر سرعت هدف
btnFast.addEventListener("click", () => {
  targetSpeed = Math.min(maxSpeed, targetSpeed + 2);
});

btnSlow.addEventListener("click", () => {
  targetSpeed = Math.max(0, targetSpeed - 2);
});

btnStop.addEventListener("click", () => {
  targetSpeed = 0;
});

// حلقه اصلی بازی (Game Loop)
function updateGame() {
  // حرکت نرم سرعت فعلی به سمت سرعت هدف (Interpolation)
  speed += (targetSpeed - speed) * 0.05;

  // به روز رسانی نمایشگر سرعت متناسب با حرکت
  speedVal.innerText = Math.round(speed * 20);

  if (speed > 0.05) {
    // ۱. حرکت ریل با سرعت اصلی
    railPosX -= speed;
    if (railPosX <= -800) railPosX = 0; // تکرار بی‌نهایت ریل
    railway.style.transform = `translateX(${railPosX}px)`;

    // ۲. حرکت لایه درخت‌ها و ایستگاه‌ها با سرعت اصلی
    sceneryPosX -= speed;
    // اگر تمام المان‌ها از صفحه خارج شدند، آن‌ها را به سمت راست برگردان (لوپ محتوا)
    if (sceneryPosX <= -1500) {
      sceneryPosX = 800;
    }
    sceneryLayer.style.transform = `translateX(${sceneryPosX}px)`;

    // ۳. حرکت کوه‌ها در دوردست با سرعت کمتر (ایجاد افکت سه بعدی پارالاکس)
    mountPosX -= speed * 0.2;
    if (mountPosX <= -800) mountPosX = 0;
    mountains.style.transform = `translateX(${mountPosX}px)`;
  }

  // اجرای مجدد فریم بعدی
  requestAnimationFrame(updateGame);
}

// شروع بازی
updateGame();
