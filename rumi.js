(() => {
  "use strict";

  const canvas = document.querySelector("#rumi-canvas");
  const stage = document.querySelector(".rumi-stage");
  const heartLayer = document.querySelector("#heart-layer");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 800px)");
  const atlas = new Image();
  atlas.src = "assets/sprites/sheet.png";

  const manifest = createEmbeddedManifest();
  let context;
  let animationFrame;
  let pageVisible = !document.hidden;

  const runtime = {
    animation: "idle",
    frame: 0,
    frameStarted: performance.now(),
    reverse: false,
    next: null,
    nextFidget: performance.now() + randomBetween(4000, 10000),
    lastPointer: 0,
    pointerX: 0,
    pointerY: 0,
    lastStroke: 0,
    lastStrokeX: 0,
    lastStrokeY: 0,
    wasOverCat: false,
    strokeDistance: 0,
    petLevel: 0,
    nextHeart: 0,
    hiddenAt: 0,
    hearts: []
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createEmbeddedManifest() {
    const animationData = {
      idle: [[0, 50], [1800, 1500], true, null],
      blink: [[100, 150, 100, 0], [55, 80, 55, 250], false, "idle"],
      tail_flick: [[200, 0, 200, 0], [110, 80, 100, 250], false, "idle"],
      ear_twitch: [[250, 0, 250, 0], [90, 60, 70, 250], false, "idle"],
      squint_in: [[100, 1550], [50, 120], false, "squint"],
      squint: [[1550, 1600], [1800, 1500], true, null],
      purr_in: [[1550, 1650], [60, 90], false, "purr"],
      purr: [[1650, 1700, 1650, 1600], [110, 110, 100, 120], true, null],
      purr_out: [[1550, 100], [100, 120], false, "idle"]
    };
    const animations = {};
    const frames = {};

    for (const [name, [frameXs, durations, loop, next]] of Object.entries(animationData)) {
      animations[name] = { frames: frameXs, durations_ms: durations, loop, next };
      frameXs.forEach((x, index) => {
        frames[`${name}:${index}`] = [x, 0, 50, 50];
      });
    }

    Object.assign(frames, {
      "held:1": [800, 0, 50, 50],
      "peek_right:0": [950, 0, 50, 50],
      "ready:0": [2900, 0, 50, 50],
      "leap:2": [3400, 0, 50, 50],
      "hungry:0": [1750, 0, 50, 50],
      "alert:0": [550, 0, 50, 50],
      "sleep:0": [3850, 0, 50, 50],
      "sleep:1": [3900, 0, 50, 50],
      "stretch:4": [2400, 0, 50, 50],
      "peek_left:0": [1100, 0, 50, 50],
      "look:-1,-1": [4150, 0, 50, 50],
      "look:-1,0": [4200, 0, 50, 50],
      "look:-1,1": [4250, 0, 50, 50],
      "look:0,-1": [4300, 0, 50, 50],
      "look:0,0": [0, 0, 50, 50],
      "look:0,1": [4350, 0, 50, 50],
      "look:1,-1": [4400, 0, 50, 50],
      "look:1,0": [4450, 0, 50, 50],
      "look:1,1": [4500, 0, 50, 50]
    });

    return {
      animations,
      sheet: { frames },
      props: {
        heart: {
          width: 9,
          height: 9,
          frames: ["props/heart_0.png", "props/heart_1.png", "props/heart_2.png", "props/heart_3.png", "props/heart_4.png"],
          durations_ms: [80, 90, 130, 170, 220],
          registration: { x: 4, y: 7 },
          // The manifest anchors hearts at y 2, which suits the app because its
          // overlay window extends above the 50x50 sprite. Here the sprite is the
          // whole stage, so that birth point throws them clear of him and up
          // towards the menu bar. Born at his ear line instead: he is opaque from
          // row 8, so they rise through the empty band above his head.
          anchor: { x: 21, y: 12 },
          anchor_jitter: { x: 6, y: 2 }
        },
        heart_small: {
          width: 7,
          height: 7,
          frames: ["props/heart_small_0.png", "props/heart_small_1.png", "props/heart_small_2.png", "props/heart_small_3.png"],
          durations_ms: [80, 150, 190, 230],
          registration: { x: 3, y: 5 },
          anchor: { x: 21, y: 13 },
          anchor_jitter: { x: 8, y: 3 }
        }
      }
    };
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  function frameKey(animationName, index) {
    return `${animationName}:${index}`;
  }

  function draw(animationName, index = 0) {
    const rect = manifest?.sheet?.frames?.[frameKey(animationName, index)];
    if (!rect || !context || !atlas.complete) return;
    context.clearRect(0, 0, 50, 50);
    context.imageSmoothingEnabled = false;
    context.drawImage(atlas, rect[0], rect[1], rect[2], rect[3], 0, 0, 50, 50);
  }

  function setAnimation(name, options = {}) {
    if (!manifest.animations[name]) return;
    runtime.animation = name;
    runtime.reverse = Boolean(options.reverse);
    runtime.next = options.next ?? null;
    runtime.frame = runtime.reverse ? manifest.animations[name].frames.length - 1 : 0;
    runtime.frameStarted = performance.now();
  }

  function finishAnimation(now) {
    const definition = manifest.animations[runtime.animation];
    if (definition.loop) {
      runtime.frame = runtime.reverse ? definition.frames.length - 1 : 0;
      runtime.frameStarted = now;
      return;
    }

    const next = runtime.next || definition.next || "idle";
    setAnimation(next);
    if (next === "idle") {
      runtime.nextFidget = now + randomBetween(4000, 10000);
    }
  }

  function advanceAnimation(now) {
    const definition = manifest.animations[runtime.animation];
    const durationIndex = runtime.frame;
    if (now - runtime.frameStarted < definition.durations_ms[durationIndex]) return;

    runtime.frameStarted += definition.durations_ms[durationIndex];
    runtime.frame += runtime.reverse ? -1 : 1;

    if (runtime.frame < 0 || runtime.frame >= definition.frames.length) {
      finishAnimation(now);
    }
  }

  function cursorDirection(now) {
    if (now - runtime.lastPointer > 2500) return null;
    const rect = stage.getBoundingClientRect();
    const centreX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height * 0.38;
    const deadZone = rect.width / 6;
    const dx = runtime.pointerX < centreX - deadZone ? -1 : runtime.pointerX > centreX + deadZone ? 1 : 0;
    const dy = runtime.pointerY < eyeY - deadZone ? -1 : runtime.pointerY > eyeY + deadZone ? 1 : 0;
    return { dx, dy };
  }

  function chooseFidget() {
    const choices = [
      ["blink", 50],
      ["tail_flick", 20],
      ["ear_twitch", 15]
    ];
    const pick = Math.random() * choices.reduce((sum, item) => sum + item[1], 0);
    let running = 0;
    for (const [name, weight] of choices) {
      running += weight;
      if (pick <= running) return name;
    }
    return "blink";
  }

  function beginPet(level) {
    if (level === 1 && runtime.petLevel === 0) {
      runtime.petLevel = 1;
      setAnimation("squint_in");
    }
    if (level === 2 && runtime.petLevel < 2) {
      runtime.petLevel = 2;
      setAnimation("purr_in");
      runtime.nextHeart = performance.now();
    }
  }

  function endPet() {
    if (runtime.petLevel === 2) {
      setAnimation("purr_out");
    } else if (runtime.petLevel === 1) {
      setAnimation("squint_in", { reverse: true, next: "idle" });
    }
    runtime.petLevel = 0;
    runtime.strokeDistance = 0;
    runtime.wasOverCat = false;
  }

  function trackPointer(event) {
    const now = performance.now();
    runtime.pointerX = event.clientX;
    runtime.pointerY = event.clientY;
    runtime.lastPointer = now;

    const rect = stage.getBoundingClientRect();
    const overCat =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (overCat && runtime.wasOverCat && now - runtime.lastStroke < 220) {
      const travelled = Math.hypot(event.clientX - runtime.lastStrokeX, event.clientY - runtime.lastStrokeY);
      if (travelled > 1 && travelled < rect.width / 2) {
        runtime.strokeDistance += travelled;
        if (runtime.strokeDistance >= rect.width) beginPet(2);
        else if (runtime.strokeDistance >= rect.width / 5) beginPet(1);
      }
    }

    if (overCat) {
      runtime.lastStroke = now;
      runtime.lastStrokeX = event.clientX;
      runtime.lastStrokeY = event.clientY;
    }
    runtime.wasOverCat = overCat;
  }

  function spawnHeart(now) {
    const small = Math.random() < 0.45;
    const propName = small ? "heart_small" : "heart";
    const prop = manifest.props[propName];
    const image = document.createElement("img");
    // The stage hugs his silhouette, so the sprite scale comes from the canvas.
    const scale = canvas.clientWidth / 50;
    const jitter = randomBetween(-prop.anchor_jitter.x, prop.anchor_jitter.x);
    const startX = (prop.anchor.x - prop.registration.x + jitter) * scale;
    const startY = (prop.anchor.y - prop.registration.y + randomBetween(-prop.anchor_jitter.y, prop.anchor_jitter.y)) * scale;
    const rise = randomBetween(2, 5) * scale;
    const heart = { image, prop, propName, start: now, startX, startY, rise, lastFrame: -1 };

    image.className = "heart";
    image.alt = "";
    image.width = prop.width * scale;
    image.height = prop.height * scale;
    image.style.width = `${prop.width * scale}px`;
    image.style.height = `${prop.height * scale}px`;
    heartLayer.appendChild(image);
    runtime.hearts.push(heart);
  }

  function updateHearts(now) {
    runtime.hearts = runtime.hearts.filter((heart) => {
      const age = now - heart.start;
      if (age >= 690 || reduceMotion.matches || runtime.petLevel < 2) {
        heart.image.remove();
        return false;
      }

      let elapsed = 0;
      let frame = heart.prop.frames.length - 1;
      for (let index = 0; index < heart.prop.durations_ms.length; index += 1) {
        elapsed += heart.prop.durations_ms[index];
        if (age < elapsed) {
          frame = index;
          break;
        }
      }
      if (frame !== heart.lastFrame) {
        heart.image.src = `assets/sprites/${heart.prop.frames[frame]}`;
        heart.lastFrame = frame;
      }
      const progress = age / 690;
      heart.image.style.left = `${heart.startX}px`;
      heart.image.style.top = `${heart.startY - heart.rise * progress}px`;
      return true;
    });
  }

  function tick(now) {
    if (!pageVisible) return;

    if (runtime.petLevel > 0 && now - runtime.lastStroke >= 800) endPet();

    if (runtime.petLevel === 2 && !reduceMotion.matches && now >= runtime.nextHeart) {
      spawnHeart(now);
      runtime.nextHeart = now + randomBetween(140, 240);
    }
    updateHearts(now);

    if (reduceMotion.matches) {
      runtime.petLevel = 0;
      runtime.strokeDistance = 0;
      const direction = cursorDirection(now);
      if (direction && (direction.dx !== 0 || direction.dy !== 0)) draw(`look:${direction.dx},${direction.dy}`);
      else draw("idle", 0);
      animationFrame = requestAnimationFrame(tick);
      return;
    }

    if (
      runtime.animation === "idle" &&
      runtime.petLevel === 0 &&
      now >= runtime.nextFidget &&
      now - runtime.lastPointer > 2500
    ) {
      setAnimation(chooseFidget());
    }

    advanceAnimation(now);

    const direction = runtime.animation === "idle" && runtime.petLevel === 0 ? cursorDirection(now) : null;
    if (direction && (direction.dx !== 0 || direction.dy !== 0)) {
      draw(`look:${direction.dx},${direction.dy}`);
    } else {
      draw(runtime.animation, runtime.frame);
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function setupClipWindows() {
    const windows = document.querySelectorAll(".clip-window");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target.querySelector("video");
          if (video) video.dataset.visible = entry.isIntersecting ? "true" : "false";
          if (!video || reduceMotion.matches) {
            video?.pause();
            continue;
          }
          if (entry.isIntersecting) {
            if (!video.dataset.requested) {
              video.dataset.requested = "true";
              video.load();
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.35 }
    );

    for (const clipWindow of windows) {
      const video = clipWindow.querySelector("video");
      video.addEventListener("loadeddata", () => clipWindow.classList.add("has-video"));
      observer.observe(clipWindow);
    }

    reduceMotion.addEventListener("change", () => {
      for (const video of document.querySelectorAll(".clip-window video")) video.pause();
    });
  }

  function drawStillCanvases() {
    for (const still of document.querySelectorAll("canvas[data-frame]")) {
      const rect = manifest.sheet.frames[still.dataset.frame];
      if (!rect) continue;
      const stillContext = still.getContext("2d");
      stillContext.imageSmoothingEnabled = false;
      stillContext.clearRect(0, 0, 50, 50);
      stillContext.drawImage(atlas, rect[0], rect[1], rect[2], rect[3], 0, 0, 50, 50);
    }
  }

  function setupOptionalPhoto() {
    const photo = document.querySelector("#rumi-photo");
    const reveal = () => {
      if (!photo.naturalWidth) return;
      photo.hidden = false;
      photo.closest(".about__portrait").classList.add("has-photo");
    };
    photo.addEventListener("load", reveal);
    if (photo.complete) reveal();
  }

  async function copyPageLink() {
    const pageUrl = new URL(window.location.href);
    pageUrl.hash = "";
    pageUrl.search = "";
    try {
      await navigator.clipboard.writeText(pageUrl.href);
      return true;
    } catch {
      const input = document.createElement("textarea");
      input.value = pageUrl.href;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      return copied;
    }
  }

  function setupDownloadButtons() {
    for (const button of document.querySelectorAll(".download-button")) {
      button.addEventListener("click", async (event) => {
        if (!mobileLayout.matches) return;
        event.preventDefault();
        const copied = await copyPageLink();
        const section = button.closest("section") || button.parentElement;
        const status = section.querySelector(".copy-status");
        status.textContent = copied ? "Link copied — send it to your Mac." : "Copy this page’s address and send it to your Mac.";
      });
    }
  }

  function handleVisibility() {
    pageVisible = !document.hidden;
    if (!pageVisible) {
      runtime.hiddenAt = performance.now();
      cancelAnimationFrame(animationFrame);
      for (const video of document.querySelectorAll(".clip-window video")) video.pause();
      return;
    }
    const now = performance.now();
    const pausedFor = runtime.hiddenAt ? now - runtime.hiddenAt : 0;
    runtime.frameStarted += pausedFor;
    runtime.nextFidget += pausedFor;
    runtime.lastPointer += pausedFor;
    runtime.lastStroke += pausedFor;
    runtime.nextHeart += pausedFor;
    for (const heart of runtime.hearts) heart.start += pausedFor;
    runtime.hiddenAt = 0;
    if (!reduceMotion.matches) {
      for (const video of document.querySelectorAll('.clip-window video[data-visible="true"]')) {
        video.play().catch(() => {});
      }
    }
    animationFrame = requestAnimationFrame(tick);
  }

  const atlasReady = atlas.complete && atlas.naturalWidth
    ? Promise.resolve()
    : new Promise((resolve, reject) => {
        atlas.onload = resolve;
        atlas.onerror = reject;
      });

  atlasReady
    .then(() => {
      context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      drawStillCanvases();
      setupOptionalPhoto();
      draw("idle", 0);
      animationFrame = requestAnimationFrame(tick);
    })
    .catch(() => {
      context = canvas.getContext("2d");
    });

  for (const name of [
    "heart_0.png",
    "heart_1.png",
    "heart_2.png",
    "heart_3.png",
    "heart_4.png",
    "heart_small_0.png",
    "heart_small_1.png",
    "heart_small_2.png",
    "heart_small_3.png"
  ]) {
    loadImage(`assets/sprites/props/${name}`).catch(() => {});
  }

  window.addEventListener("pointermove", trackPointer, { passive: true });
  window.addEventListener("pointerdown", trackPointer, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  setupClipWindows();
  setupDownloadButtons();
})();
