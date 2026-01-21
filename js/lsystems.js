var canvasWidth = 400, canvasHeight = 400;
var canvas = new Canvas(canvasWidth, canvasHeight);

// var text = `variables: F
// constants: + -
// start: F
// rules:
// F -> F+F-F-F+F
// translations:
// F -> draw 1
// + -> rotate 90
// - -> rotate -90`;

// var text = `variables: F G
// constants: + -
// start: F-G-G
// rules:
// F -> F-G+F+G-F
// G -> GG
// translations:
// F -> draw 1
// G -> draw 1
// + -> rotate 120
// - -> rotate -120`;

// var text = `variables: A B
// constants: + -
// start: A
// rules:
// A -> B-A-B
// B -> A+B+A
// translations:
// A -> draw 1
// B -> draw 1
// + -> rotate 60
// - -> rotate -60`;

var text = `variables: X F
constants: + - [ ]
start: -X
rules:
X -> F+[[X]-X]-F[-FX]+X
F -> FF
translations:
F -> draw 10
X -> nothing
+ -> rotate 25
- -> rotate -25
[ -> push-stack
] -> pop-stack`;

class Turtle{
    constructor(){
        this.currentX = 0;
        this.currentY = 0;
        this.currentAngle = 0;
        this.tasks = [];
        this.stack = [[0, 0]];
    }
    Clear(){
        this.tasks = [];
        this.currentX = 0;
        this.currentY = 0;
        this.currentAngle = 0;
    }
    Move(length){
        this.currentX += length*Math.sin(this.currentAngle * Math.PI/180);
        this.currentY += -length*Math.cos(this.currentAngle * Math.PI/180);
        return [this.currentX, this.currentY];
    }
    Draw(length){
        var old = [this.currentX, this.currentY];
        this.tasks.push([old, this.Move(length)]);
    }
    Rotate(deg){
        this.currentAngle -= deg;
    }
    PushStack(){
        this.stack.push([this.currentX, this.currentY, this.currentAngle]);
    }
    PopStack(){
        [this.currentX, this.currentY, this.currentAngle] = this.stack.pop();
    }
    Execute(command){
        command = command.split(" ");
        if (command[0] == "draw"){
            if (isNaN(parseInt(command[1]))){
                console.log("Not a Number for second argument.");
                return;
            }
            this.Draw(parseInt(command[1]));
        }else if (command[0] == "rotate"){
            if (isNaN(parseInt(command[1]))){
                console.log("Not a Number for second argument.");
                return;
            }
            this.Rotate(parseInt(command[1]));
        }else if (command[0] == "push-stack"){
            this.PushStack();
        }else if (command[0] == "pop-stack"){
            this.PopStack();
        }else if (command[0] == "nothing"){
            // do nothing... //
        }else{
            console.log("Don't know what this is...");
        }
    }
}

class LSystems{
    constructor(variables, constants, start, rules, translations){
        this.variables = variables;
        this.constants = constants;
        this.start = start;
        this.rules = rules;
        this.translations = translations;
        this.turtle = null;
        this.ruleMap = {};
        this.translationMap = {};
    }
    Initialize(){
        for (var x of this.rules) this.ruleMap[x[0]] = x[1];
        for (var x of this.translations) this.translationMap[x[0]] = x[1];
    }
    Iterate(oldString, number=1){
        var newString = "";
        for (var char of oldString){
            if (this.constants.includes(char)){
                newString += char;
            }else{
                newString += number == 1 ? this.ruleMap[char] : this.Iterate(this.ruleMap[char], number-1);
            }
        }
        return newString;
    }
    Execute(string){
        if (!this.turtle) this.turtle = new Turtle();
        this.turtle.Clear();
        for (var char of string){
            this.turtle.Execute(this.translationMap[char]);
        }
    }
}

function parseLSystems(description){
    description = description.split("\n");
    var variables, constants, start, rules = [], translations = [];
    var current;
    for (var x of description){
        if (x.startsWith("variables: ")){
            x = x.split(" ").slice(1);
            variables = x;
        }else if (x.startsWith("constants: ")){
            x = x.split(" ").slice(1);
            constants = x;
        }else if (x.startsWith("start: ")){
            x = x.split(" ")[1];
            start = x;
        }else{
            if (x.startsWith("rules")){
                current = "rules";
            }else if (x.startsWith("translations")){
                current = "translations";
            }else{
                if (current == "rules"){
                    rules.push(x.split("->").map(v => v.trim()));
                }else{
                    translations.push(x.split("->").map(v => v.trim()));
                }
            }
        }
    }
    return new LSystems(variables, constants, start, rules, translations);
}

function depictTurtle(turtle){
    if (turtle.tasks.length == 0) return;
    var minX = turtle.tasks[0][1][0], maxX = turtle.tasks[0][1][0], minY = turtle.tasks[0][1][1], maxY = turtle.tasks[0][1][1];
    for (var x of turtle.tasks){
        minX = Math.min(minX, x[0][0]);
        maxX = Math.max(maxX, x[0][0]);
        minX = Math.min(minX, x[1][0]);
        maxX = Math.max(maxX, x[1][0]);
        minY = Math.min(minY, x[0][1]);
        maxY = Math.max(maxY, x[0][1]);
        minY = Math.min(minY, x[1][1]);
        maxY = Math.max(maxY, x[1][1]);
    }
    var centerX = (minX+maxX)/2;
    var centerY = (minY+maxY)/2;
    var scale = (1.1*Math.max((maxX-minX), (maxY-minY))/Math.min(canvasWidth, canvasHeight));
    canvas.ClearCanvas();
    for (var x of turtle.tasks){
        var modifiedPoint1 = [(x[0][0]-centerX)/scale + 0.5*canvasWidth, (x[0][1]-centerY)/scale + 0.5*canvasHeight];
        var modifiedPoint2 = [(x[1][0]-centerX)/scale + 0.5*canvasWidth, (x[1][1]-centerY)/scale + 0.5*canvasHeight];
        canvas.DrawLine(modifiedPoint1, modifiedPoint2);
    }
}

function resizeTextarea(textarea){
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

var textarea = document.getElementsByTagName('textarea')[0];
textarea.addEventListener("input", () => resizeTextarea(textarea));
resizeTextarea(textarea);

document.getElementById("submit").addEventListener("click", (e) => {
    var script = document.getElementById("lsystem-input").value;
    var iterate = document.getElementById("iterations").value;
    if (!iterate) iterate = 3;
    var lsys = parseLSystems(script);
    lsys.Initialize();
    lsys.Execute(lsys.Iterate(lsys.start, iterate));
    depictTurtle(lsys.turtle);
});

var lsys = parseLSystems(text);

canvas.Init("gen-output");

lsys.Initialize();
lsys.Execute(lsys.Iterate(lsys.start, 6));
depictTurtle(lsys.turtle);