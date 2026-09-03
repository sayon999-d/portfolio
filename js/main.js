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
        "float n3=fbm(p*2.6+vec2(-t*.6,t*.9)+n2*.5+m*.3);",
        "vec3 cream=vec3(.961,.961,.949);",
        "vec3 white=vec3(1.,1.,1.);",
        "float f1=n1*.8+u_time*.045;",
        "float f2=n2*.8-u_time*.03+.33;",
        "float f3=n3*.9+u_time*.026+.62;",
        "vec3 cA=pal(f1);",
        "vec3 cB=pal(f2);",
        "vec3 cC=pal(f3);",
        "vec3 aurora=mix(cA,cB,smoothstep(.25,.75,n2));",
        "aurora=mix(aurora,cC,smoothstep(.3,.8,n3)*.7);",
        "aurora=mix(aurora,vec3(.133,.773,.369),.22);",
        "aurora=mix(vec3(dot(aurora,vec3(.333))),aurora,1.15);",
        "aurora=mix(vec3(1.),aurora,.8);",
        "aurora=max(aurora,vec3(.46));",
        "float band=smoothstep(.2,.78,n1*.55+n2*.5+n3*.35);",
        "vec3 col=mix(cream,white,smoothstep(.3,.9,n2));",
        "col=mix(col,aurora,band*.95);",
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
  /* ---------- contact QR tree: procedural canvas tree whose leaves ARE the dark
     modules of a real QR code (https://github.com/sayon999-d). Tap: leaves fold
     flat into a scannable grid; tap again: tree grows back. Mechanic mirrored
     from tree.icqr.com — dependency-free Canvas2D + rAF. ---------- */
  const qrCanvas = document.getElementById("qrTreeCanvas");
  if (qrCanvas) {
    const stage = document.getElementById("qrStage");
    const hintEl = document.getElementById("qrHintText");
    const QR_ROWS = ("11111110110100011111101111111|10000010101010110010001000001|10111010011111110011001011101|10111010110100001101101011101|10111010011001000001001011101|10000010010010100111101000001|11111110101010101010101111111|00000000111011100100100000000|10110111010001101101001001011|10110001010010011101101110001|00110111001110110100010100110|00100100010101110010011010001|01100011100000001110100001100|00101001111011000011001000111|11000011101010100001101000111|10111000110001010001111110010|11110010110010000001100011010|00011101111111000110000101110|10100111001100000010101110100|00111101010000011110001110100|01000011010111010100111111100|00000000100111110110100011111|11111110100101001111101011010|10000010101110001010100011011|10111010011010110100111110101|10111010111011101101010111010|10111010111011111010100100101|10000010011001001010110101010|11111110100001010101111000010").split("|");
    const QR_N = 29, QUIET = 4, W = 520, H = 640, DUR = 1150;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    qrCanvas.width = W * dpr; qrCanvas.height = H * dpr;
    const g = qrCanvas.getContext("2d");
    g.scale(dpr, dpr);
    const cell = (W - 56) / (QR_N + QUIET * 2);
    const ox = (W - (QR_N + QUIET * 2) * cell) / 2, oy = (H - (QR_N + QUIET * 2) * cell) / 2;
    const groundY = H - 42, cx = W / 2;
    let seed = 20260903;
    const rng = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    /* recursive branch growth; deep endpoints become leaf anchors. The seed is
       rejection-sampled until the canopy is centered, wide and tall on canvas. */
    let branches = [], anchors = [];
    function build() {
      branches = []; anchors = [];
      (function grow(x, y, ang, len, w, depth) {
        const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
        branches.push({ x1: x, y1: y, x2: nx, y2: ny, w: w, ph: rng() * 6.283 });
        if (depth >= 1) anchors.push({ x: nx, y: ny });  /* every branch endpoint = leaf anchor → foliage fills the whole (centered) canopy */
        if (depth >= 8 || len < 9) return;
        const kids = rng() < 0.28 ? 3 : 2;
        for (let i = 0; i < kids; i++) {
          grow(nx, ny, ang + (i - (kids - 1) / 2) * (0.46 + rng() * 0.26) + (rng() - 0.5) * 0.14,
            len * (0.7 + rng() * 0.12), Math.max(1.5, w * 0.64), depth + 1);
        }
      })(cx, groundY, -Math.PI / 2 - 0.05, 96, 14, 0);
      /* affine-fit the whole tree: centered, trunk base exactly on the ground */
      let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
      branches.forEach(b => {
        bx0 = Math.min(bx0, b.x1, b.x2); bx1 = Math.max(bx1, b.x1, b.x2);
        by0 = Math.min(by0, b.y1, b.y2); by1 = Math.max(by1, b.y1, b.y2);
      });
      const scx = (W - 108) / (bx1 - bx0), scy = (groundY - 74) / (by1 - by0);
      const txo = W / 2 - (bx0 + bx1) / 2 * scx, tyo = groundY - by1 * scy;
      branches.forEach(b => { b.x1 = b.x1 * scx + txo; b.x2 = b.x2 * scx + txo; b.y1 = b.y1 * scy + tyo; b.y2 = b.y2 * scy + tyo; });
      anchors.forEach(p => { p.x = p.x * scx + txo; p.y = p.y * scy + tyo; });
      let ax0 = 1e9, ax1 = -1e9, ay0 = 1e9, ay1 = -1e9;
      anchors.forEach(p => {
        ax0 = Math.min(ax0, p.x); ax1 = Math.max(ax1, p.x); ay0 = Math.min(ay0, p.y); ay1 = Math.max(ay1, p.y);
      });
      return Math.abs((ax0 + ax1) / 2 - cx) < 40 && ax1 - ax0 > 300 && ay1 - ay0 > 280 && ay0 > 56 && ax0 > 8 && ax1 < W - 8;
    }
    if (!build()) for (let t2 = 1; t2 < 240; t2++) { seed = 20260903 + t2 * 7919; if (build()) break; }
    /* one leaf per dark QR module, scattered across the affinely-centered canopy
       disc so foliage reads as a full, balanced tree (the skeleton shows through) */
    const LEAF_COLS = [[21, 128, 61], [22, 163, 74], [34, 197, 94], [74, 222, 128], [163, 230, 57]];
    const INK = [28, 28, 26];
    const canopyCX = cx, canopyCY = 336, canopyR = 206;
    const leaves = [];
    for (let gy = 0; gy < QR_N; gy++) for (let gx = 0; gx < QR_N; gx++) {
      if (QR_ROWS[gy][gx] !== "1") continue;
      const a0 = rng() * 6.283, rr = Math.sqrt(rng()), R = canopyR * rr * (0.6 + 0.4 * rng());
      const tx = canopyCX + Math.cos(a0) * R;
      const ty = canopyCY + Math.sin(a0) * R * 1.14;
      leaves.push({
        gx: gx, gy: gy,
        tx: tx, ty: ty,
        z: rng(), ph: rng() * 6.283,
        col: LEAF_COLS[(gx * 7 + gy * 13 + (gx % 3)) % LEAF_COLS.length],
        delay: Math.min(0.3, Math.max(0, (ty - 74) / (groundY - 74)) * 0.3)
      });
    }
    const fx = v => ox + (QUIET + v + 0.5) * cell, fy = v => oy + (QUIET + v + 0.5) * cell;
    const sway = (x, y, t) => Math.sin(t * 1.15 + y * 0.012 + x * 0.004) * 6.5 *
      Math.pow(Math.max(0, groundY - y) / (groundY - 74), 1.35);
    const easeIO = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const cl01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
    let flat = false, progress = 0, animFrom = 0, animTo = 0, animStart = 0, animating = false;
    let visible = false, running = false, raf = 0;
    const hasRound = typeof g.roundRect === "function";
    function draw(now) {
      const t = now / 1000, P = progress, inv = 1 - P;
      g.clearRect(0, 0, W, H);
      if (inv > 0.01) {                                   /* ground shadow (tree only) */
        g.globalAlpha = 0.13 * inv; g.fillStyle = "#1c1c1a";
        g.beginPath(); g.ellipse(cx, groundY + 12, 96 + 34 * inv, 13, 0, 0, 6.283); g.fill();
        g.globalAlpha = 1;
      }
      if (inv > 0.01) {                                   /* branches fade as it folds flat */
        g.strokeStyle = "#4a3b2c"; g.lineCap = "round"; g.globalAlpha = inv;
        for (const b of branches) {
          g.lineWidth = b.w;
          g.beginPath();
          g.moveTo(b.x1 + sway(b.x1, b.y1, t), b.y1);
          g.lineTo(b.x2 + sway(b.x2, b.y2, t), b.y2);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      for (const lf of leaves) {                          /* leaves: tree pos -> QR grid */
        const p = easeIO(cl01((P - lf.delay) / 0.7));
        const sw = inv * (sway(lf.tx, lf.ty, t) + Math.sin(t * 2.1 + lf.ph) * 1.1);
        const x = lf.tx + sw + (fx(lf.gx) - lf.tx) * p, y = lf.ty + (fy(lf.gy) - lf.ty) * p;
        const fw = 0.3 + 0.7 * Math.abs(Math.cos(p * Math.PI));
        const sz = cell * 1.08 * (0.82 + 0.36 * lf.z) * (1 - p) + cell * 0.94 * p;
        const r = Math.round(lf.col[0] + (INK[0] - lf.col[0]) * p),
          gr = Math.round(lf.col[1] + (INK[1] - lf.col[1]) * p),
          bl = Math.round(lf.col[2] + (INK[2] - lf.col[2]) * p);
        g.fillStyle = "rgb(" + r + "," + gr + "," + bl + ")";
        if (hasRound) { g.beginPath(); g.roundRect(x - sz * fw / 2, y - sz / 2, sz * fw, sz, Math.min(2.5, sz * 0.22)); g.fill(); }
        else g.fillRect(x - sz * fw / 2, y - sz / 2, sz * fw, sz);
      }
    }
    function loop(now) {
      if (animating) {
        const k = Math.min(1, (now - animStart) / DUR);
        progress = animFrom + (animTo - animFrom) * easeIO(k);
        if (k >= 1) { animating = false; progress = animTo; }
      }
      draw(now);
      if (visible && (animating || !flat)) raf = requestAnimationFrame(loop);
      else running = false;
    }
    const ensureLoop = () => { if (!running && !prefersReduced) { running = true; raf = requestAnimationFrame(loop); } };
    const renderOnce = () => draw(performance.now());
    function setFlat(v) {
      flat = v; animFrom = progress; animTo = v ? 1 : 0; animStart = performance.now();
      animating = !prefersReduced;
      if (prefersReduced) progress = v ? 1 : 0;
      stage.setAttribute("aria-pressed", String(v));
      if (hintEl) hintEl.textContent = v ? "scan me — tap to fold the tree back up"
        : "tap the tree — it folds flat into a scannable QR";
      ensureLoop(); if (prefersReduced) renderOnce();
    }
    stage.addEventListener("click", () => setFlat(!flat));
    stage.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlat(!flat); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => es.forEach(en => {
        visible = en.isIntersecting;
        if (visible) { prefersReduced ? renderOnce() : ensureLoop(); }
      }), { threshold: 0.12 }).observe(qrCanvas);
    } else { visible = true; ensureLoop(); }
    renderOnce();
  }

})();
