// create the canvas
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W = window.innerWidth;
let H = window.innerHeight;

// update the canvas dimensions when the window is resized
function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // map user coords -> device pixels
}
window.addEventListener('resize', resize);
resize();

// new object for each particle
class Particle {
    constructor(x,y,r=3) {
        this.x = x; this.y = y;
        // set the velocity to some random value mean 60
        this.vx = (Math.random()-0.5) * 60; // px/s
        this.vy = (Math.random()-0.5) * 60;
        this.r = r;
        this.maxSpeed = 400;
    }
    applyForce(ax, ay, dt) {
        // velocity = acceleration * time
        this.vx += ax * dt;
        this.vy += ay * dt;
        // total speed
        const s = Math.hypot(this.vx, this.vy);
        if (s > this.maxSpeed) {
            const scale = this.maxSpeed / s;
            this.vx *= scale; this.vy *= scale;
        }
    }
    update(dt, W, H) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // bounce the edges softly by switching velocity if off edge
        if (this.x < this.r) { this.x = this.r; this.vx *= -0.6; }
        if (this.x > W - this.r) { this.x = W - this.r; this.vx *= -0.6; }
        if (this.y < this.r) { this.y = this.r; this.vy *= -0.6; }
        if (this.y > H - this.r) { this.y = H - this.r; this.vy *= -0.6; }
        // slight damping
        this.vx *= 0.995; this.vy *= 0.995;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fill();
    }
}

// generate the particles on page load by adding to the list
const minCount = 25, maxCount = 100;
const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
particles = [];
function spawnRandomParticles() {
    for (let i=0; i<count; i++){
        // anywhere on the page with a non-negligable radius
        particles.push(new Particle(Math.random()*W, Math.random()*H, 2 + Math.random()*3));
    }
}
spawnRandomParticles()

// pointer
const pointer = { x: W/2, y: H/2, down: false };
window.addEventListener('pointerdown', e => { pointer.down = true; pointer.x = e.clientX; pointer.y = e.clientY; });
window.addEventListener('pointerup',   () => { pointer.down = false; });
window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; });

// physics params (adjust as you please)
const repulseRadius = 60;
const repulsionStrength = 1300;
const attractRadius = 400;
const attractStrength = 1000;
const noiseStrength = 60;

function physicsStep(dt) {
    if (!pointer.down) {
        // go through the particle list and consider repulsion between
        for (let i = 0; i < particles.length; i++) {
            const pi = particles[i];
            let ax = 0, ay = 0;
            for (let j = 0; j < particles.length; j++) {
                if (i === j) continue;
                const pj = particles[j];
                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const dist2 = dx*dx + dy*dy + 1e-6;
                const dist = Math.sqrt(dist2);
                // if the particles touch
                if (dist < repulseRadius) {
                    const push = (1 - dist/repulseRadius) * (repulsionStrength / dist2);
                    ax += (dx/dist) * push;
                    ay += (dy/dist) * push;
                }
            }
            ax += (Math.random() - 0.5) * noiseStrength;
            ay += (Math.random() - 0.5) * noiseStrength;
            pi.applyForce(ax, ay, dt);
        }
    } else {
        // attract to pointer
        for (let p of particles) {
            const dx = pointer.x - p.x, dy = pointer.y - p.y;
            const dist = Math.hypot(dx, dy) + 1e-6;
            if (dist < attractRadius) {
                const factor = (1 - dist/attractRadius);
                p.applyForce((dx/dist) * attractStrength * factor, (dy/dist) * attractStrength * factor, dt);
            } else {
                // gentle distant pull
                p.applyForce((dx/dist) * (attractStrength * 0.02), (dy/dist) * (attractStrength * 0.02), dt);
            }
        }
    }
}

// teleport particles to a center (instant reposition)
function teleportParticlesTo(cx, cy, spread = 60) {
    for (const p of particles) {
        p.x = cx + (Math.random() - 0.5) * spread;
        p.y = cy + (Math.random() - 0.5) * spread;
        p.vx = (Math.random() - 0.5) * 80;
        p.vy = (Math.random() - 0.5) * 80;
    }
}

// schedule teleport every bar via tone.js
function scheduleTeleport() {
    const doTeleport = () => {
      const marginX = Math.max(80, W * 0.08);
      const marginY = Math.max(80, H * 0.08);
      const cx = marginX + Math.random() * (W - 2 * marginX);
      const cy = marginY + Math.random() * (H - 2 * marginY);
      teleportParticlesTo(cx, cy, Math.min(W, H) * 0.12);
    };
    Tone.Transport.scheduleRepeat(doTeleport, "1m")
}
scheduleTeleport()

let last = performance.now();

function animate(now) {
    const dt = (now - last) / 1000; // delta time in seconds
    last = now;

    // clear canvas
    ctx.clearRect(0, 0, W, H);

    // update & draw each particle
    for (const p of particles) {
        p.update(dt, W, H);
        physicsStep(dt);
        p.draw(ctx);
    }

    requestAnimationFrame(animate)

}

requestAnimationFrame(animate);