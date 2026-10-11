// PS1 mode: swaps the headshot for a little WebGL cube rendered the way a PlayStation
// would have done it (see the Dreamfield project page for the full-size version of
// these tricks), and puts the whole page on a CRT.
(function () {
    "use strict";

    const RES = 75;           // internal render resolution, upscaled 2x with nearest filtering
    const TEX_SIZE = 64;      // headshot gets crushed down to a tiny texture, like VRAM demanded
    const STORAGE_KEY = "ps1-mode";

    const toggle = document.getElementById("ps1-toggle");
    const container = document.getElementById("headshot-container");
    const headshot = document.getElementById("headshot");
    if (!toggle || !container || !headshot) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const VERTEX_SHADER = `
        attribute vec3 aPos;
        attribute vec2 aUv;
        attribute vec3 aNormal;
        uniform mat4 uMvp;
        uniform mat4 uModel;
        uniform float uRes;
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
            vLight = 0.45 + 0.75 * max(dot(n, normalize(vec3(0.5, 0.7, 0.8))), 0.0);
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
            vec2 uv = vUvW.xy / vUvW.z;
            vec3 col = texture2D(uTex, uv).rgb * vLight * 255.0;
            // Dither, then crush to 5 bits per channel (15-bit colour)
            col = clamp(col + dither(gl_FragCoord.xy), 0.0, 255.0);
            col = floor(col / 8.0) * 8.0 / 255.0;
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    // Cube with the headshot on every face: position, uv, normal
    function buildCube() {
        const faces = [
            // normal, right, up
            [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
            [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
            [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
            [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
            [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
            [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
        ];
        const data = [];
        for (const [n, r, u] of faces) {
            const corner = (sx, sy) => [
                n[0] + r[0] * sx + u[0] * sy,
                n[1] + r[1] * sx + u[1] * sy,
                n[2] + r[2] * sx + u[2] * sy,
            ];
            const verts = [
                [corner(-1, -1), [0, 1]], [corner(1, -1), [1, 1]], [corner(1, 1), [1, 0]],
                [corner(-1, -1), [0, 1]], [corner(1, 1), [1, 0]], [corner(-1, 1), [0, 0]],
            ];
            for (const [p, uv] of verts) data.push(...p, ...uv, ...n);
        }
        return new Float32Array(data);
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

    function rotation(pitch, yaw) {
        const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
        // Ry(yaw) * Rx(pitch), column-major
        return [cy, 0, -sy, 0, sy * sp, cp, cy * sp, 0, sy * cp, -sp, cy * cp, 0, 0, 0, 0, 1];
    }

    function compile(gl, type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw new Error(gl.getShaderInfoLog(shader));
        return shader;
    }

    let renderer = null;

    function createRenderer() {
        const canvas = document.createElement("canvas");
        canvas.id = "ps1-canvas";
        canvas.width = canvas.height = RES;
        canvas.setAttribute("aria-label", "Spinning PS1-style cube with Caitlin's face on it. Drag to spin it.");
        canvas.setAttribute("role", "img");

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
        gl.bufferData(gl.ARRAY_BUFFER, buildCube(), gl.STATIC_DRAW);
        const stride = 8 * 4;
        [["aPos", 3, 0], ["aUv", 2, 3], ["aNormal", 3, 5]].forEach(([name, size, offset]) => {
            const loc = gl.getAttribLocation(program, name);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
        });

        // Downscale the headshot onto a tiny canvas first so the texels are nice and chunky
        const small = document.createElement("canvas");
        small.width = small.height = TEX_SIZE;
        const ctx = small.getContext("2d");
        const side = Math.min(headshot.naturalWidth, headshot.naturalHeight);
        ctx.drawImage(headshot,
            (headshot.naturalWidth - side) / 2, (headshot.naturalHeight - side) / 2, side, side,
            0, 0, TEX_SIZE, TEX_SIZE);

        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, small);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.viewport(0, 0, RES, RES);
        gl.clearColor(0, 0, 0, 0);

        const uMvp = gl.getUniformLocation(program, "uMvp");
        const uModel = gl.getUniformLocation(program, "uModel");
        gl.uniform1f(gl.getUniformLocation(program, "uRes"), RES);

        const proj = perspective(0.9, 1, 0.1, 20);
        const view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -4.2, 1];
        const viewProj = multiply(proj, view);

        // Spin state: drag to fling it around, otherwise it idles
        const state = { pitch: -0.4, yaw: 0.6, vPitch: 0, vYaw: reducedMotion ? 0 : 0.6, dragging: false };
        let lastX = 0, lastY = 0, lastTime = 0, frame = null;

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

        function draw(time) {
            const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
            lastTime = time;

            if (!state.dragging) {
                state.yaw += state.vYaw * dt;
                state.pitch += state.vPitch * dt;
                // Ease back towards a gentle idle spin after a fling
                const idle = reducedMotion ? 0 : 0.6;
                const k = Math.min(dt * 1.5, 1);
                state.vYaw += (idle - state.vYaw) * k;
                state.vPitch += (0 - state.vPitch) * k;
            }

            const model = rotation(state.pitch, state.yaw);
            gl.uniformMatrix4fv(uModel, false, model);
            gl.uniformMatrix4fv(uMvp, false, multiply(viewProj, model));
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 36);

            const moving = state.dragging || Math.abs(state.vYaw) > 0.001 || Math.abs(state.vPitch) > 0.001;
            frame = moving && document.body.classList.contains("ps1") ? requestAnimationFrame(draw) : null;
        }

        function start() {
            if (frame === null) { lastTime = 0; frame = requestAnimationFrame(draw); }
        }

        container.appendChild(canvas);
        return { start };
    }

    function setMode(on) {
        document.body.classList.toggle("ps1", on);
        toggle.innerHTML = on ? "&#9632; Exit PS1 mode" : "&#9654; PS1 mode";
        toggle.setAttribute("aria-pressed", on ? "true" : "false");
        try { localStorage.setItem(STORAGE_KEY, on ? "1" : "0"); } catch (e) { /* not important */ }

        if (on) {
            try {
                if (!renderer) renderer = createRenderer();
            } catch (e) {
                console.warn("PS1 mode: couldn't start the renderer", e);
            }
            if (renderer) renderer.start();
        }
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
