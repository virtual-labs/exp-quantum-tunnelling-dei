// DOM elements
const theCanvas = document.getElementById("theCanvas");
const theContext = theCanvas.getContext("2d");
const leftPercent = document.getElementById("leftPercent");
const rightPercent = document.getElementById("rightPercent");
const pauseButton = document.getElementById("pauseButton");
const speedSlider = document.getElementById("speedSlider");
const speedReadout = document.getElementById("speedReadout");
const realImag = document.getElementById("realImag");
const gridCheck = document.getElementById("gridCheck");
const wpEnergySlider = document.getElementById("wpEnergySlider");
const wpEnergyReadout = document.getElementById("wpEnergyReadout");
const barrierEnergySlider = document.getElementById("barrierEnergySlider");
const barrierEnergyReadout = document.getElementById("barrierEnergyReadout");
const barrierWidthSlider = document.getElementById("barrierWidthSlider");
const barrierWidthReadout = document.getElementById("barrierWidthReadout");
const barrierRampSlider = document.getElementById("barrierRampSlider");
const barrierRampReadout = document.getElementById("barrierRampReadout");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const observationList = document.getElementById("observationList");

// Data display elements
const dataEnergy = document.getElementById("dataEnergy");
const dataBarrier = document.getElementById("dataBarrier");
const dataWidth = document.getElementById("dataWidth");
const dataTransmission = document.getElementById("dataTransmission");
const dataReflection = document.getElementById("dataReflection");

// Global variables
const xMax = Number(theCanvas.width);
const cHeight = Number(theCanvas.height);
const pWidth = 49;
let psi = { re: new Array(xMax + 1), im: new Array(xMax + 1) };
let psiLast = { re: new Array(xMax + 1), im: new Array(xMax + 1) };
let psiNext = { re: new Array(xMax + 1), im: new Array(xMax + 1) };
psiNext.re[0] = psiNext.re[xMax] = psiNext.im[0] = psiNext.im[xMax] = 0.0;
let v = new Array(xMax + 1);
const nColors = 360;
let phaseColor = new Array(nColors + 1);
for (let c = 0; c <= nColors; c++) {
    phaseColor[c] = colorString(c / nColors);
}
const nBarrierShades = 100;
let plusBarrierShade = new Array(nBarrierShades + 1);
let minusBarrierShade = new Array(nBarrierShades + 1);
for (let c = 0; c <= nBarrierShades; c++) {
    plusBarrierShade[c] = `hsl(260, 70%, ${20 + 30 * c / nBarrierShades}%)`;
    minusBarrierShade[c] = `hsl(200, 70%, ${20 + 30 * c / nBarrierShades}%)`;
}
const bEmax = Number(barrierEnergySlider.max);
const bEmin = Number(barrierEnergySlider.min);
const dt = 0.45;
let running = false;

// Event listeners
wpEnergySlider.addEventListener('input', wpEnergyAdjust);
wpEnergySlider.addEventListener('change', wpEnergyAdjust);
barrierEnergySlider.addEventListener('input', barrierAdjust);
barrierEnergySlider.addEventListener('change', barrierAdjust);
barrierWidthSlider.addEventListener('input', barrierAdjust);
barrierWidthSlider.addEventListener('change', barrierAdjust);
barrierRampSlider.addEventListener('input', barrierAdjust);
barrierRampSlider.addEventListener('change', barrierAdjust);
speedSlider.addEventListener('input', () => {
    speedReadout.textContent = speedSlider.value + 'x';
});
realImag.addEventListener('change', paintCanvas);
document.getElementById('densityPhase').addEventListener('change', paintCanvas);
gridCheck.addEventListener('change', paintCanvas);

// Initialize
barrierAdjust();
reset();

// Preset configurations
const presets = {
    easy: { energy: 0.080, barrier: 0.040, width: 15, ramp: 0 },
    medium: { energy: 0.040, barrier: 0.050, width: 20, ramp: 0 },
    hard: { energy: 0.020, barrier: 0.080, width: 30, ramp: 0 },
    classical: { energy: 0.070, barrier: 0.030, width: 20, ramp: 0 },
    wide: { energy: 0.050, barrier: 0.060, width: 45, ramp: 0 },
    step: { energy: 0.040, barrier: 0.050, width: 51, ramp: 10 }
};

function loadPreset(name) {
    const preset = presets[name];
    if (!preset) return;

    // Update sliders
    wpEnergySlider.value = preset.energy;
    barrierEnergySlider.value = preset.barrier;
    barrierWidthSlider.value = preset.width;
    barrierRampSlider.value = preset.ramp;

    // Trigger updates
    wpEnergyAdjust();
    barrierAdjust();
    reset();

    // Update observations based on preset
    updateObservations(name);

    // Highlight selected preset
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.preset-btn').classList.add('active');
}

function updateObservations(preset) {
    const observations = {
        easy: [
            { icon: "✓", text: "High particle energy (E) compared to barrier height (V₀)" },
            { icon: "✓", text: "Expect high tunnelling probability" },
            { icon: "✓", text: "Watch how most of the wave transmits through!" }
        ],
        medium: [
            { icon: "✓", text: "Particle energy roughly equals barrier height" },
            { icon: "✓", text: "Partial tunnelling expected" },
            { icon: "✓", text: "Observe wave splitting into reflected and transmitted parts" }
        ],
        hard: [
            { icon: "✓", text: "Low energy particle facing high barrier" },
            { icon: "✓", text: "Very low tunnelling probability" },
            { icon: "✓", text: "Most of the wave will be reflected" }
        ],
        classical: [
            { icon: "✓", text: "Energy exceeds barrier height (E > V₀)" },
            { icon: "✓", text: "Classical physics allows passage" },
            { icon: "✓", text: "But still observe quantum effects!" }
        ],
        wide: [
            { icon: "✓", text: "Very wide barrier increases tunnelling difficulty" },
            { icon: "✓", text: "Transmission coefficient decreases exponentially with width" },
            { icon: "✓", text: "T ∝ e^(-2κL) - observe this relationship!" }
        ],
        step: [
            { icon: "✓", text: "Step potential (infinite width)" },
            { icon: "✓", text: "Demonstrates wave reflection at discontinuity" },
            { icon: "✓", text: "No classical analogue for this behavior" }
        ]
    };

    const obs = observations[preset] || observations.medium;
    observationList.innerHTML = obs.map(o =>
        `<li><span class="icon">${o.icon}</span><span>${o.text}</span></li>`
    ).join('');
}

function startStop() {
    running = !running;
    if (running) {
        pauseButton.innerHTML = "⏸️";
        statusIndicator.className = "status-indicator running";
        statusText.textContent = "Running";
        nextFrame();
    } else {
        pauseButton.innerHTML = "▶️";
        statusIndicator.className = "status-indicator paused";
        statusText.textContent = "Paused";
    }
}

function wpEnergyAdjust() {
    const energy = Number(wpEnergySlider.value);
    const a = 1 / (pWidth * pWidth);
    const sigma = Math.sqrt(2 * energy * a + a * a / 2) + a / 2;
    wpEnergyReadout.innerHTML = energy.toFixed(3) + " ± " + sigma.toFixed(3);
    dataEnergy.textContent = energy.toFixed(3);
    if (!running) reset();
}

function barrierAdjust() {
    const bEnergy = Number(barrierEnergySlider.value);
    const bWidth = Number(barrierWidthSlider.value);
    const bRamp = Number(barrierRampSlider.value);

    barrierEnergyReadout.textContent = bEnergy.toFixed(3).replace("-", "−");
    barrierRampReadout.textContent = bRamp;
    dataBarrier.textContent = bEnergy.toFixed(3);

    for (let x = 0; x <= xMax; x++) {
        v[x] = 0.0;
    }

    if (bWidth < 51) {
        barrierWidthReadout.textContent = bWidth;
        dataWidth.textContent = bWidth + " units";
        const barrierLeft = Math.round((xMax - bWidth) / 2);
        for (let x = barrierLeft; x < barrierLeft + bWidth; x++) {
            v[x] = bEnergy;
        }
        for (let dx = 1; dx <= bRamp; dx++) {
            v[barrierLeft - dx] = bEnergy * (1 - dx / (bRamp + 1));
            v[barrierLeft + bWidth + dx - 1] = bEnergy * (1 - dx / (bRamp + 1));
        }
    } else {
        barrierWidthReadout.textContent = "∞";
        dataWidth.textContent = "Step (∞)";
        const barrierLeft = Math.round((xMax + bRamp) / 2);
        for (let x = barrierLeft; x <= xMax; x++) {
            v[x] = bEnergy;
        }
        for (let dx = 1; dx <= bRamp; dx++) {
            v[barrierLeft - dx] = bEnergy * (1 - dx / (bRamp + 1));
        }
    }

    paintCanvas();
}

function nextFrame() {
    if (running) {
        const stepsPerFrame = Number(speedSlider.value);
        for (let step = 0; step < stepsPerFrame; step++) doStep();
        paintCanvas();
        window.setTimeout(nextFrame, 1000 / 40);
    }
}

function doStep() {
    for (let x = 1; x < xMax; x++) {
        psiNext.re[x] = psiLast.re[x] + dt * (-psi.im[x + 1] - psi.im[x - 1] + 2 * (1 + v[x]) * psi.im[x]);
        psiNext.im[x] = psiLast.im[x] - dt * (-psi.re[x + 1] - psi.re[x - 1] + 2 * (1 + v[x]) * psi.re[x]);
    }
    for (let x = 1; x < xMax; x++) {
        psiLast.re[x] = psi.re[x];
        psiLast.im[x] = psi.im[x];
        psi.re[x] = psiNext.re[x];
        psi.im[x] = psiNext.im[x];
    }
}

function reset() {
    const center = 150;
    const packetE = Number(wpEnergySlider.value);
    const k = Math.sqrt(2 * packetE);

    for (let x = 0; x <= xMax; x++) {
        const envelope = Math.exp(-(x - center) * (x - center) / (pWidth * pWidth));
        psi.re[x] = envelope * Math.cos(k * x);
        psi.im[x] = envelope * Math.sin(k * x);
    }

    for (let x = 1; x < xMax; x++) {
        psiLast.re[x] = psi.re[x] - 0.5 * dt * (-psi.im[x + 1] - psi.im[x - 1] + 2 * (1 + v[x]) * psi.im[x]);
        psiLast.im[x] = psi.im[x] + 0.5 * dt * (-psi.re[x + 1] - psi.re[x - 1] + 2 * (1 + v[x]) * psi.re[x]);
    }

    paintCanvas();
    if (!running) {
        pauseButton.innerHTML = "▶️";
        statusIndicator.className = "status-indicator paused";
        statusText.textContent = "Ready";
    }
}

function paintCanvas() {
    // Create gradient background
    const bgGradient = theContext.createLinearGradient(0, 0, 0, theCanvas.height);
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(1, '#12122a');
    theContext.fillStyle = bgGradient;
    theContext.fillRect(0, 0, theCanvas.width, theCanvas.height);

    // Draw barrier with gradient
    theContext.lineWidth = 2;
    for (let x = 1; x < xMax; x++) {
        if (v[x] !== 0) {
            if (v[x] > 0) {
                theContext.strokeStyle = plusBarrierShade[Math.round(nBarrierShades * v[x] / bEmax)];
            } else {
                theContext.strokeStyle = minusBarrierShade[Math.round(nBarrierShades * v[x] / bEmin)];
            }
            theContext.beginPath();
            theContext.moveTo(x, 0);
            theContext.lineTo(x, theCanvas.height);
            theContext.stroke();
        }
    }

    let baselineY, pxPerY, gridBase, gridOffset;
    const delta = 20;

    if (realImag.checked) {
        baselineY = cHeight * 0.5;
        gridBase = cHeight;
        gridOffset = (cHeight / 2) % delta;
        pxPerY = baselineY * 0.8;

        // Draw axis
        theContext.strokeStyle = "rgba(148, 163, 184, 0.5)";
        theContext.lineWidth = 1;
        theContext.beginPath();
        theContext.moveTo(0, baselineY);
        theContext.lineTo(xMax, baselineY);
        theContext.stroke();

        theContext.lineWidth = 3;

        // Real part - orange gradient
        theContext.beginPath();
        theContext.moveTo(0, baselineY - psi.re[0] * pxPerY);
        for (let x = 1; x <= xMax; x++) {
            theContext.lineTo(x, baselineY - psi.re[x] * pxPerY);
        }
        theContext.strokeStyle = "#f59e0b";
        theContext.shadowColor = "#f59e0b";
        theContext.shadowBlur = 10;
        theContext.stroke();
        theContext.shadowBlur = 0;

        // Imaginary part - cyan
        theContext.beginPath();
        theContext.moveTo(0, baselineY - psi.im[0] * pxPerY);
        for (let x = 1; x <= xMax; x++) {
            theContext.lineTo(x, baselineY - psi.im[x] * pxPerY);
        }
        theContext.strokeStyle = "#06b6d4";
        theContext.shadowColor = "#06b6d4";
        theContext.shadowBlur = 10;
        theContext.stroke();
        theContext.shadowBlur = 0;

    } else {
        // Density/phase plot
        baselineY = cHeight * 0.93;
        gridBase = baselineY;
        gridOffset = delta;
        pxPerY = baselineY * 0.55;

        // Draw axis
        theContext.strokeStyle = "rgba(148, 163, 184, 0.3)";
        theContext.lineWidth = 1;
        theContext.beginPath();
        theContext.moveTo(0, baselineY);
        theContext.lineTo(xMax, baselineY);
        theContext.stroke();

        theContext.lineWidth = 3;
        for (let x = 0; x <= xMax; x++) {
            theContext.beginPath();
            theContext.moveTo(x, baselineY);
            const density = psi.re[x] * psi.re[x] + psi.im[x] * psi.im[x];
            theContext.lineTo(x, baselineY - pxPerY * density);
            let localPhase = Math.atan2(psi.im[x], psi.re[x]);
            if (localPhase < 0) localPhase += 2 * Math.PI;
            theContext.strokeStyle = phaseColor[Math.round(localPhase * nColors / (2 * Math.PI))];
            theContext.stroke();
        }
    }

    // Draw grid
    if (gridCheck.checked) {
        theContext.strokeStyle = "rgba(148, 163, 184, 0.15)";
        theContext.lineWidth = 1;
        for (let x = delta; x < xMax; x += delta) {
            theContext.beginPath();
            theContext.moveTo(x, 0);
            theContext.lineTo(x, gridBase);
            theContext.stroke();
        }
        for (let y = gridBase - gridOffset; y > 0; y -= delta) {
            theContext.beginPath();
            theContext.moveTo(0, y);
            theContext.lineTo(xMax, y);
            theContext.stroke();
        }
    }

    // Calculate percentages
    let leftIntegral = 0.0;
    let rightIntegral = 0.0;
    for (let x = 0; x < xMax / 2; x++) {
        leftIntegral += psi.re[x] * psi.re[x] + psi.im[x] * psi.im[x];
    }
    for (let x = (xMax / 2) + 1; x <= xMax; x++) {
        rightIntegral += psi.re[x] * psi.re[x] + psi.im[x] * psi.im[x];
    }
    const mid = psi.re[xMax / 2] * psi.re[xMax / 2] + psi.im[xMax / 2] * psi.im[xMax / 2];
    leftIntegral += mid / 2;
    rightIntegral += mid / 2;

    const total = leftIntegral + rightIntegral;
    const leftPct = (100 * leftIntegral / total).toFixed(1);
    const rightPct = (100 * rightIntegral / total).toFixed(1);

    leftPercent.innerHTML = `⬅️ Reflected: ${leftPct}%`;
    rightPercent.innerHTML = `Transmitted: ${rightPct}% ➡️`;

    // Update data display
    dataTransmission.textContent = rightPct + "%";
    dataReflection.textContent = leftPct + "%";
}

function twoDigitHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function colorString(hue) {
    let r, g, b;
    if (hue < 1 / 6) {
        r = 255; g = Math.round(hue * 6 * 255); b = 0;
    } else if (hue < 1 / 3) {
        r = Math.round((1 / 3 - hue) * 6 * 255); g = 255; b = 0;
    } else if (hue < 1 / 2) {
        r = 0; g = 255; b = Math.round((hue - 1 / 3) * 6 * 255);
    } else if (hue < 2 / 3) {
        r = 0; g = Math.round((2 / 3 - hue) * 6 * 255); b = 255;
    } else if (hue < 5 / 6) {
        r = Math.round((hue - 2 / 3) * 6 * 255); g = 0; b = 255;
    } else {
        r = 255; g = 0; b = Math.round((1 - hue) * 6 * 255);
    }
    return "#" + twoDigitHex(r) + twoDigitHex(g) + twoDigitHex(b);
}
