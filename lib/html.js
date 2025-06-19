class HTML{
    constructor(){
    }
    static Value(id){
        return this.ID(id).value;
    }
    static SELECT(sel){
        return document.querySelector(sel);
    }
    static ID(id){
        return document.getElementById(id);
    }
}