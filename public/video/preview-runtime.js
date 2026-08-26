/*
 * In-app preview runtime.
 *
 * HyperFrames renders by seeking a paused timeline in headless Chrome frame by
 * frame. This is the same contract implemented for a live <iframe>: reveal timed
 * elements from their data-start window, seek window.__timelines, and keep media
 * elements lined up with the playhead. It is injected only by the preview route,
 * so the composition file itself stays a plain HyperFrames document.
 */
(function () {
  "use strict";

  var EPS = 0.001;
  var root = document.querySelector("[data-composition-id]");
  if (!root) return;

  var compositionId = root.getAttribute("data-composition-id");
  var duration = parseFloat(root.getAttribute("data-duration")) || 0;
  var width = parseFloat(root.getAttribute("data-width")) || root.offsetWidth;
  var height = parseFloat(root.getAttribute("data-height")) || root.offsetHeight;

  var timed = Array.prototype.slice
    .call(root.querySelectorAll("[data-start]"))
    .filter(function (el) {
      return el !== root;
    })
    .map(function (el) {
      var start = parseFloat(el.getAttribute("data-start")) || 0;
      var dur = parseFloat(el.getAttribute("data-duration"));
      return {
        el: el,
        start: start,
        end: start + (isNaN(dur) ? duration - start : dur),
        mediaStart: parseFloat(el.getAttribute("data-media-start")) || 0,
        volume: el.hasAttribute("data-volume") ? parseFloat(el.getAttribute("data-volume")) : 1,
        isMedia: el.tagName === "VIDEO" || el.tagName === "AUDIO",
        wasVisible: null,
      };
    });

  var playing = false;
  var muted = true;
  var playhead = 0;
  var rafId = null;
  var lastWall = 0;

  function timeline() {
    return window.__timelines && window.__timelines[compositionId];
  }

  // --- fit the fixed-size composition into whatever box the iframe has ---
  function fit() {
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    var scale = Math.min(vw / width, vh / height);
    root.style.position = "absolute";
    root.style.transformOrigin = "0 0";
    root.style.transform =
      "translate(" +
      (vw - width * scale) / 2 +
      "px," +
      (vh - height * scale) / 2 +
      "px) scale(" +
      scale +
      ")";
  }

  function styleHost() {
    var css = document.createElement("style");
    css.textContent =
      "html,body{width:100%!important;height:100%!important;overflow:hidden!important;margin:0!important;background:#000!important}";
    document.head.appendChild(css);
  }

  function applyVisibility(entry, visible) {
    if (entry.wasVisible === visible) return;
    entry.wasVisible = visible;
    entry.el.style.display = visible ? "" : "none";
  }

  function syncMedia(entry, t, visible) {
    var el = entry.el;
    if (!visible) {
      if (!el.paused) el.pause();
      return;
    }
    el.muted = el.tagName === "VIDEO" ? true : muted;
    if (el.tagName === "AUDIO") {
      el.muted = muted;
      el.volume = isNaN(entry.volume) ? 1 : Math.max(0, Math.min(1, entry.volume));
    }
    var target = entry.mediaStart + (t - entry.start);
    if (target < 0) target = 0;
    // Only correct when we have actually drifted; nudging every frame stutters.
    if (!playing || Math.abs(el.currentTime - target) > 0.28) {
      try {
        el.currentTime = target;
      } catch (err) {
        /* media not seekable yet */
      }
    }
    if (playing) {
      if (el.paused) {
        var p = el.play();
        if (p && p.catch) p.catch(function () {});
      }
    } else if (!el.paused) {
      el.pause();
    }
  }

  function seek(t) {
    playhead = Math.max(0, Math.min(duration, t));
    for (var i = 0; i < timed.length; i += 1) {
      var entry = timed[i];
      var visible = playhead >= entry.start - EPS && playhead < entry.end - EPS;
      applyVisibility(entry, visible);
      if (entry.isMedia) syncMedia(entry, playhead, visible);
    }
    var tl = timeline();
    if (tl) tl.seek(playhead, false);
    post("hf:time", { t: playhead, playing: playing });
  }

  function tick() {
    if (!playing) return;
    var now = performance.now();
    var delta = (now - lastWall) / 1000;
    lastWall = now;
    var next = playhead + delta;
    if (next >= duration) {
      seek(duration);
      pause();
      post("hf:ended", {});
      return;
    }
    seek(next);
    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (playing) return;
    if (playhead >= duration - EPS) playhead = 0;
    playing = true;
    lastWall = performance.now();
    rafId = requestAnimationFrame(tick);
    seek(playhead);
  }

  function pause() {
    playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    for (var i = 0; i < timed.length; i += 1) {
      if (timed[i].isMedia && !timed[i].el.paused) timed[i].el.pause();
    }
    post("hf:time", { t: playhead, playing: false });
  }

  function post(type, payload) {
    if (window.parent === window) return;
    var message = { source: "hyperframes-preview", type: type };
    for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k)) message[k] = payload[k];
    window.parent.postMessage(message, "*");
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.source !== "hyperframes-host") return;
    if (data.type === "hf:seek") seek(Number(data.t) || 0);
    else if (data.type === "hf:play") play();
    else if (data.type === "hf:pause") pause();
    else if (data.type === "hf:toggle") (playing ? pause : play)();
    else if (data.type === "hf:mute") {
      muted = Boolean(data.value);
      seek(playhead);
    }
  });

  window.addEventListener("resize", fit);

  styleHost();
  fit();
  seek(0);
  post("hf:ready", {
    duration: duration,
    width: width,
    height: height,
    hasTimeline: Boolean(timeline()),
    clips: timed.length,
  });
})();
