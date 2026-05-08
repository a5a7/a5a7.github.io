class State {
    constructor(rows, cols, board) {
        this.rows = rows;
        this.cols = cols;
        this.board = board;
        let size = rows * cols;
        this.hasBulb = new Array(size).fill(false);
        this.canHaveBulb = new Array(size).fill(true);
        this.litCount = new Array(size).fill(0);
        
        for (let i = 0; i < size; i++) {
            if (this.board[i] !== '.') {
                this.canHaveBulb[i] = false;
            }
        }
    }
    
    clone() {
        let s = new State(this.rows, this.cols, this.board);
        s.hasBulb = this.hasBulb.slice();
        s.canHaveBulb = this.canHaveBulb.slice();
        s.litCount = this.litCount.slice();
        return s;
    }
}

function getAdjacent(state, r, c) {
    let adj = [];
    let dr = [-1, 1, 0, 0];
    let dc = [0, 0, -1, 1];
    for (let i = 0; i < 4; i++) {
        let nr = r + dr[i];
        let nc = c + dc[i];
        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            let nidx = nr * state.cols + nc;
            if (state.board[nidx] === '.') {
                adj.push(nidx);
            }
        }
    }
    return adj;
}

function getLightSources(state, r, c) {
    let sources = [];
    let idx = r * state.cols + c;
    if (state.canHaveBulb[idx]) sources.push(idx);
    
    let dr = [-1, 1, 0, 0];
    let dc = [0, 0, -1, 1];
    for (let i = 0; i < 4; i++) {
        let nr = r + dr[i];
        let nc = c + dc[i];
        while (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            let nidx = nr * state.cols + nc;
            if (state.board[nidx] !== '.') break;
            if (state.canHaveBulb[nidx]) sources.push(nidx);
            nr += dr[i];
            nc += dc[i];
        }
    }
    return sources;
}

function placeBulb(state, r, c) {
    let idx = r * state.cols + c;
    state.hasBulb[idx] = true;
    state.canHaveBulb[idx] = false;
    
    let dr = [-1, 1, 0, 0];
    let dc = [0, 0, -1, 1];
    
    state.litCount[idx]++;
    
    for (let i = 0; i < 4; i++) {
        let nr = r + dr[i];
        let nc = c + dc[i];
        while (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
            let nidx = nr * state.cols + nc;
            if (state.board[nidx] !== '.') break;
            state.litCount[nidx]++;
            state.canHaveBulb[nidx] = false;
            nr += dr[i];
            nc += dc[i];
        }
    }
}

function solveRecursive(state) {
    let changed = true;
    while (changed) {
        changed = false;
        
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                let idx = r * state.cols + c;
                let val = state.board[idx];
                if (val >= '0' && val <= '4') {
                    let target = parseInt(val);
                    let adj = getAdjacent(state, r, c);
                    let bCount = 0;
                    let cCount = 0;
                    let cCells = [];
                    for (let a of adj) {
                        if (state.hasBulb[a]) bCount++;
                        else if (state.canHaveBulb[a]) {
                            cCount++;
                            cCells.push(a);
                        }
                    }
                    if (bCount > target) return null;
                    if (bCount + cCount < target) return null;
                    
                    if (bCount === target && cCount > 0) {
                        for (let a of cCells) {
                            state.canHaveBulb[a] = false;
                            changed = true;
                        }
                    } else if (bCount + cCount === target && cCount > 0) {
                        for (let a of cCells) {
                            placeBulb(state, Math.floor(a / state.cols), a % state.cols);
                            changed = true;
                        }
                    }
                }
            }
        }
        
        for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
                let idx = r * state.cols + c;
                if (state.board[idx] === '.' && state.litCount[idx] === 0) {
                    let sources = getLightSources(state, r, c);
                    if (sources.length === 0) return null;
                    if (sources.length === 1) {
                        let sr = Math.floor(sources[0] / state.cols);
                        let sc = sources[0] % state.cols;
                        if (!state.hasBulb[sources[0]]) {
                            placeBulb(state, sr, sc);
                            changed = true;
                        }
                    }
                }
            }
        }
    }
    
    let isSolved = true;
    let minSources = 9999;
    let bestSources = [];
    
    for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            let idx = r * state.cols + c;
            if (state.board[idx] === '.') {
                if (state.litCount[idx] === 0) {
                    isSolved = false;
                    let sources = getLightSources(state, r, c);
                    if (sources.length < minSources) {
                        minSources = sources.length;
                        bestSources = sources;
                    }
                }
            }
        }
    }
    
    for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
            let idx = r * state.cols + c;
            let val = state.board[idx];
            if (val >= '0' && val <= '4') {
                let target = parseInt(val);
                let adj = getAdjacent(state, r, c);
                let bCount = 0;
                let cCells = [];
                for (let a of adj) {
                    if (state.hasBulb[a]) bCount++;
                    else if (state.canHaveBulb[a]) cCells.push(a);
                }
                if (bCount !== target) {
                    isSolved = false;
                    if (cCells.length < minSources) {
                         minSources = cCells.length;
                         bestSources = cCells;
                    }
                }
            }
        }
    }
    
    if (isSolved) return state;
    if (bestSources.length === 0) return null;
    
    let branchCell = bestSources[0];
    
    let state1 = state.clone();
    placeBulb(state1, Math.floor(branchCell / state.cols), branchCell % state.cols);
    let res1 = solveRecursive(state1);
    if (res1) return res1;
    
    let state2 = state.clone();
    state2.canHaveBulb[branchCell] = false;
    return solveRecursive(state2);
}

class Akari {
    constructor(rows, columns, board){
        this.rows = rows;
        this.cols = columns;
        this.board = board.split("");
    }

    Print(){
        var s = "";
        for (var i = 0; i < this.rows; i++){
            for (var j = 0; j < this.cols; j++){
                s += this.board[i * this.cols + j] + " ";
            }
            s += "\n";
        }
        console.log(s);
    }

    Cell(i, j){
        return this.rows * i + j;
    }

    Logic() {
        let state = new State(this.rows, this.cols, this.board);
        let solution = solveRecursive(state);
        
        if (solution) {
            for (let i = 0; i < this.rows * this.cols; i++) {
                if (solution.hasBulb[i]) {
                    this.board[i] = '+';
                }
            }
            console.log("Solved!");
            return true;
        } else {
            console.log("No solution found.");
            return false;
        }
    }
}

// var ak = new Akari(10, 10, "....1.1XXX...XX..XXX...XX..XXX....0.1XXX...1X..XXX....1.XXXX....1.1XXX...1X..1XX..XXX...0X..1XX...XX");
var ak = new Akari(10, 10, "X..X.....X.......X...3....0.....2..X...1...10X........1XX...X...2..2.....X....X...1.......0.....1..0");
ak.Print();
ak.Logic();
var rows = 10;
var cols = 10;

// ak.Print();

var changeBoard = (e) => {
    rows = parseInt(HTML.Value("rows")) || 10;
    cols = parseInt(HTML.Value("cols")) || 10;
    if (rows <= 0 || cols <= 0 || Math.floor(rows) != rows || Math.floor(cols) != cols){
        HTML.ID("error").innerHTML = "Rows and columns must be a positive integer!";
        return;
    }
    var table = "";
    for (var i = 0; i < rows; i++){
        table += "<tr>";
        for (var j = 0; j < cols; j++){
            table += `<td class="cell"><input type="text" id="cell_${i}_${j}" maxlength="1"/></td>`;
        }
        table += "</tr>";
    }
    HTML.ID("akari-table").innerHTML = table;
};

HTML.ID("board").addEventListener("click", changeBoard);

HTML.ID("solve").addEventListener("click", (e) => {
    var string = "";
    for (var i = 0; i < rows; i++){
        for (var j = 0; j < cols; j++){
            string += HTML.ID(`cell_${i}_${j}`).value || ".";
        }
    }
    var akari = new Akari(rows, cols, string);
    console.log(string);
    akari.Print();
    akari.Logic();
    akari.Print();
    for (var i = 0; i < rows; i++){
        for (var j = 0; j < cols; j++){
            if (akari.board[i * rows + j] != '+') continue;
            var cell = HTML.ID(`cell_${i}_${j}`);
            cell.value = "+";
        }
    }
});

changeBoard();