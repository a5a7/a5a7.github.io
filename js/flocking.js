var width = 500, height = 400;
var ca = new Canvas(width, height);
ca.Init("gen-output");

var boids = [];
var radii = [18, 40, 100];

class Boid{
    constructor(){
        this.x = Math.round(Math.random() * width);
        this.y = Math.round(Math.random() * height);
        this.id = "#";
        for (var i = 0; i < 6; i++) this.id += "0123456789abcdef"[Math.floor(Math.random()*16)];
        this.velX = 0;
        this.velY = 0;
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
        for (var x of boids){
            var dist = this.Distance(x);
            if (x.id == this.id){
                continue;
            }
            var vel = x.NormalVelocity();
            if (dist <= radii[0]){
                // separation //
                this.velX -= (x.x-this.x)/(Math.sqrt(dist**0.5));
                this.velY -= (x.y-this.y)/(Math.sqrt(dist**0.5));
            }else if (dist <= radii[1]){
                // alignment //
                this.velX += 2*vel[0];
                this.velY += 2*vel[1];
            }else if (dist <= radii[2]){
                // cohesion //
                this.velX += (x.x-this.x)/(this.Distance(x)**2);
                this.velY += (x.y-this.y)/(this.Distance(x)**2);
            }
        }
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
        if (this.x < 0) this.velX += 1;
        if (this.x > (width)) this.velX -= 1;
        if (this.y < 0) this.velY += 1;
        if (this.y > (height)) this.velY -= 1;
    }

    MoveNext(){
        this.x += this.velX;
        this.y += this.velY;
        if (this.x > width) this.velX *= 0.05;
        if (this.x < 0) this.velX *= 0.05;
        if (this.y > height) this.velY *= 0.05;
        if (this.y < 0) this.velY *= 0.05;
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