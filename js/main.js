/* ============================================================
   Sayon Manna — Portfolio interactions
   Vanilla JS, no dependencies
   ============================================================ */
(() => {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  const nav = document.getElementById("siteNav");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  if (burger && nav && navLinks) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- pixel-art "HELLO" in the about section ---------- */
  (() => {
    const FONT = {
      H:[1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
      E:[1,1,1,1,1, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,1, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
      L:[1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,0,0,0,0, 1,1,1,1,1],
      O:[0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0]
    };
    const grid = document.getElementById("pixelHello");
    if (grid) {
      const WORD = "HELLO";
      const CW = 5, RH = 7, GAP = 1;
      const COLS = WORD.length * CW + (WORD.length - 1) * GAP;
      grid.style.gridTemplateColumns = `repeat(${COLS},1fr)`;
      grid.style.gridTemplateRows = `repeat(${RH},1fr)`;
      grid.style.aspectRatio = `${COLS}/${RH}`;
      let html = "";
      for (let r = 0; r < RH; r++) {
        for (let i = 0; i < WORD.length; i++) {
          const ch = FONT[WORD[i]];
          for (let c = 0; c < CW; c++) {
            html += ch[r * CW + c] ? "<i class='lit'></i>" : "<i class='off'></i>";
          }
          if (i < WORD.length - 1) html += "<i class='off'></i>".repeat(GAP);
        }
      }
      grid.innerHTML = html;
    }
  })();

  /* ---------- scroll: progress bar + nav state + to-top (source = inner warp scroller) ---------- */
  const bar = document.getElementById("scrollBar");
  const toTop = document.getElementById("toTop");
  const scroller = document.getElementById("warpScroll");
  const getY = () => (scroller ? scroller.scrollTop : window.scrollY);
  const onScroll = () => {
    const y = getY();
    const max = scroller
      ? scroller.scrollHeight - scroller.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (nav) {
      const doc = document.documentElement;
      const atTop = y <= 90;
      const nearBottom = scroller
        ? y + scroller.clientHeight >= scroller.scrollHeight - 140
        : y + window.innerHeight >= doc.scrollHeight - 140;
      nav.classList.toggle("nav-hidden", !atTop && !nearBottom);
    }
    if (toTop) toTop.classList.toggle("show", y > 640);
  };
  (scroller || window).addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", () => {
    if (scroller) scroller.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    else window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => ro.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const dur = 1500;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(runCounter);
  }
  /* ---------- console typing ---------- */
  const typeTarget = document.getElementById("typeTarget");
  if (typeTarget) {
    const phrases = [
      "limbi run --agents 90 --interface mcp",
      "orca analyze --dataset astronomy --export yolo",
      "rag index ./docs --offline --engine ollama",
      "forecast train --models 6 --target sales"
    ];
    if (prefersReduced) {
      typeTarget.textContent = phrases[0];
    } else {
      let pi = 0, ci = 0, deleting = false;
      const step = () => {
        const phrase = phrases[pi];
        if (!deleting) {
          ci++;
          typeTarget.textContent = phrase.slice(0, ci);
          if (ci === phrase.length) { deleting = true; setTimeout(step, 1900); return; }
          setTimeout(step, 42 + Math.random() * 55);
        } else {
          ci--;
          typeTarget.textContent = phrase.slice(0, ci);
          if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(step, 420); return; }
          setTimeout(step, 20);
        }
      };
      setTimeout(step, 900);
    }
  }

  /* ---------- skill matrix (word-search style) ---------- */
  const matrix = document.getElementById("matrix");
  if (matrix) {
    const COLS = 15, ROWS = 9;
    const placements = [
      ["PYTHON",0,0],["FASTAPI",1,4],["NLP",2,1],["PYTORCH",2,8],["LANGGRAPH",3,0],
      ["MCP",4,1],["DOCKER",4,9],["RAG",5,1],["CHROMADB",5,6],["POSTGRES",6,0],
      ["REDIS",6,10],["OPENAI",7,3],["SQL",8,0],["OLLAMA",8,7]
    ];
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    placements.forEach(([word, r, c]) => {
      [...word].forEach((ch, i) => { grid[r][c + i] = { ch, word }; });
    });
    let seed = 1337;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid[r][c]) grid[r][c] = { ch: letters[Math.floor(rnd() * 26)], word: null };
      }
    }
    const frag = document.createDocumentFragment();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        const s = document.createElement("span");
        s.textContent = cell.ch;
        if (cell.word) { s.className = "m-word"; s.dataset.word = cell.word; }
        else s.className = "m-filler";
        frag.appendChild(s);
      }
    }
    matrix.appendChild(frag);
    if (!prefersReduced) {
      const words = placements.map((p) => p[0]);
      let wi = 0;
      setInterval(() => {
        matrix.querySelectorAll(".m-word.hot").forEach((n) => n.classList.remove("hot"));
        const w = words[wi % words.length];
        wi++;
        matrix.querySelectorAll('[data-word="' + w + '"]').forEach((n) => n.classList.add("hot"));
      }, 1300);
    }
  }
  /* ---------- console tilt ---------- */
  const consoleEl = document.getElementById("console");
  if (consoleEl && !prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    const wrap = consoleEl.parentElement;
    wrap.addEventListener("pointermove", (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      consoleEl.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
    });
    wrap.addEventListener("pointerleave", () => { consoleEl.style.transform = "none"; });
  }

  /* ---------- mermaid diagram lightbox: one-click full view (↔ button) ---------- */
  (() => {
    const containers = document.querySelectorAll(".architecture-flow-container");
    if (!containers.length) return;
    const pageScroller = document.getElementById("warpScroll");

    // overlay built once, reused by every diagram on the page
    const lb = document.createElement("div");
    lb.className = "flow-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Architecture diagram — full view");
    lb.innerHTML =
      '<div class="flow-lb-panel">' +
        '<div class="flow-lb-head">' +
          '<span class="flow-lb-title mono"></span>' +
          '<span class="flow-lb-actions">' +
            '<button class="flow-lb-zoom mono" type="button" title="Toggle actual size">1:1</button>' +
            '<button class="flow-lb-close" type="button" aria-label="Close full view">✕</button>' +
          '</span>' +
        '</div>' +
        '<div class="flow-lb-body"></div>' +
      '</div>';
    document.body.appendChild(lb);

    const lbBody = lb.querySelector(".flow-lb-body");
    const lbTitle = lb.querySelector(".flow-lb-title");
    const lbZoom = lb.querySelector(".flow-lb-zoom");
    const lbClose = lb.querySelector(".flow-lb-close");
    let lastFocus = null;
    let naturalW = 0;

    const setFit = () => {
      lb.classList.remove("one-to-one");
      const svg = lbBody.querySelector("svg");
      if (svg) svg.style.width = "";
      lbZoom.textContent = "1:1";
    };

    const open = (container) => {
      const svg = container.querySelector("svg");
      const nameEl = container.querySelector(".flow-header span");
      lbTitle.textContent = nameEl ? nameEl.textContent : "architecture-flow.mmd";
      lbBody.innerHTML = "";
      naturalW = 0;
      if (svg) {
        const clone = svg.cloneNode(true);
        clone.removeAttribute("style");              // drop mermaid's inline max-width so it can scale up
        const vb = clone.viewBox && clone.viewBox.baseVal;
        if (vb && vb.width) naturalW = Math.round(vb.width);
        lbBody.appendChild(clone);
        lbZoom.style.display = "";
      } else {
        // mermaid not rendered yet (e.g. offline CDN) — show the raw definition
        const pre = container.querySelector("pre.mermaid");
        const raw = document.createElement("pre");
        raw.className = "flow-lb-raw mono";
        raw.textContent = pre ? pre.textContent : "// diagram unavailable";
        lbBody.appendChild(raw);
        lbZoom.style.display = "none";
      }
      setFit();
      lastFocus = document.activeElement;
      lb.classList.add("open");
      if (pageScroller) pageScroller.style.overflow = "hidden";  // freeze page scroll (page scrolls inside the warp stage)
      lbClose.focus();
    };

    const close = () => {
      lb.classList.remove("open");
      if (pageScroller) pageScroller.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    lbZoom.addEventListener("click", () => {
      if (!lb.classList.contains("one-to-one")) {
        const svg = lbBody.querySelector("svg");
        if (svg && naturalW) {
          svg.style.width = naturalW + "px";         // actual pixel size — pan by scrolling
          lb.classList.add("one-to-one");
          lbZoom.textContent = "⤢ Fit";
        }
      } else setFit();
    });

    containers.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "flow-expand-btn";
      btn.type = "button";
      btn.title = "View full diagram";
      btn.setAttribute("aria-label", "View diagram in full view");
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12h20"/><path d="M6 8l-4 4 4 4"/><path d="M18 8l4 4-4 4"/></svg>';
      c.appendChild(btn);
      btn.addEventListener("click", (e) => { e.stopPropagation(); open(c); });
      const stage = c.querySelector(".mermaid");
      if (stage) stage.addEventListener("click", () => open(c));   // one click on the diagram itself
    });

    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    lbClose.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  })();

  /* ---------- scrollspy ---------- */
  const spyLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const spyMap = {};
  spyLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) spyMap[id] = a;
  });
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          Object.values(spyMap).forEach((a) => a.classList.remove("active"));
          const link = spyMap[en.target.id];
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(spyMap).forEach((id) => so.observe(document.getElementById(id)));
  }

  /* ---------- footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- hero motion wallpaper: WebGL aurora gradient ---------- */
  /* shared scroll-bend state: the warp engine writes it, the aurora shader reads it */
  const bendState = { u: 0 };
  const heroCanvas = document.getElementById("heroCanvas");
  if (heroCanvas) {
    const heroSection = heroCanvas.closest("section") || heroCanvas.parentElement;
    const gl = heroCanvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
      || heroCanvas.getContext("experimental-webgl");
    if (!gl) {
      heroCanvas.style.display = "none"; /* fall back to CSS gradient blobs */
    } else {
      const vert = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
      const frag = [
        "precision highp float;",
        "uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform float u_bend;",
        "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
        "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);",
        "return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}",
        "float fbm(vec2 p){float v=0.;float a=.5;",
        "for(int k=0;k<4;k++){v+=a*noise(p);p=p*2.03+vec2(17.7,9.2);a*=.5;}return v;}",
        "vec3 pal(float t){return vec3(.5)+vec3(.5)*cos(6.28318*(t+vec3(0.,.33,.67)));}",
        "void main(){",
        "vec2 uv=gl_FragCoord.xy/u_res;",
        "vec2 cen=uv-.5;",
        "float edge=max(abs(cen.x),abs(cen.y))*2.;",
        "uv+=(cen*2.)*u_bend*.105*smoothstep(.12,1.,edge);",
        "vec2 p=uv;p.x*=u_res.x/u_res.y;",
        "float t=u_time*.06;",
        "vec2 m=(u_mouse-.5);m.x*=u_res.x/u_res.y;",
        "float n1=fbm(p*1.35+vec2(t,-t*.7)+m*.7);",
        "float n2=fbm(p*2.0-vec2(t*.8,t*.5)+n1+m*.4);",
        "vec3 cream=vec3(.961,.961,.949);",
        "vec3 white=vec3(1.,1.,1.);",
        "float f1=n1*.8+u_time*.045;",
        "float f2=n2*.8-u_time*.03+.33;",
        "vec3 cA=pal(f1);",
        "vec3 cB=pal(f2);",
        "vec3 aurora=mix(cA,cB,.5);",
        "aurora=mix(vec3(1.),aurora,.6);",
        "aurora=max(aurora,vec3(.52));",
        "float band=smoothstep(.3,.85,n1*.6+n2*.55);",
        "vec3 col=mix(cream,white,smoothstep(.3,.9,n2));",
        "col=mix(col,aurora,band*.9);",
        "gl_FragColor=vec4(col,1.);",
        "}"
      ].join("\n");
      const makeShader = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = makeShader(gl.VERTEX_SHADER, vert);
      const fs = makeShader(gl.FRAGMENT_SHADER, frag);
      if (!vs || !fs) {
        heroCanvas.style.display = "none";
      } else {
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "a");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const uRes = gl.getUniformLocation(prog, "u_res");
        const uTime = gl.getUniformLocation(prog, "u_time");
        const uMouse = gl.getUniformLocation(prog, "u_mouse");
        const uBend = gl.getUniformLocation(prog, "u_bend");
        let w = 1, h = 1, running = false, rafId = 0;
        let mx = .5, my = .5, tx = .5, ty = .45, hasPointer = false;
        const time0 = performance.now();
        const resize = () => {
          const scale = Math.min(window.devicePixelRatio || 1, 1.5) * .75;
          w = Math.max(1, Math.round(window.innerWidth * scale));
          h = Math.max(1, Math.round(window.innerHeight * scale));
          heroCanvas.width = w;
          heroCanvas.height = h;
          gl.viewport(0, 0, w, h);
        };
        const frame = () => {
          if (!hasPointer) {
            const now = performance.now();
            tx = .5 + .26 * Math.sin(now * .00012);
            ty = .45 + .18 * Math.cos(now * .00009);
          }
          mx += (tx - mx) * .03;
          my += (ty - my) * .03;
          gl.uniform2f(uRes, w, h);
          gl.uniform1f(uTime, (performance.now() - time0) / 1000);
          gl.uniform2f(uMouse, mx, 1 - my);
          gl.uniform1f(uBend, bendState.u);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          rafId = requestAnimationFrame(frame);
        };
        const start = () => { if (!running) { running = true; rafId = requestAnimationFrame(frame); } };
        const stop = () => { running = false; cancelAnimationFrame(rafId); };
        resize();
        heroCanvas.parentElement.classList.add("webgl-on");
        if (prefersReduced) {
          gl.uniform2f(uRes, w, h);
          gl.uniform1f(uTime, 24);
          gl.uniform2f(uMouse, .5, .58);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        } else {
          window.addEventListener("pointermove", (e) => {
            tx = e.clientX / window.innerWidth;
            ty = e.clientY / window.innerHeight;
            hasPointer = true;
          });
          window.addEventListener("resize", resize);
          start();
          document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
        }
      }
    }
  }

  /* ---------- cursor aurora glow (fine pointers only) ---------- */
  const finePointer = window.matchMedia("(pointer:fine)").matches;
  if (finePointer && !prefersReduced) {
    const aura = document.createElement("div");
    const core = document.createElement("div");
    aura.className = "cursor-aura";
    core.className = "cursor-aura-core";
    document.body.appendChild(aura);
    document.body.appendChild(core);
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let ax = gx, ay = gy, kx = gx, ky = gy;
    window.addEventListener("pointermove", (e) => {
      gx = e.clientX;
      gy = e.clientY;
    });
    (function auraLoop() {
      ax += (gx - ax) * .07;
      ay += (gy - ay) * .07;
      kx += (gx - kx) * .16;
      ky += (gy - ky) * .16;
      aura.style.transform = "translate(" + ax.toFixed(1) + "px," + ay.toFixed(1) + "px)";
      core.style.transform = "translate(" + kx.toFixed(1) + "px," + ky.toFixed(1) + "px)";
      requestAnimationFrame(auraLoop);
    })();
  }
  /* ---------- magnetic buttons + 3D card tilt (fine pointers only) ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (dx * .18).toFixed(1) + "px," + (dy * .22).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
    document.querySelectorAll(".trio-card,.skill-card,.cert-card,.contact-card").forEach((card) => {
      card.addEventListener("pointerenter", () => { card.style.transition = "transform .08s ease"; });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = "perspective(700px) rotateX(" + (-py * 7).toFixed(2) + "deg) rotateY(" + (px * 7).toFixed(2) + "deg) translateY(-3px)";
      });
      card.addEventListener("pointerleave", () => {
        card.style.transition = "";
        card.style.transform = "";
      });
    });
  }

  /* ---------- warp engine: scroll velocity bends the page sheet (corner curve + tilt +
     skew + outward stretch) and feeds an outward-bulge uniform to the aurora shader;
     everything eases back to perfectly flat when scrolling stops ---------- */
  const stage = document.getElementById("warpStage");
  if (scroller) {
    /* keyboard scrolling: the document itself no longer scrolls, route keys to the scroller */
    window.addEventListener("keydown", (e) => {
      if (document.activeElement && document.activeElement !== document.body) return;
      const vh = scroller.clientHeight;
      let d = 0;
      if (e.key === "ArrowDown") d = 90;
      else if (e.key === "ArrowUp") d = -90;
      else if (e.key === "PageDown") d = vh * 0.88;
      else if (e.key === "PageUp") d = -vh * 0.88;
      else if (e.key === " ") d = e.shiftKey ? -vh * 0.88 : vh * 0.88;
      else if (e.key === "Home") { e.preventDefault(); scroller.scrollTo({ top: 0, behavior: "smooth" }); return; }
      else if (e.key === "End") { e.preventDefault(); scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" }); return; }
      if (d) { e.preventDefault(); scroller.scrollBy({ top: d, behavior: "smooth" }); }
    });
    /* restore the last reading position after a reload */
    try {
      const saved = sessionStorage.getItem("warpY");
      if (saved && +saved > 0) {
        scroller.style.scrollBehavior = "auto";
        scroller.scrollTop = +saved;
        requestAnimationFrame(() => { scroller.style.scrollBehavior = ""; });
      }
    } catch (err) {}
    let saveTimer = 0;
    scroller.addEventListener("scroll", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { try { sessionStorage.setItem("warpY", String(scroller.scrollTop)); } catch (err) {} }, 160);
    }, { passive: true });
    /* the bend itself — motion allowed only */
    if (stage && !prefersReduced) {
      const root = document.documentElement;
      const VEL_MAX = 70; // px/frame clamp — lower threshold so normal wheel/trackpad scrolls visibly bend
      let radius = 0, tilt = 0, skew = 0, sx = 1, sy = 1, vel = 0, u = 0;
      let lastY = scroller.scrollTop, lastSig = "";
      (function warpLoop() {
        const dy = Math.max(-VEL_MAX, Math.min(VEL_MAX, scroller.scrollTop - lastY));
        lastY = scroller.scrollTop;
        vel += (dy - vel) * (dy !== 0 ? 0.3 : 0.1);   // smooth signed velocity: fast in, slow out
        const n = Math.min(1, Math.abs(vel) / VEL_MAX);
        const dir = vel >= 0 ? 1 : -1;
        radius += (n * 80 - radius) * 0.3;            // corner curve — dark void peeks through the rounding corners
        tilt += (n * 3.4 * dir - tilt) * 0.2;         // shallow perspective => leading edge magnifies toward the viewer
        skew += (n * 0.9 * dir - skew) * 0.2;         // shear = flow curvature
        sx += (1 + n * 0.035 - sx) * 0.3;             // horizontal swell
        sy += (1 + n * 0.10 - sy) * 0.3;              // vertical stretch along the scroll axis (visible)
        u += (n - u) * 0.16;                          // aurora bulge 0..1
        const sig = radius.toFixed(2) + tilt.toFixed(3) + skew.toFixed(3) + sx.toFixed(4) + sy.toFixed(4) + u.toFixed(3);
        if (sig !== lastSig) {
          root.style.setProperty("--bend-r", radius.toFixed(2) + "px");
          root.style.setProperty("--bend-tilt", tilt.toFixed(3) + "deg");
          root.style.setProperty("--bend-skew", skew.toFixed(3) + "deg");
          root.style.setProperty("--bend-sx", sx.toFixed(4));
          root.style.setProperty("--bend-sy", sy.toFixed(4));
          bendState.u = u;
          lastSig = sig;
        }
        requestAnimationFrame(warpLoop);
      })();
      document.addEventListener("visibilitychange", () => { lastY = scroller.scrollTop; vel = 0; });
    }
  }
})();
