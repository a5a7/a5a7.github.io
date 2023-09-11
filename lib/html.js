class HTML{
    constructor(){
        this.eventMap = {};
    }
    static ID(id){
        return document.getElementById(id);
    }
    AddEvent(id, eventName, x){
        if (this.eventMap[eventName] != undefined) this.eventMap[eventName].push([x, id]);
    }
    Trigger(event, id, action){
        this.eventMap[event] = [];
        this.ID(id).addEventListener(action, (e) => {
            for (var x of this.eventMap[event]){
                x[0](this.ID(x[1]), e);
            }
        })
    }
}