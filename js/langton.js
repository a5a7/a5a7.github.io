var dimensions = 150;
var grid = new GridCanvas(dimensions * 3, dimensions * 3, dimensions, dimensions);
var rules = "LRL";
grid.Init("gen-output");
grid.MapColor(-1, "#f00");

var ant = [(dimensions >> 1), (dimensions >> 1)];
var direction = [0, -1];
var sqColor = 0;
grid.grid[ant[0]][ant[1]] = -1;

function initializeProperties() {
    ant = [(dimensions >> 1), (dimensions >> 1)];
    direction  = [0, -1];
    sqColor = 0;
    grid.grid[ant[0]][ant[1]] = -1;
    grid.grid = new Array(dimensions);
    for (var i = 0; i < dimensions; i++) grid.grid[i] = new Array(dimensions).fill(0);
    grid.map = {};
    grid.MapColor(-1, "#f00");
    for (var i = 0; i < rules.length; i++) grid.MapColor(i, Color.Mix(new Color(0, 0, 0), new Color(255, 255, 255), 100 * i / (rules.length - 1)));
}


grid.DrawGrid();

function moveStep(cnt = 1) {
    for (var i = 0; i < cnt; i++) {
        if (ant[0] >= dimensions || ant[0] < 0) return;
        if (ant[1] >= dimensions || ant[1] < 0) return;
        grid.grid[ant[0]][ant[1]] = sqColor;
        if (rules[sqColor] == 'R') {
            direction = [direction[1], -direction[0]];
        } else {
            direction = [-direction[1], direction[0]];
        }
        grid.grid[ant[0]][ant[1]] = (sqColor + 1) % (rules.length);
        ant[0] += direction[0];
        ant[1] += direction[1];
        if (ant[0] >= dimensions || ant[0] < 0) return;
        if (ant[1] >= dimensions || ant[1] < 0) return;
        sqColor = grid.grid[ant[0]][ant[1]];
        grid.grid[ant[0]][ant[1]] = -1;
    }
}

var inter;

function simulate() {
    initializeProperties();
    inter = setInterval(() => {
        moveStep(100);
        if (ant[0] >= dimensions || ant[0] < 0) stopsim();
        if (ant[1] >= dimensions || ant[1] < 0) stopsim();
        grid.DrawGrid();
    }, 30);
}

function stopsim() {
    clearInterval(inter);
    HTML.ID("stop").disabled = true;
    HTML.ID("simulate").disabled = false;
}

HTML.ID("simulate").addEventListener("click", (e) => {
    rules = HTML.ID("rule").value;
    if (rules.length == 0) return;
    simulate();
    HTML.ID("stop").disabled = false;
    HTML.ID("simulate").disabled = true;
});

HTML.ID("stop").addEventListener("click", (e) => {
    stopsim();
});