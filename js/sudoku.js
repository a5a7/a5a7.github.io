class Sudoku{
    constructor(str){
        this.board = str.split("");
        this.regions = [[0, 0, 0, 1, 1, 1, 2, 2, 2], [0, 0, 0, 1, 1, 1, 2, 2, 2], [0, 0, 0, 1, 1, 1, 2, 2, 2], [3, 3, 3, 4, 4, 4, 5, 5, 5], [3, 3, 3, 4, 4, 4, 5, 5, 5], [3, 3, 3, 4, 4, 4, 5, 5, 5], [6, 6, 6, 7, 7, 7, 8, 8, 8], [6, 6, 6, 7, 7, 7, 8, 8, 8], [6, 6, 6, 7, 7, 7, 8, 8, 8]];
        this.constraintMatrix = [];
    }
    print(){
        for (var i = 0; i < 9; i++){
            var s = "";
            for (var j = 0; j < 9; j++){
                s += this.board[i*9+j] + " ";
            }
            console.log(s);
        }
    }
    solve(){
        var arr = new Array(81);
        var rows = [];
        var cols = [];
        var boxes = [];
        for (var i = 0; i < 9; i++){
            rows.push(511);
            cols.push(511);
            boxes.push(511);
        }
        for (var i = 0; i < 81; i++){
            var r = Math.floor(i/9);
            var c = i%9;
            arr[i] = this.board[i] == "_" ? 0 : parseInt(this.board[i]);
            arr[i]--;
            if (arr[i] == -1) continue;
            boxes[this.regions[r][c]] ^= 1<<arr[i];
            rows[r] ^= 1<<arr[i];
            cols[c] ^= 1<<arr[i];
        }
        var nodes = 0;
        var time = 10000;
        var start = 0;
        var recurse = (index) => {
            if (index == 81) return true;
            if ((performance.now()-start) >= time) return false;
            if (arr[index] != -1) return recurse(index+1);
            var r = Math.floor(index/9);
            var c = index%9;
            for (var k = 0; k < 9; k++){
                if (!((rows[r]>>k)&1)) continue;
                if (!((cols[c]>>k)&1)) continue;
                if (!((boxes[this.regions[r][c]]>>k)&1)) continue;
                rows[r] ^= 1<<k;
                cols[c] ^= 1<<k;
                boxes[this.regions[r][c]] ^= 1<<k;
                arr[index] = k;
                var result = recurse(index+1);
                if (result) return true;
                rows[r] ^= 1<<k;
                cols[c] ^= 1<<k;
                boxes[this.regions[r][c]] ^= 1<<k;
            }
            nodes++;
            arr[index] = -1;
            return false;
        };
        console.log(rows, cols, boxes);
        console.log(arr);
        start = performance.now();
        recurse(0);
        console.log("Went through", nodes, "in", performance.now()-start, "ms");
        this.board = arr.map(x => x == -1 ? '_' : (x+1).toString());
    }
}

// Easy: 84_6___727__1__56__1_28___3_6__1__4752___3__69____632___64_173_4_7__9____39_2_6_4
// Medi: __2785__________68____3_______4__12716____8___74______5_96_________4__9_31__7____
// Hard: _4_56___3__9___7_5_____1____948__5__83__7_____________7_____2____6_9__8____4_3___
// var s = new Sudoku("_4_56___3__9___7_5_____1____948__5__83__7_____________7_____2____6_9__8____4_3___");
// s.print();
// console.log("trying to solve...");
// s.solve();
// s.print();

window.onload = () => {
    var table = "<table id='sudoku'>";
    for (var i = 0; i < 9; i++){
        table += "<tr>";
        for (var j = 0; j < 9; j++){
            table += `<td class="row-${i} col-${j}"><input type="number" min="1" max="9"/></td>`;
        }
        table += "</tr>";
    }
    table += "</table>";
    document.getElementById("gen-output").innerHTML += table;
};

HTML.ID("solve").addEventListener("click", (e) => {
    var join = "_".repeat(81).split("");
    for (var i = 0; i < 9; i++){
        for (var j = 0; j < 9; j++){
            var elm = HTML.SELECT(`.row-${i}.col-${j}`);
            var val = elm.children[0].value;
            if (val == "") continue;
            val = parseInt(val);
            if (val > 9 || val < 1){
                alert("Error: Values should be between 1 and 9.");
                return;
            }
            join[i*9+j] = val;
        }
    }
    var s = new Sudoku(join.join(""));
    s.solve();
    for (var i = 0; i < 9; i++){
        for (var j = 0; j < 9; j++){
            HTML.SELECT(`.row-${i}.col-${j}`).children[0].value = s.board[i*9+j];
        }
    }
});