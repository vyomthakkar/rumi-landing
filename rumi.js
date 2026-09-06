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

  // Generated from assets/sprites/manifest.json (203 frames). The page must
  // work from file:// where fetch() is blocked, so the table is embedded.
  // REGENERATE THIS WHOLE FUNCTION if the atlas changes: frame offsets shift
  // when animations are inserted, and a stale table silently draws wrong art.
  function createEmbeddedManifest() {
    // name -> x offset in the 7000x50 strip; every frame is 50x50 at y 0.
    const frameX = {
      "alert:2": 0, "alert_out:1": 0, "blink:3": 0, "dart_in:3": 0, "drink:0": 0, "drink:13": 0,
      "ear_twitch:1": 0, "ear_twitch:3": 0, "eat_out:3": 0, "idle:0": 0, "knead_out:1": 0,
      "leap_land:2": 0, "look:0,0": 0, "sleep_out:4": 0, "stretch:0": 0, "stretch:9": 0,
      "tail_flick:1": 0, "tail_flick:3": 0, "type_out:1": 0, "idle:1": 50, "blink:0": 100,
      "blink:2": 100, "purr_out:1": 100, "squint_in:0": 100, "blink:1": 150,
      "tail_flick:0": 200, "tail_flick:2": 200, "ear_twitch:0": 250, "ear_twitch:2": 250,
      "alert_in:0": 300, "alert_in:1": 350, "alert_in:2": 400, "alert_in:3": 450,
      "alert_in:4": 500, "held_out:1": 500, "stretch:1": 500, "stretch:8": 500, "alert:0": 550,
      "alert:1": 600, "alert:3": 600, "alert_out:0": 600, "held_in:0": 650, "held_in:1": 700,
      "held:0": 750, "held:2": 750, "held_in:2": 750, "held:1": 800, "held:3": 850,
      "held_out:0": 900, "peek_right:0": 950, "peek_right:2": 950, "peek_right:1": 1000,
      "peek_right:3": 1050, "peek_left:0": 1100, "peek_left:2": 1100, "peek_left:1": 1150,
      "peek_left:3": 1200, "peek_bottom:0": 1250, "peek_bottom:2": 1250, "peek_bottom:1": 1300,
      "peek_bottom:3": 1350, "peek_top:0": 1400, "peek_top:2": 1400, "peek_top:1": 1450,
      "peek_top:3": 1500, "purr_in:0": 1550, "purr_out:0": 1550, "squint:0": 1550,
      "squint_in:1": 1550, "purr:3": 1600, "squint:1": 1600, "purr:0": 1650, "purr:2": 1650,
      "purr_in:1": 1650, "purr:1": 1700, "hungry:0": 1750, "hungry:2": 1750, "hungry:1": 1800,
      "hungry:3": 1850, "eat_in:0": 1900, "eat_in:1": 1950, "eat:0": 2000, "eat:2": 2000,
      "eat_in:2": 2000, "eat:1": 2050, "eat:3": 2100, "eat_out:0": 2150, "eat_out:1": 2200,
      "eat_out:2": 2250, "stretch:2": 2300, "stretch:7": 2300, "stretch:3": 2350,
      "stretch:5": 2350, "stretch:4": 2400, "stretch:6": 2450, "drink:1": 2500, "drink:2": 2550,
      "drink:3": 2600, "drink:4": 2650, "drink:6": 2650, "drink:8": 2650, "drink:5": 2700,
      "drink:7": 2700, "drink:9": 2700, "drink:10": 2750, "drink:11": 2800, "drink:12": 2850,
      "dart_out:0": 2900, "ready:0": 2900, "ready:1": 2950, "dart_out:1": 3000,
      "dart_out:2": 3050, "dart_out:3": 3100, "dart_travel:0": 3100, "dart_in:0": 3150,
      "dart_in:1": 3200, "leap_land:0": 3200, "dart_in:2": 3250, "leap:0": 3300, "leap:1": 3350,
      "leap:2": 3400, "leap:3": 3450, "leap_land:1": 3500, "catch:0": 3550, "catch:1": 3600,
      "catch:3": 3600, "catch:2": 3650, "catch:4": 3650, "knead_in:0": 3700,
      "knead_out:0": 3700, "knead:1": 3750, "knead:3": 3750, "knead_in:1": 3750,
      "knead:0": 3800, "knead:2": 3850, "type_in:0": 3900, "type_out:0": 3900, "type:0": 3950,
      "type_in:1": 3950, "type_left:1": 3950, "type_right:1": 3950, "type:1": 4000,
      "type_left:0": 4050, "type_right:0": 4100, "sleep_in:0": 4150, "sleep_in:1": 4200,
      "sleep_in:2": 4250, "sleep_out:0": 4250, "sleep:0": 4300, "sleep_in:3": 4300,
      "sleep:1": 4350, "sleep:2": 4400, "sleep_out:1": 4450, "sleep_out:2": 4500,
      "sleep_out:3": 4550, "look:-1,-1": 4600, "look:-1,0": 4650, "look:-1,1": 4700,
      "look:0,-1": 4750, "look:0,1": 4800, "look:1,-1": 4850, "look:1,0": 4900,
      "look:1,1": 4950, "ready_look:-1,-1": 5000, "ready_look:-1,0": 5050,
      "ready_look:-1,1": 5100, "ready_look:0,-1": 5150, "ready_look:0,1": 5200,
      "ready_look:1,-1": 5250, "ready_look:1,0": 5300, "ready_look:1,1": 5350,
      "peek_right:look:-1,-1": 5400, "peek_right:look:0,-1": 5450, "peek_right:look:1,-1": 5500,
      "peek_right:look:-1,0": 5550, "peek_right:look:1,0": 5600, "peek_right:look:-1,1": 5650,
      "peek_right:look:0,1": 5700, "peek_right:look:1,1": 5750, "peek_left:look:-1,-1": 5800,
      "peek_left:look:0,-1": 5850, "peek_left:look:1,-1": 5900, "peek_left:look:-1,0": 5950,
      "peek_left:look:1,0": 6000, "peek_left:look:-1,1": 6050, "peek_left:look:0,1": 6100,
      "peek_left:look:1,1": 6150, "peek_bottom:look:-1,-1": 6200, "peek_bottom:look:0,-1": 6250,
      "peek_bottom:look:1,-1": 6300, "peek_bottom:look:-1,0": 6350,
      "peek_bottom:look:1,0": 6400, "peek_bottom:look:-1,1": 6450, "peek_bottom:look:0,1": 6500,
      "peek_bottom:look:1,1": 6550, "peek_top:look:-1,-1": 6600, "peek_top:look:0,-1": 6650,
      "peek_top:look:1,-1": 6700, "peek_top:look:-1,0": 6750, "peek_top:look:1,0": 6800,
      "peek_top:look:-1,1": 6850, "peek_top:look:0,1": 6900, "peek_top:look:1,1": 6950
    };

    // [frame count, per-frame durations, loops, what follows a one-shot]
    const animationData = {
      idle: [2, [1800, 1500], true, null],
      blink: [4, [55, 80, 55, 250], false, "idle"],
      tail_flick: [4, [110, 80, 100, 250], false, "idle"],
      ear_twitch: [4, [90, 60, 70, 250], false, "idle"],
      squint_in: [2, [50, 120], false, "squint"],
      squint: [2, [1800, 1500], true, null],
      purr_in: [2, [60, 90], false, "purr"],
      purr: [4, [110, 110, 100, 120], true, null],
      purr_out: [2, [100, 120], false, "idle"]
    };

    const frames = {};
    for (const [name, x] of Object.entries(frameX)) frames[name] = [x, 0, 50, 50];

    const animations = {};
    for (const [name, [count, durations, loop, next]] of Object.entries(animationData)) {
      animations[name] = { frames: new Array(count), durations_ms: durations, loop, next };
    }

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
          // Manifest anchor y is 2: that suits the app, whose overlay window
          // extends above the sprite. Here the sprite is the whole stage, so
          // hearts are born at his ear line instead and rise through the
          // empty rows above his head (he is opaque from row 7).
          anchor: { x: 21, y: 12 },
          anchor_jitter: { x: 6, y: 2 }
        },
        heart_small: {
          width: 7,
          height: 7,
          frames: ["props/heart_small_0.png", "props/heart_small_1.png", "props/heart_small_2.png", "props/heart_small_3.png"],
          durations_ms: [80, 150, 190, 230],
          registration: { x: 3, y: 5 },
          // Manifest anchor y is 3: that suits the app, whose overlay window
          // extends above the sprite. Here the sprite is the whole stage, so
          // hearts are born at his ear line instead and rise through the
          // empty rows above his head (he is opaque from row 7).
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

  function drawFrame(key) {
    const rect = manifest?.sheet?.frames?.[key];
    if (!rect || !context || !atlas.complete) return false;
    context.clearRect(0, 0, 50, 50);
    context.imageSmoothingEnabled = false;
    context.drawImage(atlas, rect[0], rect[1], rect[2], rect[3], 0, 0, 50, 50);
    return true;
  }

  function draw(animationName, index = 0) {
    return drawFrame(frameKey(animationName, index));
  }

  // The directional frames are named "look:dx,dy" outright, with no frame index.
  function drawLook(direction) {
    return drawFrame(`look:${direction.dx},${direction.dy}`);
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
      // The hint has done its job once he has actually purred.
      stage.classList.add("is-petted");
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
      if (!direction || (direction.dx === 0 && direction.dy === 0) || !drawLook(direction)) draw("idle", 0);
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
    if (!direction || (direction.dx === 0 && direction.dy === 0) || !drawLook(direction)) {
      draw(runtime.animation, runtime.frame);
    }
    animationFrame = requestAnimationFrame(tick);
  }

  // GIFs and screenshots, not video: the brief measured that H.264 smears the
  // hard pixel edges this project protects everywhere else. A GIF cannot be
  // paused, so "play only while in view" becomes "only fetch it once it comes
  // into view"; a screenshot is static and loads under reduced motion too.
  function setupClipWindows() {
    const load = (media) => {
      if (media.dataset.loaded) return;
      if (!media.dataset.static && reduceMotion.matches) return;
      media.dataset.loaded = "true";
      if (!media.dataset.static) media.dataset.animated = "true";
      media.addEventListener("load", () => media.closest(".clip-window").classList.add("has-media"));
      media.src = media.dataset.src;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const media = entry.target.querySelector(".clip-media");
          if (media) load(media);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );

    for (const clipWindow of document.querySelectorAll(".clip-window")) observer.observe(clipWindow);

    // If the reader turns reduced motion off, pick up the clips already in view.
    reduceMotion.addEventListener("change", () => {
      if (reduceMotion.matches) return;
      for (const media of document.querySelectorAll(".clip-media")) {
        const box = media.closest(".clip-window").getBoundingClientRect();
        if (box.top < innerHeight && box.bottom > 0) load(media);
      }
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

  // The photo starts hidden so that a missing file leaves the sprite portrait
  // alone instead of rendering broken alt text. That rules out loading="lazy":
  // a hidden element has no box, so it can never intersect the viewport, and
  // the browser would wait forever to fetch it. Drive the fetch from here.
  function setupOptionalPhoto() {
    const photo = document.querySelector("#rumi-photo");
    if (!photo || !photo.dataset.src) return;
    const panel = photo.closest(".about__portrait");
    const reveal = () => {
      if (!photo.naturalWidth) return;
      photo.hidden = false;
      panel.classList.add("has-photo");
    };
    photo.addEventListener("load", reveal);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          photo.src = photo.dataset.src;
          if (photo.complete) reveal();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(panel);
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
