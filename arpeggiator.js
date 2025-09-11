function drum_seq() {
    // create a player for your snare sample
    var player = new Tone.Player("./samples/snare.wav").toDestination();

    // start once loaded
    if (!player.loaded)
        player.autostart = true;
    else
        player.start();
}

function test_seq() {
    const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
    // play as soon as the buffer is loaded
    player.autostart = true;
}
