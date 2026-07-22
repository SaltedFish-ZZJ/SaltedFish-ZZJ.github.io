/* 朱梓健 · 个人站 — 交互层 */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 黑白切换（初始主题由 head 启动脚本在首屏前设定，默认白天） ── */
  var root = document.documentElement;
  var THEME_KEY = "zzj-theme";
  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      root.classList.add("theme-fade");
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      setTimeout(function () { root.classList.remove("theme-fade"); }, 500);
    });
  }

  /* ── 滚动显现 ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ── 导航高亮 ── */
  var page = document.body.dataset.page;
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.dataset.page === page) a.classList.add("active");
  });

  /* ── 阅读进度条 / 导航滚动态 / 返回顶部 ── */
  var bar = document.getElementById("progress");
  var navEl = document.querySelector(".nav");
  var toTop = document.getElementById("to-top");
  function onScroll() {
    var h = document.documentElement;
    if (bar) {
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    }
    if (navEl) navEl.classList.toggle("scrolled", window.scrollY > 8);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ── 点击复制 ── */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;
      function done() {
        btn.classList.add("copied");
        setTimeout(function () { btn.classList.remove("copied"); }, 1500);
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    });
  });

  /* ── 页脚年份 ── */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ── 终端打字机 ── */
  var termBody = document.getElementById("term-body");
  if (!termBody) return;

  var LINES = [
    { cls: "t-out", text: "# intro.sh — 30 秒认识我" },
    { cls: "cmd", text: "whoami" },
    { cls: "t-out", text: "朱梓健 · 21岁 · 软件技术 · 大连" },
    { cls: "cmd", text: "cat role.txt" },
    { cls: "t-out", text: "不造 AI，设计 AI 工作流 · 给我一个问题，我设计 AI 怎么解决它" },
    { cls: "cmd", text: "ls projects/" },
    { cls: "t-out", text: "story-wiki/  terminal-tarot/  newspaper-daily/  win11-update-killer/" },
    { cls: "cmd", text: "cat philosophy.txt" },
    { cls: "t-key", text: "能力增速 > 欲望增速 = 从容" },
    { cls: "t-out", text: "做出来，远比想出来重要。" }
  ];

  var caret = document.createElement("span");
  caret.className = "caret";

  function renderLine(spec) {
    var div = document.createElement("div");
    div.className = "line";
    if (spec.cls === "cmd") {
      var p = document.createElement("span");
      p.className = "t-prompt";
      p.textContent = "$ ";
      var c = document.createElement("span");
      c.className = "t-cmd";
      div.appendChild(p);
      div.appendChild(c);
      return { div: div, typeTarget: c, full: spec.text };
    }
    div.className = "line " + spec.cls;
    div.textContent = spec.text;
    return { div: div, typeTarget: null, full: spec.text };
  }

  function typeCmd(item, done) {
    var i = 0;
    function step() {
      item.typeTarget.textContent = item.full.slice(0, ++i);
      if (i < item.full.length) {
        setTimeout(step, 24 + Math.random() * 46);
      } else {
        setTimeout(done, 340);
      }
    }
    step();
  }

  function runTerminal() {
    if (reduceMotion) {
      LINES.forEach(function (spec) {
        var item = renderLine(spec);
        if (item.typeTarget) item.typeTarget.textContent = item.full;
        termBody.appendChild(item.div);
      });
      var tail = document.createElement("div");
      tail.className = "line";
      tail.appendChild(promptSpan());
      tail.appendChild(caret);
      termBody.appendChild(tail);
      return;
    }
    var idx = 0;
    function next() {
      if (idx >= LINES.length) {
        var tail = document.createElement("div");
        tail.className = "line";
        tail.appendChild(promptSpan());
        tail.appendChild(caret);
        termBody.appendChild(tail);
        return;
      }
      var spec = LINES[idx++];
      var item = renderLine(spec);
      termBody.appendChild(item.div);
      if (item.typeTarget) {
        item.div.appendChild(caret);
        typeCmd(item, function () {
          item.div.removeChild(caret);
          setTimeout(next, 90);
        });
      } else {
        setTimeout(next, spec.cls === "t-key" ? 620 : 260);
      }
    }
    next();
  }

  function promptSpan() {
    var p = document.createElement("span");
    p.className = "t-prompt";
    p.textContent = "$ ";
    return p;
  }

  /* 终端进入视口再开打 */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var tio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        tio.disconnect();
        runTerminal();
      }
    }, { threshold: 0.35 });
    tio.observe(termBody);
  } else {
    runTerminal();
  }
})();
