var width = 500, height = 400;
var ca = new Canvas(width, height);
ca.Init("gen-output");

var boids = [];
var cohesionAlignmentRange = 50;
var separationRange = 10;
var alignmentFactor = 0.075;
var cohesionFactor = 0.004;
var separationFactor = 0.1;
var margin = 15;
var radii = [18, 40, 100];

class Boid{
    constructor(){
        this.x = Math.round(Math.random() * width);
        this.y = Math.round(Math.random() * height);
        this.id = "#000";
        this.velX = Math.random() * 5 - 2.5;
        this.velY = Math.random() * 5 - 2.5;
    }

    NormalVelocity(){
        var dist = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
        if (dist == 0) return [0, 0];
        return [this.velX/dist, this.velY/dist];
    }

    Distance(b){
        return Math.sqrt((this.x-b.x) * (this.x-b.x) + (this.y-b.y) * (this.y-b.y));
    }

    CalculateNext(){
        let separationX = 0, separationY = 0;
        let alignmentX = 0, alignmentY = 0;
        let cohesionX = 0, cohesionY = 0;
        let neighbors = 0, separation = 0;
        for (var x of boids){
            if (x == this) continue;
            var dist = this.Distance(x);
            if (dist < separationRange){
                separationX += (this.x - x.x);
                separationY += (this.y - x.y);
                separation++;
            }
            if (dist < cohesionAlignmentRange){
                alignmentX += x.velX;
                alignmentY += x.velY;
                cohesionX += x.x;
                cohesionY += x.y;
                neighbors++;
            }
        }
        if (isNaN(alignmentX)){
            console.log(cohesionX, cohesionY, alignmentY, x.vx, x.vy);
        }
        if (neighbors > 0){
            alignmentX /= neighbors;
            alignmentY /= neighbors;
            cohesionX /= neighbors;
            cohesionY /= neighbors;
            this.velX += (alignmentX - this.velX) * alignmentFactor;
            this.velY += (alignmentY - this.velY) * alignmentFactor;
            this.velX += (cohesionX - this.x) * cohesionFactor;
            this.velY += (cohesionY - this.y) * cohesionFactor;
        }
        this.velX += separationX * separationFactor;
        this.velY += separationY * separationFactor;
        // cruising
        var mag = Math.sqrt(this.velX**2+this.velY**2);
        if (mag < 4){
            this.velX *= 2/mag;
            this.velY *= 2/mag;
        }
        if (mag > 9){
            this.velX *= 3/mag;
            this.velY *= 3/mag;
        }
        if (this.x < margin) this.velX += 0.75;
        if (this.x > (width-margin)) this.velX -= 0.75;
        if (this.y < margin) this.velY += 0.75;
        if (this.y > (height-margin)) this.velY -= 0.75;
    }

    MoveNext(){
        this.x += this.velX;
        this.y += this.velY;
    }

    Draw(){
        ca.DrawRect(this.x, this.y, 3, 3, this.id);
    }
}

setInterval(() => {
    ca.ClearCanvas();
    for (var x of boids){
        x.CalculateNext();
    }
    for (var x of boids){
        x.MoveNext();
        x.Draw();
    }
}, 10);

HTML.ID("simulate").addEventListener("click", () => {
    var number = HTML.Value("boids");
    while (number > boids.length){
        boids.push(new Boid());
    }
    while (boids.length > number){
        boids.pop();
    }
}); 