function playNote() {
    // create a synth
    const synth = new Tone.Synth().toDestination();
    // play a note from that synth
    synth.triggerAttackRelease("C4", "8n");
}