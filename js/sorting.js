const number = 100;
var interval = 4;
var sortOccuring = false;
var canvas = new GridCanvas(500, 500, number, number);
var current = [];
canvas.Init();
canvas.MapColor(0, "#000");
canvas.MapColor(1, "#fff");
canvas.MapColor(-1, "#f00");
var heights = [];
var style = "bar"; // denotes styling //
for (var i = 1; i <= number; i++) heights.push(i);

function Swap(i, j){
    [heights[i], heights[j]] = [heights[j], heights[i]];
}
function Shuffle(){
    // shuffles array //
    var newArray = [];
    while (heights.length != 0){
        var elm = Math.floor(Math.random() * heights.length);
        var x = heights[elm];
        heights.splice(elm, 1);
        newArray.push(x);
    }
    heights = newArray;
}
function DrawOnGrid(){
    if (style == "bar"){
        for (var i = 0; i < number; i++){
            for (var j = 0; j < number; j++){
                canvas.grid[i][j] = 0;
                if (i > (number-1-heights[j])){
                    canvas.grid[i][j] = (current.includes(j)) ? -1 : 1;
                }
            }
        }
    }else if (style == "star"){
        for (var i = 0; i < number; i++){
            for (var j = 0; j < number; j++){
                canvas.grid[i][j] = 0;
                if (i == (number-heights[j])){
                    canvas.grid[i][j] = (current.includes(j)) ? -1 : 1;
                }
            }
        }
    }
    canvas.DrawGrid();
}
function BubbleSort(){
    var i = 0;
    var swaps = 0;
    sortOccuring = true;
    var ival = setInterval(() => {
        current = [i, i+1];
        if (heights[i] > heights[i+1]){
            Swap(i, i+1);
            swaps++;
        }
        i++;
        if (i == number){
            if (swaps == 0){
                console.log("FINISHED");
                sortOccuring = false;
                clearInterval(ival);
            }else{
                i = 0;
                swaps = 0;
            }
        }
        DrawOnGrid();
    }, interval)
}
function CocktailShakerSort(){
    var i = 0;
    var move = 1;
    var swaps = 0;
    sortOccuring = true;
    var ival = setInterval(() => {
        if ((i+move) >= number || (i+move) < 0){
            move = -move;
            if (swaps == 0){
                console.log("FINISHED");
                sortOccuring = false;
                clearInterval(ival);
                return;
            }else {
                swaps = 0;
            }
        }
        if (move == 1){
            current = [i, i+1];
            if (heights[i] > heights[i+1]){
                Swap(i, i+1);
                swaps++;
            }
            i++;
        }else if (move == -1){
            current = [i, i-1];
            if (heights[i] < heights[i-1]){
                Swap(i, i-1);
                swaps++;
            }
            i--;
        }
        DrawOnGrid();
    }, interval);
}
function GnomeSort(){
    var i = 0;
    sortOccuring = true;
    var ival = setInterval(() => {
        current = [i];
        if (i == 0 || heights[i] > heights[i-1]){
            i++;
        }else{
            Swap(i, i-1);
            i--;
        }
        if (i == number){
            console.log("FINISHED");
            sortOccuring = false;
            clearInterval(ival);
            return;
        }
        DrawOnGrid();
    }, interval);
}
function CombSort(){
    var i = 0;
    var shrink = 1.3;
    var sorted = false;
    var gap = Math.floor(number/shrink);
    sortOccuring = true;
    var ival = setInterval(() => {
        if ((i+gap) < number){
            current = [i+gap, i];
            if (heights[i] > heights[i+gap]){
                Swap(i, i+gap);
                sorted = false;
            }
            i++;
        }else if ((i+gap) >= number){
            i = 0;
            if (sorted){
                console.log("FINISHED");
                sortOccuring = false;
                clearInterval(ival);
                return;
            }else{
                gap = Math.floor(gap/shrink);
                if (gap <= 1){
                    gap = 1;
                    sorted = true;
                }
            }
        }
        DrawOnGrid();
    }, interval);
}
function ExchangeSort(){
    var i = 0;
    var j = i+1;
    sortOccuring = true;
    var ival = setInterval(() => {
        current = [i, j];
        if (heights[i] > heights[j]){
            Swap(i, j);
        }
        j++;
        if (j >= number){
            i++;
            j = i+1;
        }
        if (i >= number){
            console.log("FINISHED");
            sortOccuring = false;
            clearInterval(ival);
            return;
        }
        DrawOnGrid();
    }, interval);
}
function OddEvenSort(){
    var i = 0;
    var start = 1;
    var swaps = 0;
    sortOccuring = true;
    var ival = setInterval(() => {
        if (i < (number-1)){
            current = [i, i+1];
            if (heights[i] > heights[i+1]){
                Swap(i, i+1);
                swaps++;
            }
            i+=2;
        }else{
            i = start;
            start ^= 1;
            if (swaps == 0 && start == 1){
                clearInterval(ival);
                console.log("FINISHED");
                sortOccuring = false;
                return;
            }
            swaps = 0;
        }
        DrawOnGrid();
    }, interval);
}
function InsertionSort(){
    var i = 1;
    var x = heights[i];
    var j = i-1;
    sortOccuring = true;
    var ival = setInterval(() => {
        if (j >= 0 && x < heights[j]){
            // effectively swap //
            current = [j, j+1];
            Swap(j, j+1);
            j--;
        }else{
            heights[j+1] = x;
            i++;
            x = heights[i];
            j = i-1;
        }
        if (i >= number){
            console.log("FINISHED");
            sortOccuring = false;
            clearInterval(ival);
            return;
        }
        DrawOnGrid();
    }, interval);
}
function ShellSort(){
    var gaps = [701, 301, 132, 57, 23, 10, 4, 1];
    var gapIndex = 0;
    var gap = gaps[0];
    var i = gap;
    var temp = heights[i];
    var j = i;
    var ival = setInterval(() => {
        if (gapIndex < gaps.length) {
            if (i < number) {
                if (j >= gap && (heights[j - gap] > temp)) {
                    heights[j] = heights[j - gap];
                    j -= gap;
                } else {
                    heights[j] = temp;
                    i++;
                    j = i;
                    temp = heights[i];
                }
            } else {
                gapIndex++;
                gap = gaps[gapIndex];
                i = gap;
                j = i;
                temp = heights[i];
            }
        } else {
            clearInterval(ival);
            console.log("FINISHED");
            return;
        }
        DrawOnGrid();
    }, interval);
}
function SelectionSort(){
    var time = 0;
    var i = 0;
    var indexMin = 0;
    var ival = setInterval(() => {
        if (time >= number){
            clearInterval(ival);
            console.log("FINISHED");
            return;
        }else{
            current = [i, indexMin];
            if (heights[i] < heights[indexMin]){
                indexMin = i;
            }
            i++;
            if (i >= number){
                Swap(time, indexMin);
                time++;
                indexMin = time;
                i = indexMin+1;
            }
        }
        DrawOnGrid();
    }, interval)
}
function PatienceSorting(){
    var piles = [];
    var inspecting = true;
    var i = 0;
    var arr = [];
    var sorting = true;
    var ival = setInterval(() => {
        if (inspecting){
            var placed = false;
            for (var j = 0; j < piles.length; j++){
                var x = piles[j];
                if (x[x.length-1][0] < heights[i]){
                    piles[j].push([heights[i], i++]);
                    placed = true;
                    break;
                }
            }
            if (!placed){
                piles.push([[heights[i], i++]]);
            }
            if (i >= number){
                inspecting = false;
                console.log(piles);
                i = 0;
            }
        }else{
            if (sorting){
                var minNum = number+1;
                var ind2 = 0;
                current = [];
                for (var j = 0; j < piles.length; j++){
                    current.push(piles[j][0][1]);
                    if (piles[j][0][0] < minNum){
                        minNum = piles[j][0][0];
                        ind2 = j;
                    }
                }
                piles[ind2].shift();
                if (piles[ind2].length == 0){
                    piles.splice(ind2, 1);
                }
                arr.push(minNum);
                i++;
                DrawOnGrid();
                if (i >= number){
                    sorting = false;
                    i = 0;
                }
            }else{
                current = [i];
                heights[i] = arr[i++];
                DrawOnGrid();
                if (i >= number){
                    clearInterval(ival);
                    console.log("FINISHED");
                    return;
                }
            }
                
        }
    }, interval);
}
var sortings = {
    "bubble": BubbleSort,
    "cocktail": CocktailShakerSort,
    "gnome": GnomeSort,
    "comb": CombSort,
    "exchange": ExchangeSort,
    "oddeven": OddEvenSort,
    "insertion": InsertionSort,
    "shell": ShellSort,
    "selection": SelectionSort,
    "patience": PatienceSorting,
}
// event handlers//
HTML.ID("shuffle").addEventListener('click', (e) => {
    if (!sortOccuring){
        Shuffle();
        DrawOnGrid();
    }
})
var sel = HTML.ID("choice");
HTML.ID('sort').addEventListener('click', (e) => {
    if (!sortOccuring){
        sortings[sel.options[sel.options.selectedIndex].value]();
    }
})
HTML.ID('style').addEventListener('click', (e) => {
    if (style == 'bar'){
        style = 'star';
    }else{
        style = 'bar';
    }
    DrawOnGrid();
})

DrawOnGrid();
