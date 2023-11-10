var width = 600, height = 450;
var ca = new Canvas(width, height);
ca.Init();

var count = 1000;
var boids = [];
var radii = [10, 20, 30];
var forceWeights = [1, 1, 1, 0];
var cruisingSpeed = 5;
var attract = false;
var attractionPoint = [width/2, height/2];

ca.canvas.addEventListener('mousedown', (e) => {
    attract = true;
    attractionPoint = [e.offsetX, e.offsetY];
});

ca.canvas.addEventListener('mousemove', (e) => {
    if (attract){
        attractionPoint = [e.offsetX, e.offsetY];
    }
})

document.addEventListener('mouseup', (e) => {
    attract = false;
});

class Boid{
    constructor(){
        this.x = Math.round(Math.random() * width);
        this.y = Math.round(Math.random() * width);
        this.id = "#";
        for (var i = 0; i < 6; i++) this.id += "1234567890abcdef"[Math.floor(Math.random() * 16)];
        this.velX = 0;
        this.velY = 0;
    }

    NormalVelocity(){
        var dist = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
        if (dist == 0) return [0, 0];
        return [this.velX/dist, this.velY/dist];
    }

    Init(){
        boids.push(this);
    }

    Distance(b){
        return Math.sqrt((this.x-b.x) * (this.x-b.x) + (this.y-b.y) * (this.y-b.y));
    }

    CalculateNext(){
        for (var x of boids){
            var dist = this.Distance(x);
            if (x.id == this.id){
                continue;
            }else if (dist == 0){
                continue;
            }
            var vel = x.NormalVelocity();
            if (dist <= radii[0]){
                // separation //
                this.velX -= (x.x-this.x)/(Math.sqrt(dist));
                this.velY -= (x.y-this.y)/(Math.sqrt(dist));
            }else if (dist <= radii[1]){
                // alignment //
                this.velX += vel[0];
                this.velY += vel[1];
            }else{
                // cohesion //
                this.velX += (x.x-this.x)/(dist*dist);
                this.velY += (x.y-this.y)/(dist*dist);
            }
        }
        this.velX /= 5;
        this.velY /= 5;
        this.x += this.velX;
        this.y += this.velY;
    }

    Draw(){
        while (this.x < 0) this.x += width;
        while (this.y < 0) this.y += height;
        this.x = this.x%width;
        this.y = this.y%height;
        ca.DrawRect(this.x, this.y, 2, 2, this.id);
    }
}

for (var i = 0; i < count; i++){
    boids.push(new Boid());
}

setInterval(() => {
    ca.ClearCanvas();
    for (var x of boids){
        x.CalculateNext();
    }
    for (var x of boids){
        x.Draw();
    }
}, 4);