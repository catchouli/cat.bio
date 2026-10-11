// PS1 mode: swaps the headshot for a little WebGL cube and Ferris for a spinning item
// pickup, both rendered the way a PlayStation would have done it (see the Dreamfield
// project page for the full-size version of these tricks), and puts the whole page on a CRT.
(function () {
    "use strict";

    const STORAGE_KEY = "ps1-mode";

    const toggle = document.getElementById("ps1-toggle");
    const headshot = document.getElementById("headshot");
    const headshotContainer = document.getElementById("headshot-container");
    const ferrisContainer = document.getElementById("ferris-container");
    if (!toggle || !headshot || !headshotContainer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const VERTEX_SHADER = `
        attribute vec3 aPos;
        attribute vec2 aUv;
        attribute vec3 aNormal;
        uniform mat4 uMvp;
        uniform mat4 uModel;
        uniform vec2 uRes;
        uniform float uTwoSided;
        varying vec3 vUvW;
        varying float vLight;

        void main() {
            vec4 clip = uMvp * vec4(aPos, 1.0);

            // No subpixel precision: snap every vertex to the low-res pixel grid
            vec2 px = (clip.xy / clip.w * 0.5 + 0.5) * uRes;
            px = floor(px + 0.5);
            clip.xy = (px / uRes * 2.0 - 1.0) * clip.w;
            gl_Position = clip;

            // Affine texture mapping: WebGL always interpolates perspective-correct, so
            // pre-multiply by w here and divide it back out in the fragment shader,
            // which cancels the correction out and leaves plain screen-space interpolation
            vUvW = vec3(aUv * clip.w, clip.w);

            // Per-vertex lighting
            vec3 n = normalize((uModel * vec4(aNormal, 0.0)).xyz);
            float d = dot(n, normalize(vec3(0.5, 0.7, 0.8)));
            vLight = 0.45 + 0.75 * max(mix(d, abs(d), uTwoSided), 0.0);
        }
    `;

    const FRAGMENT_SHADER = `
        precision mediump float;
        uniform sampler2D uTex;
        varying vec3 vUvW;
        varying float vLight;

        // The PS1 GPU's 4x4 dither matrix
        float dither(vec2 p) {
            float x = mod(floor(p.x), 4.0);
            float y = mod(floor(p.y), 4.0);
            vec4 row = y < 1.0 ? vec4(-4.0, 0.0, -3.0, 1.0)
                     : y < 2.0 ? vec4(2.0, -2.0, 3.0, -1.0)
                     : y < 3.0 ? vec4(-3.0, 1.0, -4.0, 0.0)
                     :           vec4(3.0, -1.0, 2.0, -2.0);
            return x < 1.0 ? row.x : x < 2.0 ? row.y : x < 3.0 ? row.z : row.w;
        }

        void main() {
            vec4 tex = texture2D(uTex, vUvW.xy / vUvW.z);
            // 1-bit transparency, like the PS1's "colour 0 is transparent" sprites
            if (tex.a < 0.5) discard;
            vec3 col = tex.rgb * vLight * 255.0;
            // Dither, then crush to 5 bits per channel (15-bit colour)
            col = clamp(col + dither(gl_FragCoord.xy), 0.0, 255.0);
            col = floor(col / 8.0) * 8.0 / 255.0;
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    // Builds interleaved position, uv, normal data from a list of quads
    function buildQuads(quads) {
        const data = [];
        for (const { n, r, u, w = 1, h = 1, offset = 1 } of quads) {
            const corner = (sx, sy) => [0, 1, 2].map((i) => n[i] * offset + r[i] * sx * w + u[i] * sy * h);
            const uv = (sx, sy) => [(sx + 1) / 2, (1 - sy) / 2];
            for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]])
                data.push(...corner(sx, sy), ...uv(sx, sy), ...n);
        }
        return new Float32Array(data);
    }

    // Cube with the same texture on every face
    function cubeMesh() {
        return buildQuads([
            { n: [0, 0, 1], r: [1, 0, 0], u: [0, 1, 0] },
            { n: [0, 0, -1], r: [-1, 0, 0], u: [0, 1, 0] },
            { n: [1, 0, 0], r: [0, 0, -1], u: [0, 1, 0] },
            { n: [-1, 0, 0], r: [0, 0, 1], u: [0, 1, 0] },
            { n: [0, 1, 0], r: [1, 0, 0], u: [0, 0, -1] },
            { n: [0, -1, 0], r: [1, 0, 0], u: [0, 0, 1] },
        ]);
    }

    // Flat two-sided card. The back face runs right-to-left, so the sprite still reads
    // the right way round (rather than mirrored) when it's facing away.
    function cardMesh(aspect) {
        return buildQuads([
            { n: [0, 0, 1], r: [1, 0, 0], u: [0, 1, 0], w: aspect, offset: 0 },
            { n: [0, 0, -1], r: [-1, 0, 0], u: [0, 1, 0], w: aspect, offset: 0 },
        ]);
    }

    function perspective(fovy, aspect, near, far) {
        const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
        return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    }

    function multiply(a, b) {
        const out = new Array(16);
        for (let c = 0; c < 4; c++)
            for (let r = 0; r < 4; r++)
                out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] +
                                 a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        return out;
    }

    // Ry(yaw) * Rx(pitch), then translated, column-major
    function transform(pitch, yaw, y) {
        const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
        return [cy, 0, -sy, 0, sy * sp, cp, cy * sp, 0, sy * cp, -sp, cy * cp, 0, 0, y, 0, 1];
    }

    function compile(gl, type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw new Error(gl.getShaderInfoLog(shader));
        return shader;
    }

    // Loads an image at a known size. SVGs without an intrinsic size (like Ferris) can't
    // be drawn to a canvas in every browser, so they get one stamped on first.
    async function loadImage(src, width, height) {
        let url = src;
        if (src.endsWith(".svg")) {
            const doc = new DOMParser().parseFromString(await (await fetch(src)).text(), "image/svg+xml");
            doc.documentElement.setAttribute("width", width);
            doc.documentElement.setAttribute("height", height);
            const blob = new Blob([new XMLSerializer().serializeToString(doc)], { type: "image/svg+xml" });
            url = URL.createObjectURL(blob);
        }
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
    }

    // Draws the source image onto a tiny canvas so the texels are nice and chunky,
    // like VRAM demanded. Square textures get centre-cropped.
    function shrink(img, width, height, crop) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (crop) {
            const side = Math.min(img.naturalWidth, img.naturalHeight);
            ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side,
                0, 0, width, height);
        } else {
            ctx.drawImage(img, 0, 0, width, height);
        }
        return canvas;
    }

    // Creates a canvas inside `container` rendering `mesh` textured with `texture`.
    // `animate(state, dt, time)` updates pitch/yaw/y each frame.
    function createRenderer({ container, id, label, width, height, mesh, texture, distance, twoSided, animate, draggable }) {
        const canvas = document.createElement("canvas");
        canvas.id = id;
        canvas.className = "ps1-canvas";
        canvas.width = width;
        canvas.height = height;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", label);

        const gl = canvas.getContext("webgl", { antialias: false, alpha: true });
        if (!gl) return null;

        const program = gl.createProgram();
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw new Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
        const stride = 8 * 4;
        [["aPos", 3, 0], ["aUv", 2, 3], ["aNormal", 3, 5]].forEach(([name, size, offset]) => {
            const loc = gl.getAttribLocation(program, name);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
        });

        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);

        const uMvp = gl.getUniformLocation(program, "uMvp");
        const uModel = gl.getUniformLocation(program, "uModel");
        gl.uniform2f(gl.getUniformLocation(program, "uRes"), width, height);
        gl.uniform1f(gl.getUniformLocation(program, "uTwoSided"), twoSided ? 1 : 0);

        const proj = perspective(0.9, width / height, 0.1, 20);
        const view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -distance, 1];
        const viewProj = multiply(proj, view);
        const vertexCount = mesh.length / 8;

        const state = { pitch: 0, yaw: 0, y: 0, vPitch: 0, vYaw: 0, dragging: false };
        let lastTime = 0, frame = null, visible = true;

        if (draggable) {
            let lastX = 0, lastY = 0;
            canvas.classList.add("draggable");
            canvas.addEventListener("pointerdown", (e) => {
                state.dragging = true;
                lastX = e.clientX; lastY = e.clientY;
                canvas.setPointerCapture(e.pointerId);
            });
            canvas.addEventListener("pointermove", (e) => {
                if (!state.dragging) return;
                const dx = e.clientX - lastX, dy = e.clientY - lastY;
                lastX = e.clientX; lastY = e.clientY;
                state.yaw += dx * 0.02; state.pitch += dy * 0.02;
                state.vYaw = dx * 1.2; state.vPitch = dy * 1.2;
                start();
            });
            const release = () => { state.dragging = false; };
            canvas.addEventListener("pointerup", release);
            canvas.addEventListener("pointercancel", release);
        }

        // Don't burn frames on whatever's scrolled out of view
        if ("IntersectionObserver" in window) {
            new IntersectionObserver((entries) => {
                visible = entries[entries.length - 1].isIntersecting;
                if (visible) start();
            }).observe(canvas);
        }

        function draw(time) {
            const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
            lastTime = time;
            const moving = animate(state, dt, time / 1000);

            const model = transform(state.pitch, state.yaw, state.y);
            gl.uniformMatrix4fv(uModel, false, model);
            gl.uniformMatrix4fv(uMvp, false, multiply(viewProj, model));
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

            const keepGoing = moving && visible && document.body.classList.contains("ps1");
            frame = keepGoing ? requestAnimationFrame(draw) : null;
        }

        function start() {
            if (frame === null) { lastTime = 0; frame = requestAnimationFrame(draw); }
        }

        container.appendChild(canvas);
        container.classList.add("ps1-ready");
        return { start };
    }

    // Headshot cube: drag to fling it around, otherwise it idles
    function createHeadshotCube() {
        const idle = reducedMotion ? 0 : 0.6;
        return createRenderer({
            container: headshotContainer,
            id: "ps1-headshot",
            label: "Spinning PS1-style cube with Caitlin's face on it. Drag to spin it.",
            width: 75, height: 75,
            mesh: cubeMesh(),
            texture: shrink(headshot, 64, 64, true),
            distance: 4.2,
            draggable: true,
            animate(state, dt) {
                if (!state.init) Object.assign(state, { init: true, pitch: -0.4, yaw: 0.6, vYaw: idle });
                if (!state.dragging) {
                    state.yaw += state.vYaw * dt;
                    state.pitch += state.vPitch * dt;
                    // Ease back towards a gentle idle spin after a fling
                    const k = Math.min(dt * 1.5, 1);
                    state.vYaw += (idle - state.vYaw) * k;
                    state.vPitch += (0 - state.vPitch) * k;
                }
                return state.dragging || Math.abs(state.vYaw) > 0.001 || Math.abs(state.vPitch) > 0.001;
            },
        });
    }

    // Ferris: a spinning, bobbing item pickup, like you'd find lying around in a dungeon
    async function createFerrisPickup() {
        const img = await loadImage("/images/rustacean-flat-happy.svg", 96, 64);
        return createRenderer({
            container: ferrisContainer,
            id: "ps1-ferris",
            label: "Ferris the Rustacean, spinning like a PS1 item pickup",
            width: 60, height: 50,
            mesh: cardMesh(1.5),
            texture: shrink(img, 48, 32, false),
            distance: 3.2,
            twoSided: true,
            animate(state, dt, t) {
                if (reducedMotion) {
                    state.yaw = 0.35;
                    return false;
                }
                state.yaw = t * 2.2;
                state.y = Math.sin(t * 3) * 0.12;
                return true;
            },
        });
    }

    let headshotRenderer = null, ferrisRenderer = null;

    async function startRenderers() {
        try {
            if (!headshotRenderer) headshotRenderer = createHeadshotCube();
            if (headshotRenderer) headshotRenderer.start();
        } catch (e) {
            console.warn("PS1 mode: couldn't start the headshot renderer", e);
        }
        if (!ferrisContainer) return;
        try {
            if (!ferrisRenderer) ferrisRenderer = await createFerrisPickup();
            if (ferrisRenderer) ferrisRenderer.start();
        } catch (e) {
            console.warn("PS1 mode: couldn't start the Ferris renderer", e);
        }
    }

    function setMode(on) {
        document.body.classList.toggle("ps1", on);
        toggle.innerHTML = on ? "&#9632; Exit PS1 mode" : "&#9654; PS1 mode";
        toggle.setAttribute("aria-pressed", on ? "true" : "false");
        try { localStorage.setItem(STORAGE_KEY, on ? "1" : "0"); } catch (e) { /* not important */ }
        if (on) startRenderers();
    }

    function init() {
        toggle.hidden = false;
        toggle.addEventListener("click", () => setMode(!document.body.classList.contains("ps1")));

        let saved = false;
        try { saved = localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { /* default off */ }
        if (saved) setMode(true);
    }

    if (headshot.complete && headshot.naturalWidth) init();
    else headshot.addEventListener("load", init);
})();
