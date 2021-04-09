class Maze{
    constructor (w=10, h=10, size=30){
        this.w = w;
        this.h = h;
        this.size = size;
        this.width = 2*w-1;
        this.height = 2*h-1;
        this.timeTooken = 0;
        this.canvas = new Canvas(size*this.width, size*this.height);
        this.canvas.start();
        this.colors = {
            background: "#3d3d3d",
            path: "#ffffff"
        }
        this.solution = [];
        this.done = false;
        this.not_visited = [];
        this.cells = {};
        this.solved = false;
        this.board = {};
        this.stack = [];
        for (var i = 0; i < this.width; i++){
            for (var j = 0; j < this.height; j++){
                if (i%2 == 0 && j%2 == 0){
                    this.board[this.num([i, j])] = 0;
                }else{
                    this.board[this.num([i, j])] = 1;
                }
            }
        }
    }
    num(arr){return arr[0]+arr[1]*this.width}
    coord(num){return [num%this.width, Math.floor(num/this.width)]}
    printBoard(){
        var results = ""
        for (var i = 0; i < this.width * this.height; i++){
            if (this.board[i] == 0){
                results += "  ";
            }else if (this.board[i] == 1){
                results += "■ ";
            }else{
                results += "X ";
            }
            if (i%this.width == this.width-1){
                results += "\n";
            }
        }
        console.log(results);
        return;
    }
    draw(){
        for (var i = 0; i < this.width * this.height; i++){
            var coords = this.coord(i);
            if (this.board[i] == 0){
                this.canvas.rect(this.size, this.size, coords[0] * this.size, coords[1] * this.size, this.colors.path).draw();
            }else if (this.board[i] == 1){
                this.canvas.rect(this.size, this.size, coords[0] * this.size, coords[1] * this.size, this.colors.background).draw();
            }else if (this.board[i] == 2){
                this.canvas.rect(this.size, this.size, coords[0] * this.size, coords[1] * this.size, "#ff0000").draw();
            }else if (this.board[i] == 3){
                this.canvas.rect(this.size, this.size, coords[0] * this.size, coords[1] * this.size, "#0000ff");
            }
        }
    }
    nextStep(){
        var dir = [[2, 0], [-2, 0], [0, 2], [0, -2]];
        dir.sort(() => 0.5-Math.random());
        for (var j = 3; j >= 0; j--){
            var x = dir[j]; 
            var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
            if (newSpawn[0] < 0 || newSpawn[0] > this.width || newSpawn[1] < 0 || newSpawn[1] > this.height){
                dir.splice(j, 1);
            }
        }
        var possibleLoc = [];
        for (var x of dir){
            var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
            if (this.not_visited.indexOf(this.num(newSpawn)) != -1){
                possibleLoc.push(newSpawn);
            }
        }
        if (possibleLoc == 0){
            if (maze.stack.length != 0){
                this.stack.pop();
                spawn = this.coord(this.stack.pop());
                this.stack.push(this.num(spawn));
            }else if (maze.stack.length == 0){
                clearInterval(interval);
                for (var x of this.not_visited){
                    this.board[x] = 1;
                }
            }
        }else{
            possibleLoc.sort(() => 0.5-Math.random());
            cell = possibleLoc[0];
            var middle = [(spawn[0]+cell[0])/2, (spawn[1]+cell[1])/2];
            this.board[this.num(middle)] = 0;
            this.stack.push(this.num(spawn));
            this.not_visited.splice(this.not_visited.indexOf(this.num(cell)), 1);
            this.cells[this.num(cell)].visited = true;
            spawn = cell;   
        }
    }
    fastConstruct(){
        for (var i = 0; i < this.width * this.height; i++){
            this.cells[i] = new Cell(i);
            var coord = this.coord(i);
            if (coord[0]%2== 0 && coord[1]%2==0){
                this.not_visited.push(i);
            }
        }
        this.not_visited.splice(0, 1);
        var i = 0;
        var spawn = [0, 0];
        var beggining = spawn;
        var cell;
        var time = performance.now();
        var interval = setInterval(() => {
            for (var h =0; h<4000; h++){
                if (this.not_visited.length == 0){
                    this.done = true;
                    if (this.solved){
                        this.solve();
                    }
                    this.timeTooken = time - performance.now();
                    clearInterval(interval);
                    maze.draw();
                    break;
                }
                
                var dir = [[2, 0], [-2, 0], [0, 2], [0, -2]];
                dir.sort(() => 0.5-Math.random());
                for (var j = 3; j >= 0; j--){
                    var x = dir[j]; 
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    if (newSpawn[0] < 0 || newSpawn[0] > this.width || newSpawn[1] < 0 || newSpawn[1] > this.height){
                        dir.splice(j, 1);
                    }
                }
                var possibleLoc = [];
                for (var x of dir){
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    if (this.not_visited.indexOf(this.num(newSpawn)) != -1){
                        possibleLoc.push(newSpawn);
                    }
                }
                if (possibleLoc == 0){
                    if (maze.stack.length != 0){
                        this.stack.pop();
                        spawn = this.coord(this.stack.pop());
                        this.stack.push(this.num(spawn));
                    }
                }else{
                    possibleLoc.sort(() => 0.5-Math.random());
                    cell = possibleLoc[0];
                    var middle = [(spawn[0]+cell[0])/2, (spawn[1]+cell[1])/2];
                    this.board[this.num(middle)] = 0;
                    this.stack.push(this.num(spawn));
                    this.not_visited.splice(this.not_visited.indexOf(this.num(cell)), 1);
                    this.cells[this.num(cell)].visited = true;
                    spawn = cell;   
                }
                i++;
            }
        }, 1);
    }
    constructMaze(){
        for (var i = 0; i < this.width * this.height; i++){
            this.cells[i] = new Cell(i);
            var coord = this.coord(i);
            if (coord[0]%2== 0 && coord[1]%2==0){
                this.not_visited.push(i);
            }
        }
        this.not_visited.splice(0, 1);
        var i = 0;
        var spawn = [0, 0];
        var beggining = spawn;
        var cell;
        var time = performance.now();
        var interval = setInterval(() => {
            this.canvas.clear();
                if (maze.not_visited.length == 0){
                    this.done = true;
                    if (this.solved){
                        this.solve();
                    }
                    this.timeTooken = time - performance.now();
                    clearInterval(interval);
                    return;
                }
                var dir = [[2, 0], [-2, 0], [0, 2], [0, -2]];
                dir.sort(() => 0.5-Math.random());
                for (var j = 3; j >= 0; j--){
                    var x = dir[j]; 
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    if (newSpawn[0] < 0 || newSpawn[0] > this.width || newSpawn[1] < 0 || newSpawn[1] > this.height){
                        dir.splice(j, 1);
                    }
                }
                var possibleLoc = [];
                for (var x of dir){
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    if (this.not_visited.indexOf(this.num(newSpawn)) != -1){
                        possibleLoc.push(newSpawn);
                    }
                }
                if (possibleLoc == 0){
                    if (maze.stack.length != 0){
                        this.stack.pop();
                        spawn = this.coord(this.stack.pop());
                        this.stack.push(this.num(spawn));
                    }
                }else{
                    possibleLoc.sort(() => 0.5-Math.random());
                    cell = possibleLoc[0];
                    var middle = [(spawn[0]+cell[0])/2, (spawn[1]+cell[1])/2];
                    this.board[this.num(middle)] = 0;
                    this.stack.push(this.num(spawn));
                    this.not_visited.splice(this.not_visited.indexOf(this.num(cell)), 1);
                    this.cells[this.num(cell)].visited = true;
                    spawn = cell;   
                }
                i++;
            maze.draw();
        }, 1);
    }
    solve(){
        this.not_visited = [];
        for (var i = 0; i < this.width * this.height; i++){
            if (this.board[i] == 0){
                this.not_visited.push(i);
            }
        }
        this.stack = [];
        this.not_visited.splice(0, 1);
        var i = 0;
        var spawn = [0, 0];
        var cell;
        var time = performance.now();
        var interval = setInterval(() => {
                this.canvas.clear();
                if (this.num(spawn) == this.width*this.height-1){
                    this.board[0] = 2;
                    for (var x of this.stack){
                        this.board[x] = 2;
                    }
                    clearInterval(interval);
                    maze.draw();
                    return;
                }
                var dir = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                dir.sort(() => 0.5-Math.random());
                for (var j = 3; j >= 0; j--){
                    var x = dir[j]; 
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    if (newSpawn[0] < 0 || newSpawn[0] >= this.width || newSpawn[1] < 0 || newSpawn[1] >= this.height || this.board[this.num(newSpawn)] == 1 || !this.not_visited.includes(this.num(newSpawn)) ){
                        dir.splice(j, 1);
                    }
                }
                //MOVE
                if (dir.length == 0){
                    this.board[this.stack[this.stack.length - 1]] = 0;
                    this.stack.pop();
                    spawn = this.coord(this.stack.pop());
                    this.stack.push(this.num(spawn));
                }else{
                    var x = dir[0];
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    this.stack.push(this.num(newSpawn));
                    this.not_visited.splice(this.not_visited.indexOf(this.num(newSpawn)), 1);
                    this.board[this.num(newSpawn)] = 2;
                    spawn = newSpawn;
                }
                maze.draw();
                i++;
        }, 1);
    }
    toString(){
        var str = this.w + "-" + this.h + "-";
        for (var i = 0; i < this.width*this.height-1; i++){
            if (this.board[i] == 1){
                str += "1";
            }else{
                str += "0";
            }
        }
        return str;
    }
    parseStr(str){
        var hyphens = str.split("-");
        this.w = parseInt(hyphens[0]);
        this.h = parseInt(hyphens[1]);
        this.width = 2 * this.w - 1;
        this.height = 2 * this.h - 1;
        this.canvas.c.width = this.width * this.size;
        this.canvas.c.height = this.height * this.size;
        for (var i = 0; i < hyphens[2].length; i++){
            this.board[i] = parseInt(hyphens[2][i]);
        }
        return;
    }
    fastSolve(){
        this.not_visited = [];
        for (var i = 0; i < this.width * this.height; i++){
            if (this.board[i] == 0){
                this.not_visited.push(i);
            }
        }
        this.stack = [];
        this.not_visited.splice(0, 1);
        var i = 0;
        var spawn = [0, 0];
        var cell;
        var time = performance.now();
        var interval = setInterval(() => {
            this.canvas.clear();
            for (var h = 0; h < 3000; h++){
                if (this.num(spawn) == this.width*this.height-1){
                    this.board[0] = 2;
                    for (var x of this.stack){
                        this.board[x] = 2;
                    }
                    this.solveTime = performance.now() - time;
                    clearInterval(interval);
                    maze.draw();
                    return;
                }
                var dir = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                dir.sort(() => 0.5-Math.random());
                for (var j = 3; j >= 0; j--){
                    var x = dir[j]; 
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    if (newSpawn[0] < 0 || newSpawn[0] >= this.width || newSpawn[1] < 0 || newSpawn[1] >= this.height || this.board[this.num(newSpawn)] == 1 || !this.not_visited.includes(this.num(newSpawn)) ){
                        dir.splice(j, 1);
                    }
                }
                //MOVE
                if (dir.length == 0){
                    this.board[this.stack[this.stack.length - 1]] = 0;
                    this.stack.pop();
                    spawn = this.coord(this.stack.pop());
                    this.stack.push(this.num(spawn));
                }else{
                    var x = dir[0];
                    var newSpawn = [spawn[0] + x[0], spawn[1] + x[1]];
                    this.stack.push(this.num(newSpawn));
                    this.not_visited.splice(this.not_visited.indexOf(this.num(newSpawn)), 1);
                    this.board[this.num(newSpawn)] = 2;
                    spawn = newSpawn;
                }
                i++;
            }
            maze.draw();
        }, 1);
    }
}
class Cell{
    constructor (num){
        this.number = num;
        this.visited = false;
    }
}
/*
var maze = new Maze(50, 50, 5);
maze.constructMaze();*/