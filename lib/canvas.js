class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.style.border = '1px solid black';
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
    }

    Init(id=undefined){
        if (id == undefined){
            document.body.append(this.canvas);
        }else{
            document.getElementById(id).append(this.canvas);
        }
    }

    Remove(){
        this.canvas.remove();
    }

    onKeyPress(k, func){
        this.canvas.addEventListener('keydown', (e) => {
            if (e.key == k){
                func(e);
            }
        })
    }

    DrawRect(x, y, w, h, color="#000000"){
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    DrawPolygon(arr, fillColor="#000", strokeColor="#000"){
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.moveTo(arr[0][0], arr[0][1]);
        this.ctx.beginPath();
        for (var i = 1; i <= arr.length; i++){
            this.ctx.lineTo(arr[i%arr.length][0], arr[i%arr.length][1]);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    ClearCanvas(){
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

class GridCanvas extends Canvas{
    constructor (width, height, rows, columns){
        super(width, height);
        this.rows = rows;
        this.columns = columns;
        this.columnWidth = width/columns;
        this.rowHeight = height/rows;
        this.grid = [];
        for (var i = 0; i < this.rows; i++){
            this.grid.push([]);
            for (var j = 0; j < this.columns; j++){
                this.grid[i].push(0);
            }
        }
        this.map = {};
    }

    DrawGrid(){
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (var i = 0; i < this.rows; i++){
            for (var j = 0; j < this.columns; j++){
                this.DrawRect(j*this.columnWidth, i*this.rowHeight,
                                this.columnWidth, this.rowHeight, this.map[this.grid[i][j]]);
            }
        }
    }

    DrawLines(color="#000"){
        for (var i = 0; i < this.rows; i++){
            this.DrawRect(0, i * this.rowHeight-1, this.width, 1, color);
        }
        for (var i = 0; i < this.columns; i++){
            this.DrawRect(this.columnWidth * i - 1, 0, 1, this.height, color);
        }
    }

    MapColor(num, color){
        this.map[num] = color;
    }
    
    DeleteColor(num){
        delete this.map[num];
    }
}

class Color{
    constructor (r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }
    static Mix(c1, c2, percentage){
        var r = (c1.r * percentage + c2.r * (100-percentage))/100;
        var g = (c1.g * percentage + c2.g * (100-percentage))/100;
        var b = (c1.b * percentage + c2.b * (100-percentage))/100;
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        var str = r.toString(16);    
        var stg = g.toString(16);    
        var stb = b.toString(16);    
        while (str.length < 2) str = "0" + str;
        while (stg.length < 2) stg = "0" + stg;
        while (stb.length < 2) stb = "0" + stb;
        console.log(str, stg, stb);
        return "#" + str + stg + stb;
    }
}