var totalTime = 0;
var questions = 0;
var currentAnswer = 0;
var start = 0;

function getQuestion(){
    var a = Math.floor(Math.random() * 90 + 10);
    var b = Math.floor(Math.random() * 90 + 10);
    currentAnswer = a * b;
    return `${a} × ${b} = ?`;
}

function setQuestion(){
    start = performance.now();
    HTML.ID("question").innerHTML = getQuestion();
    HTML.ID("answer").value = "";
}

HTML.ID("answer").addEventListener("keyup", (e) => {
    var v = HTML.Value("answer");
    if (v.trim() == currentAnswer.toString()){
        var end = performance.now();
        questions++;
        totalTime += (end-start)/1000;
        HTML.ID("time-last").innerHTML = "Previous Question Time: " + ((end-start)/1000).toPrecision(4);
        setQuestion();
        HTML.ID("stats").innerHTML = "Current Average: " + (totalTime/questions).toPrecision(4);
        HTML.ID("q-number").innerHTML = "Questions Done: " + questions;
    }
});

setQuestion();