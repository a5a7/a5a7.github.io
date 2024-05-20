class HTML{
    constructor(){
        this.eventMap = {};
    }
    static Value(id){
        return this.ID(id).value;
    }
    static ID(id){
        return document.getElementById(id);
    }
}