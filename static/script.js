(function(){
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------
     BOOT SEQUENCE
     -------------------------------------------------------- */
  var bootLines = [
    { text: "ibrahim@portfolio:~$ systemctl status portfolio.service", cls: "" },
    { text: "\u25CF portfolio.service - Ibrahim Saad, Aspiring DevOps Engineer", cls: "line-ok" },
    { text: "     Loaded: loaded (/etc/systemd/system/portfolio.service; enabled)", cls: "line-dim" },
    { text: "     Active: active (running) since Alexandria, Egypt", cls: "line-ok" },
    { text: "       Stack: Nginx \u2192 Gunicorn \u2192 Flask \u2192 HTML/CSS/JS", cls: "line-dim" },
    { text: "       Skills: Linux, Bash, Python, AWS (EC2/S3/IAM/VPC), Networking", cls: "line-dim" },
    { text: "", cls: "" },
    { text: "ibrahim@portfolio:~$ ./boot-desktop.sh", cls: "" },
    { text: "Mounting skills/ ... done", cls: "line-warn" },
    { text: "Mounting projects/ ... done", cls: "line-warn" },
    { text: "Loading desktop environment ...", cls: "line-dim" }
  ];

  var bootEl = document.getElementById("boot");
  var bootTextEl = document.getElementById("boot-text");

  function finishBoot(){
    if (!bootEl.classList.contains("is-hidden")){
      bootEl.classList.add("is-hidden");
    }
  }

  function typeBoot(){
    if (prefersReducedMotion){
      bootTextEl.textContent = bootLines.map(function(l){ return l.text; }).join("\n");
      setTimeout(finishBoot, 400);
      return;
    }

    var lineIndex = 0;
    var charIndex = 0;

    function typeChar(){
      if (lineIndex >= bootLines.length){
        setTimeout(finishBoot, 500);
        return;
      }
      var line = bootLines[lineIndex];
      if (charIndex === 0 && line.cls){
        var span = document.createElement("span");
        span.className = line.cls;
        bootTextEl.appendChild(span);
      }
      var target = line.cls ? bootTextEl.lastChild : null;

      if (charIndex < line.text.length){
        var ch = line.text.charAt(charIndex);
        if (target){ target.textContent += ch; }
        else { bootTextEl.appendChild(document.createTextNode(ch)); }
        charIndex++;
        setTimeout(typeChar, line.text.length > 40 ? 4 : 10);
      } else {
        bootTextEl.appendChild(document.createTextNode("\n"));
        lineIndex++;
        charIndex = 0;
        setTimeout(typeChar, 60);
      }
    }
    typeChar();
  }

  typeBoot();
  bootEl.addEventListener("click", finishBoot);
  window.addEventListener("keydown", finishBoot, { once: true });

  /* --------------------------------------------------------
     LIVE CLOCK
     -------------------------------------------------------- */
  var clockEl = document.getElementById("clock");
  function updateClock(){
    var now = new Date();
    var opts = { weekday: "short", hour: "2-digit", minute: "2-digit" };
    clockEl.textContent = now.toLocaleString("en-US", opts);
  }
  updateClock();
  setInterval(updateClock, 15000);

  /* --------------------------------------------------------
     WINDOW MANAGER
     -------------------------------------------------------- */
  var windows = {};
  document.querySelectorAll(".window").forEach(function(win){
    windows[win.dataset.app] = win;
  });

  var dockItems = {};
  document.querySelectorAll(".dock__item").forEach(function(item){
    dockItems[item.dataset.open] = item;
  });

  var zTop = 20;
  var isMobile = window.matchMedia("(max-width: 780px)").matches;

  function bringToFront(win){
    zTop += 1;
    win.style.zIndex = zTop;
    document.querySelectorAll(".window").forEach(function(w){ w.classList.remove("is-active"); });
    win.classList.add("is-active");
  }

  function openApp(appId){
    var win = windows[appId];
    if (!win) return;
    win.classList.remove("is-minimized");
    win.classList.add("is-open");
    bringToFront(win);
    if (dockItems[appId]) dockItems[appId].classList.add("is-running");
  }

  function closeApp(win){
    win.classList.remove("is-open");
    win.classList.remove("is-minimized");
    var id = win.dataset.app;
    if (dockItems[id]) dockItems[id].classList.remove("is-running");
  }

  function minimizeApp(win){
    win.classList.add("is-minimized");
  }

  // Openers: desktop icons + dock items
  document.querySelectorAll("[data-open]").forEach(function(el){
    el.addEventListener("click", function(){
      openApp(el.dataset.open);
    });
  });

  // CV download icon
  var cvIcon = document.getElementById("icon-cv-download");
  if (cvIcon){
    cvIcon.addEventListener("click", function(){
      window.location.href = "/download-cv";
    });
  }

  // Window controls + focus + drag
  document.querySelectorAll(".window").forEach(function(win){
    win.addEventListener("mousedown", function(){ bringToFront(win); });

    var closeBtn = win.querySelector("[data-close]");
    var minBtn = win.querySelector("[data-min]");
    var zoomBtn = win.querySelector("[data-zoom]");

    if (closeBtn) closeBtn.addEventListener("click", function(e){ e.stopPropagation(); closeApp(win); });
    if (minBtn) minBtn.addEventListener("click", function(e){ e.stopPropagation(); minimizeApp(win); });
    if (zoomBtn) zoomBtn.addEventListener("click", function(e){
      e.stopPropagation();
      win.classList.toggle("is-zoomed");
      if (win.classList.contains("is-zoomed")){
        win.dataset.prevWidth = win.style.width || "";
        win.style.width = "min(920px, calc(100vw - 48px))";
      } else {
        win.style.width = win.dataset.prevWidth || "";
      }
    });

    // Dragging (desktop only)
    var handle = win.querySelector("[data-drag-handle]");
    if (!handle) return;

    var dragging = false;
    var startX, startY, startLeft, startTop;

    function dragStart(clientX, clientY){
      if (isMobile) return;
      dragging = true;
      bringToFront(win);
      var rect = win.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      startLeft = rect.left;
      startTop = rect.top;
      win.style.left = startLeft + "px";
      win.style.top = startTop + "px";
    }
    function dragMove(clientX, clientY){
      if (!dragging) return;
      var dx = clientX - startX;
      var dy = clientY - startY;
      var newLeft = Math.max(4, startLeft + dx);
      var newTop = Math.max(var_topbar(), startTop + dy);
      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
    }
    function dragEnd(){ dragging = false; }
    function var_topbar(){ return 34; }

    handle.addEventListener("mousedown", function(e){
      dragStart(e.clientX, e.clientY);
      e.preventDefault();
    });
    window.addEventListener("mousemove", function(e){ dragMove(e.clientX, e.clientY); });
    window.addEventListener("mouseup", dragEnd);

    handle.addEventListener("touchstart", function(e){
      var t = e.touches[0];
      dragStart(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchmove", function(e){
      var t = e.touches[0];
      dragMove(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener("touchend", dragEnd);
  });

  window.addEventListener("resize", function(){
    isMobile = window.matchMedia("(max-width: 780px)").matches;
  });

  // Open the About window by default once boot finishes
  setTimeout(function(){ openApp("about"); }, prefersReducedMotion ? 500 : 100);

})();
