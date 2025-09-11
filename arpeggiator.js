function test_seq() {
    // set the base URL for the samples
    let base_url = "https://oliverkiranbrown.github.io/public/samples/";
    let sequencer;
    
    // Load in the samples
    sequencer = new Tone.Players({
        kick: base_url + "kick.mp3",
        snare: base_url + "snare.mp3",
        open_hat: base_url + "open_hat.mp3",
        closed_hat: base_url + "closed_hat.mp3"
    }).toDestination();

    // define patterns
    const kickPattern   = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0];
    const snarePattern  = [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0];
    const closedPattern = [0,0,0,1,1,1,0,0,0,1,0,0,1,0,0,1];
    const openPattern   = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0];

    let step = 0;

    var loop = new Tone.Loop((time) => {
        
        // Kick
        if (kickPattern[step] == 1) {
            sequencer.player("kick").start(time);
        }
        
        // Snare
        if (snarePattern[step] == 1) {
            sequencer.player("snare").start(time);
        } 

        // closed hats
        if (closedPattern[step] == 1) {
            sequencer.player("closed_hat").start(time);
        }

        // open hats
        if (openPattern[step] == 1) {
            sequencer.player("open_hat").start(time);
        }

        // Advance Time
        step = (step + 1) % 16;
    
    }, "16n").start(0);
    Tone.Transport.start();
}
