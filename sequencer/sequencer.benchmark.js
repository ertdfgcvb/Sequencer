/**
Sequencer - A fast(?) fullscreen image-sequence player.
(c) 2012
See README.txt or visit github (link below) for details

Author: 
Andreas Gysin
ertdfgcvb.com
@andreasgysin
    
Project page:
http://ertdfgcvb.com/sequencer
http://github.com/ertdfgcvb/Sequencer  
*/

var Benchmark = (function(){    
    var INTERVAL = 10; //refresh interval: in an ideal case the frameRate would be 100fps
    var benchmark = {};
    var output;
    var config = {};
    
    
    window.addEventListener("load", init, false);
    
    function init(){
        configureBody();
    }   
            
    function start(){
        Sequencer.stop();
        //window.resizeTo(1200, 760);
        if (benchmark.interval) clearInterval(benchmark.interval);
        benchmark.start = new Date().getTime();
        benchmark.numFrames = 0;
        benchmark.interval = setInterval(run, INTERVAL);
        output.innerHTML = "Starting benchmark…<br/>Press again to stop."
        /*
        console.log("-- starting benchmark -----------------------------------------");
        */
    }
    
    function configureBody(){
        output = document.createElement('div');
        output.id = "benchmark";
        output.style.padding = "10px";
        output.style.cursor = "pointer";
        output.style.color = "rgba(0,0,0,0.5)";
        output.style.backgroundColor = "#CCCCCC";
        output.style.position = "fixed";
        output.style.left = "15px";
        output.style.bottom = "15px";
        output.style.borderRadius = "4px";      
        output.style.fontFamily = "Helvetica, Arial, sans-serif",
        output.style.fontSize = "0.7em";
        output.style.zIndex = 1001;
        output.innerHTML = "Start benchmark";
        output.onclick = toggle;
        output.onmouseover = function(){ this.style.backgroundColor = "#FFFF66";};
        output.onmouseout = function(){ this.style.backgroundColor = "#CCCCCC";};

        document.body.appendChild(output);
    }
    
    function run(){
        Sequencer.nextImage("loop"); 
        benchmark.numFrames++;
    }
    
    function toggle(){
        if (benchmark.interval) {
            stop();
        } else {
            start();
        }
    }
    
    function stop(){
        if (benchmark.interval) clearInterval(benchmark.interval);
        benchmark.interval = null;
        var elapsed = new Date().getTime() - benchmark.start;
        var avg = benchmark.numFrames / elapsed * 1000;
        output.innerHTML = "size: " + window.innerWidth + "x" + window.innerHeight + "<br/>";
        output.innerHTML += "interval: " + INTERVAL + "<br/>";
        output.innerHTML += "elapsed: " + elapsed + "<br/>";
        output.innerHTML += "frames: " + benchmark.numFrames + "<br/>";  
        output.innerHTML += "average: " + avg.toFixed(1) + " fps<br/>";  
        output.innerHTML += "expected: " + (1000 / INTERVAL).toFixed(1) + " fps<br/>";      
        Sequencer.play();
        /*
        console.log("elapsed : " + elapsed);
        console.log("frames  : " + benchmark.numFrames);
        console.log("average : " + avg.toFixed(2));
        */
    }

    return {};
})();


