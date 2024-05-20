class Maze{
    constructor(width, height){
        this.width = 2 * width + 1;
        this.height = 2 * height + 1;
        this.cellCount = width * height;
        this.board = [];
        this.init();
    }
    
    init(){
        for (var i = 0; i < this.height; i++){
            this.board.push([]);
            for (var j = 0; j < this.width; j++){
                this.board[i].push(1);
            }
        }
        var start = [1,1];
        var visited = [];
        var count = 1;
        this.board[1][1] = 0;
        while (count != this.cellCount){
            var directions = [[2, 0], [0, 2], [-2, 0], [0, -2]];
            directions.sort((a, b) => (Math.random()-0.5));
            var works = false;
            for (var x of directions){
                var next = [start[0]+x[0], start[1] + x[1]];
                if (next[0] < 0 || next[1] < 0) continue;
                if (next[0] >= this.height || next[1] >= this.width) continue;
                if (this.board[next[0]][next[1]] == 1){
                    visited.push(start);
                    works = true;
                    this.board[next[0]][next[1]] = 0;
                    this.board[start[0]+(x[0]/2)][start[1]+(x[1]/2)] = 0;
                    count++;
                    start = next;
                    break;
                }
            }
            if (!works){
                start = visited.pop();
            }
        }
    }

    printBoard(){
        for (var i = 0; i < this.height; i++){
            console.log(this.board[i].map(v => v == 0 ? '-' : "#").join(" "));
        }
    }
}

class MazeCanvas{
    constructor(width, height){
        var sizes = [400, 400 * (2*width+1)/(2*height+1)];
        console.log(sizes);
        if (sizes[1] > 400){
            sizes[0] *= 400/sizes[1];
            sizes[1] = 400;
        }
        this.c = new GridCanvas(width*4+2, height*4+2, height*2+1, width*2+1);
        this.m = new Maze(width, height);
        this.c.grid = this.m.board;
        this.c.canvas.style.width = `${sizes[0]}px`;
        this.c.canvas.style.width = `${sizes[1]}px`;
        this.c.Init("gen-output");
        this.c.MapColor(0, "#fff");
        this.c.MapColor(1, "#000");
        this.c.DrawGrid();
    }
}

var current = null;

HTML.ID("create").addEventListener("click", () => {
    if (current != null){
        current.c.Remove();
    }
    current = new MazeCanvas(HTML.Value("cols"), HTML.Value("rows"));
});

HTML.ID("download").addEventListener("click", () => {
    var a = document.createElement("a");
    a.href = current.c.canvas.toDataURL();
    a.download = "maze.png";
    a.click();
});