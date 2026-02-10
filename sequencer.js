// Set the base URL for the drum samples to be triggered
let base_url = "https://oliverkiranbrown.com/public/samples/";
let sequencer;

// define the instrument by linking the variable names to mp3 files
sequencer = new Tone.Players({
    kick: base_url + "kick.mp3",
    snare: base_url + "snare.mp3",
    open_hat: base_url + "open_hat.mp3",
    closed_hat: base_url + "closed_hat.mp3"
}).toDestination();

// make the array for each drum voice
let kick_pattern = Array(16).fill(0);
let snare_pattern = Array(16).fill(0);
let open_hh_pattern = Array(16).fill(0);
let closed_hh_pattern = Array(16).fill(0);

// some pre-defined grooves so it sounds good from the start!
const predefinedPatterns = [
    {
        name:       "groove_one",
        kick:       [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
        snare:      [0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],
        open_hat:   [0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
        closed_hat: [0,0,1,0,1,1,0,0,0,1,0,1,0,1,0,1]
        
    },
    {
        name:       "groove_two",
        kick:       [0,0,1,0,1,0,0,1,0,0,0,0,1,1,0,0],
        snare:      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0],
        open_hat:   [0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
        closed_hat: [0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0]
    },
    {
        name:       "dance",
        kick:       [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare:      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        open_hat:   [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        closed_hat: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]
    }
];

// pattern loader
function load_pattern(pattern) {
    // create a copy of the array to avoid mutating original
    kick_pattern = [...pattern.kick];
    snare_pattern = [...pattern.snare];
    open_hh_pattern = [...pattern.open_hat];
    closed_hh_pattern = [...pattern.closed_hat];
    // visually update the grid too
    update_grid_visuals();
}

// helper function to wipe the slate
function update_grid_visuals() {
    document.querySelectorAll(".step").forEach(stepDiv => {
        const instrument = stepDiv.dataset.instrument;
        const index = parseInt(stepDiv.dataset.step);
        const patternArray = getPatternArray(instrument);
        if (patternArray[index]) {
            stepDiv.classList.add("active");
        } else {
            stepDiv.classList.remove("active");
        }
    });
}

// step counter for place in loop
let step = 0;

// loop through each voice and create the grid
for (let instrument of ["kick","snare","closed_hat","open_hat"]) {
    // find the row in the html file
    const row = document.getElementById(instrument + "-row");
    // add a row of div elements with the instrument and step id
    for (let i = 0; i < 16; i++) {
        const stepDiv = document.createElement("div");
        stepDiv.classList.add("step");
        stepDiv.dataset.instrument = instrument;
        stepDiv.dataset.step = i;
        row.appendChild(stepDiv);
    }
}

// map the instrument name to the pattern name
function getPatternArray(name) {
    switch(name) {
        case "kick": return kick_pattern;
        case "snare": return snare_pattern;
        case "closed_hat": return closed_hh_pattern;
        case "open_hat": return open_hh_pattern;
    }
}

// find all the div elements with class "step" - call it a button
document.querySelectorAll(".step").forEach(button => {
    // look out for when each of these is clicked
    button.addEventListener("click", () => {
        // extract the instrument from this button's attached dataset
        const instrument = button.dataset.instrument;
        // extract the step from button's dataset
        const step_index = parseInt(button.dataset.step);
        // use helper function to get array for instrument
        const pattern_array = getPatternArray(instrument);
        // toggle the array for this voice's step (on-off)
        pattern_array[step_index] = pattern_array[step_index] ? 0 : 1;
        button.classList.toggle('active');
    });
});

// highlight the current step being played
function highlight_step(step) {
    // every step element has the label current removed (cleans the board)
    document.querySelectorAll(".step").forEach(s => s.classList.remove("current"));
    // find all the buttons at this step and add the class label 'current'.
    document.querySelectorAll(`.step[data-step='${step}']`).forEach(s => s.classList.add("current"));
}

// tone.js loop
var loop = new Tone.Loop((time) => {

    // give the blocks in the current step a boarder
    highlight_step(step);

    if (kick_pattern[step]) sequencer.player("kick").start(time);
    if (snare_pattern[step]) sequencer.player("snare").start(time);
    if (open_hh_pattern[step]) sequencer.player("open_hat").start(time);
    if (closed_hh_pattern[step]) sequencer.player("closed_hat").start(time);

    step = (step + 1) % 16;

}, "16n");

// place to clear the grid
function clearGrid() {
    kick_pattern.fill(0);
    snare_pattern.fill(0);
    open_hh_pattern.fill(0);
    closed_hh_pattern.fill(0);
    update_grid_visuals();
}

// bind button to function
document.getElementById("clear-grid").addEventListener("click", () => {
    clearGrid();
});

// make the start button work
document.getElementById("start").addEventListener("click", async () => {
    await Tone.start();
    step = 0;
    loop.start(0);
    Tone.Transport.start();
});

// make the stop button work
document.getElementById("stop").addEventListener("click", async () => {
    loop.stop(0);
    Tone.Transport.pause()
});

// make the bpm slider 
const bpm_slider = document.getElementById("bpm");
const bpm_display = document.getElementById("bpm-value");

bpm_slider.addEventListener("input", () => {
    const bpm = parseInt(bpm_slider.value);
    // slide up to the bpm value in 0.1s
    Tone.Transport.bpm.rampTo(bpm, 0.1);
    bpm_display.textContent = bpm;
});

// make the new pattern button work
document.getElementById("new-pattern").addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * predefinedPatterns.length);
    load_pattern(predefinedPatterns[randomIndex]);
});

// have a default pattern loaded 
window.addEventListener("DOMContentLoaded", () => {
    load_pattern(predefinedPatterns[0]); // load the first pattern automatically
});

// make the background change
const colors = [
    "#5C2C1D", // Deep mahogany
    "#8B2F1C", // Deep russet red
    "#B04E39", // Brick red
    "#D85C41", // Maple leaf
    "#F28C5B", // Persimmon
    "#E27A3F", // Pumpkin
    "#C94C24", // Burnt orange
    "#9E4F21", // Cinnamon bark
    "#A66E16", // Caramel brown
    "#C98C43", // Honeyed oak
    "#E1A95F", // Toasted almond
    "#FFD27F", // Golden amber
    "#F2B179", // Warm apricot
    "#D99A25", // Harvest gold
    "#7C5832", // Walnut brown
    "#6E3B1F"  // Chestnut
  ]
let i = 0;

function updateBackground() {
  document.body.style.backgroundColor = colors[i % colors.length];
  i++;
}

// turn off the background switch for now! Very intense!!!
//Tone.Transport.scheduleRepeat(updateBackground, "4n"); // every measure
