var size = 30;
var started = false;
var mousedown = false;
var choice = 1;
var g = new GridCanvas(450, 450, size, size);
g.Init("gen-output");
g.DrawLines();
g.MapColor(0, "#fff");
g.MapColor(1, "#000");

function Next(){
    var dir = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, 1], [1, 0], [1, -1]];
    var gr = [];
    for (var x of g.grid){
        gr.push([]);
        for (var y of x){
            gr[gr.length-1].push(y);
        }
    }
    for (var i = 0; i < size; i++){
        for (var j = 0; j < size; j++){
            var neighbors = 0;
            for (var x of dir){
                var nextX = (x[0] + i + size)%size;
                var nextY = (x[1] + j + size)%size;
                neighbors += g.grid[nextX][nextY];
            }
            if (neighbors == 3 && g.grid[i][j] == 0){
                gr[i][j] = 1;
            }else if ((neighbors == 2 || neighbors == 3) && g.grid[i][j] == 1){
                gr[i][j] = 1;
            }else{
                gr[i][j] = 0;
            }
        }
    }
    g.grid = gr;
}

g.canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
    var gridY = Math.floor(e.offsetX/(450/size));
    var gridX = Math.floor(e.offsetY/(450/size));
    g.grid[gridX][gridY] = choice;
    g.ClearCanvas();
    g.DrawGrid();
    g.DrawLines();
});

g.canvas.addEventListener("mouseup", () => {mousedown = false;});

g.canvas.addEventListener("mousemove", (e) => {
    if (mousedown){
        var gridY = Math.floor(e.offsetX/(450/size));
        var gridX = Math.floor(e.offsetY/(450/size));
        g.grid[gridX][gridY] = choice;
        g.ClearCanvas();
        g.DrawGrid();
        g.DrawLines();
    }
});

HTML.ID("color").addEventListener("click", () => {
    choice = HTML.ID("color").checked ? 0 : 1;
});

HTML.ID("simulate").addEventListener("click", () => {
    started = !started;
});

setInterval(() => {
    if (started){
        Next();
        g.ClearCanvas();
        g.DrawGrid();
        g.DrawLines();
    }
}, 500);