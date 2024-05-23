class HTML{
    constructor(){
    }
    static Value(id){
        return this.ID(id).value;
    }
    static ID(id){
        return document.getElementById(id);
    }
}