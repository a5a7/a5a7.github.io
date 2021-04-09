class Canvas{
    constructor(w, h){
        this.w = w;
        this.h = h;
        this.c = document.createElement('canvas');
        this.c.width = this.w;
        this.c.height = this.h;
        this.c.style.margin = '1px'
        this.c.style.border = "1px solid black"
        this.ctx = this.c.getContext('2d');
    }
    start(){
        document.body.append(this.c);
    }
    rect(w, h, x, y, c){
        return new Rect(this, w, h, x, y, c);
    }
    clear(){
        this.ctx.clearRect(0, 0, this.w, this.h)
    }
    text(txt, x, y){
        this.c.getContext("2d").fillText(txt, x, y);
    }
    line(x, y, x1, y1, color, width){
        this.ctx.strokeStyle = color;
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = width;
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }
}
class Rect{
    constructor (ca, w, h, x, y, co, label = {}){
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
        this.p = ca;
        this.color = co;
        this.l = label;
    }
    draw(){
        this.p.ctx.fillStyle = this.color;
        this.p.ctx.fillRect(this.x, this.y, this.w, this.h)
    }
}