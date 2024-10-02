class MathParser{
    static parseFunctions(s){
        var counter = 0;
        var start = s.indexOf("(");
        if (start == -1){
            return new Expression(s.trim());
        }
        var word = s.slice(0, start).trim();
        var term1, term2;
        for (var i = start; i < s.length; i++){
            if (s[i] == '(') counter++;
            if (s[i] == ')') counter--;
            if (s[i] == ','){
                if (counter == 1){
                    term1 = s.slice(start+1, i);
                    term2 = s.slice(i+1, s.length-1);
                    break;
                }
            }
        }
        return new Operator(word, term1, term2);
    }

    static parseString(s){
        var components = [];
        var newString = "";
        for (var i = 0; i < s.length; i++){
            if (s[i] == '('){
                var open = 1;
                var comp = "(";
                while (open != 0){
                    i++;
                    if (i < s.length){
                        if (s[i] == '(') open++;
                        if (s[i] == ')') open--;
                        comp += s[i];
                    }
                }
                components.push(comp);
                newString += "c" + components.length;
            }else{
                newString += s[i];
            }
        }
        if (components.length == 1 && components[0] == s){
            return this.parseString(components[0].slice(1, components[0].length-1));
        }
        if (newString.indexOf("+") != -1){
            var parts = newString.slice(0, newString.indexOf("+"));
            var parts2 = newString.slice(newString.indexOf("+")+1);
            for (var i = 0; i < components.length; i++){
                parts=parts.replace("c"+(i+1), components[i]);
                parts2=parts2.replace("c"+(i+1), components[i]);
            }
            return new Operator("Add", this.parseString(parts), this.parseString(parts2));
        }
        if (newString.indexOf("-") != -1){
            var parts = newString.slice(0, newString.indexOf("-"));
            var parts2 = newString.slice(newString.indexOf("-")+1);
            for (var i = 0; i < components.length; i++){
                parts=parts.replace("c"+(i+1), components[i]);
                parts2=parts2.replace("c"+(i+1), components[i]);
            }
            return new Operator("Subtract", this.parseString(parts), this.parseString(parts2));
        }
        if (newString.indexOf("*") != -1){
            var parts = newString.slice(0, newString.indexOf("*"));
            var parts2 = newString.slice(newString.indexOf("*")+1);
            for (var i = 0; i < components.length; i++){
                parts=parts.replace("c"+(i+1), components[i]);
                parts2=parts2.replace("c"+(i+1), components[i]);
            }
            return new Operator("Multiply", this.parseString(parts), this.parseString(parts2));
        }
        if (newString.indexOf("/") != -1){
            var parts = newString.slice(0, newString.indexOf("/"));
            var parts2 = newString.slice(newString.indexOf("/")+1);
            for (var i = 0; i < components.length; i++){
                parts=parts.replace("c"+(i+1), components[i]);
                parts2=parts2.replace("c"+(i+1), components[i]);
            }
            return new Operator("Divide", this.parseString(parts), this.parseString(parts2));
        }
        if (newString.indexOf("^") != -1){
            var parts = newString.slice(0, newString.indexOf("^"));
            var parts2 = newString.slice(newString.indexOf("^")+1);
            for (var i = 0; i < components.length; i++){
                parts=parts.replace("c"+(i+1), components[i]);
                parts2=parts2.replace("c"+(i+1), components[i]);
            }
            return new Operator("Power", this.parseString(parts), this.parseString(parts2));
        }
        return new Expression(s);
    }
}

class Operator{
    constructor(type, term1, term2){
        this.type = type;
        this.term1 = term1;
        if (typeof term1 == "string") this.term1 = MathParser.parseFunctions(term1);
        this.term2 = term2;
        if (typeof term2 == "string") this.term2 = MathParser.parseFunctions(term2);
    }

    derivative(){
        switch (this.type) {
            case "Multiply":
                var t1 = new Operator("Multiply", this.term1.derivative(), this.term2);
                var t2 = new Operator("Multiply", this.term1, this.term2.derivative());
                return new Operator("Add", t1, t2);

            case "Add":
                return new Operator("Add", this.term1.derivative(), this.term2.derivative());
            
            case "Subtract":
                return new Operator("Subtract", this.term1.derivative(), this.term2.derivative());
            
            case "Divide":
                var t1 = new Operator("Multiply", this.term2, this.term1.derivative());
                var t2 = new Operator("Multiply", this.term1, this.term2.derivative());
                var t3 = new Operator("Subtract", t1, t2);
                return new Operator("Divide", t3, new Operator("Power", this.term2, "2"));
            
            case "Power":
                var t1 = new Operator("Multiply", new Operator("Multiply", this.term2, new Operator("Power", this.term1, new Operator("Subtract", this.term2, new Expression("1")))), this.term1.derivative());
                var t2 = new Operator("Multiply", this.term2.derivative(), new Operator("Multiply", new Operator("Log", "e", this.term1), new Operator("Power", this.term1, this.term2)));
                return new Operator("Add", t1, t2);

            case "Log":
                return new Operator("Divide", this.term2.derivative(), new Operator("Multiply", this.term2, new Operator("Log", "e", this.term1)));

            default:
                break;
        }
    }

    simplify(){
        this.term1 = this.term1.simplify();
        this.term2 = this.term2.simplify();
        switch (this.type){
            case "Add":
                if (this.term1.constructor == Expression && this.term1.isZero()) return this.term2;
                if (this.term2.constructor == Expression && this.term2.isZero()) return this.term1;
                if (this.term1.constructor == Expression && this.term2.constructor == Expression){
                    if (this.term1.type == 'number' && this.term2.type == 'number') return new Expression((BigInt(this.term1.term)+BigInt(this.term2.term)).toString());
                }
                return this;

            case "Subtract":
                if (this.term2.constructor == Expression && this.term2.isZero()) return this.term1;
                if (this.term1.constructor == Expression && this.term2.constructor == Expression){
                    if (this.term1.type == 'number' && this.term2.type == 'number') return new Expression((BigInt(this.term1.term)-BigInt(this.term2.term)).toString());
                }
                return this;

            case "Multiply":
                if (this.term1.constructor == Expression && this.term1.isZero()) return new Expression("0");
                if (this.term1.constructor == Expression && this.term1.isOne()) return this.term2;
                if (this.term2.constructor == Expression && this.term2.isZero()) return new Expression("0");
                if (this.term2.constructor == Expression && this.term2.isOne()) return this.term1;
                if (this.term1.constructor == Operator && this.term1.type == "Add") return new Operator("Add", new Operator("Multiply", this.term1.term1, this.term2), new Operator("Multiply", this.term1.term2, this.term2));
                if (this.term1.constructor == Operator && this.term1.type == "Subtract") return new Operator("Subtract", new Operator("Multiply", this.term1.term1, this.term2), new Operator("Multiply", this.term1.term2, this.term2));
                if (this.term2.constructor == Operator && this.term2.type == "Add") return new Operator("Add", (new Operator("Multiply", this.term2.term1, this.term1)).simplify(), (new Operator("Multiply", this.term2.term2, this.term1)).simplify());
                if (this.term2.constructor == Operator && this.term2.type == "Subtract") return new Operator("Subtract", (new Operator("Multiply", this.term2.term1, this.term1)).simplify(), (new Operator("Multiply", this.term2.term2, this.term1)).simplify());
                return this;

            case "Divide":
                if (this.term1.constructor == Expression && this.term1.isZero()) return new Expression("0");
                return this;
            
            case "Power":
                if (this.term2.constructor == Expression && this.term2.isOne()) return this.term1;
                return this;

            default:
                return this;
        }
    }

    toLatex(){
        switch (this.type) {
            case "Add":
                return `${this.term1.toLatex()}+${this.term2.toLatex()}`
            case "Subtract":
                return `${this.term1.toLatex()}-\\left(${this.term2.toLatex()}\\right)`
            case "Multiply":
                return `${this.term1.toLatex()}\\cdot(${this.term2.toLatex()})`
            case "Divide":
                return `\\left(\\frac{${this.term1.toLatex()}}{${this.term2.toLatex()}}\\right)`
            case "Power":
                return `(${this.term1.toLatex()})^{${this.term2.toLatex()}}`
            case "Log":
                if (this.term1.term == "e"){
                    return `\\ln \\left(${this.term2.toLatex()}\\right)`;
                }
                return `\\log_{${this.term1.toLatex()}} \\left(${this.term2.toLatex()}\\right)`
            default:
                break;
        }
    }

    toString(){
        return `${this.type}(${this.term1.toString()}, ${this.term2.toString()})`
    }
}

class Expression{
    constructor(term){
        this.term = term;
        this.type = "number";
        if (term == "x") this.type = "variable";
        if (term == "e") this.type = "constant";
    }

    isNumber() {return this.type == "number"}

    isOne() {return this.type == "number" && this.term == "1"};
   
    isZero() {return this.type == "number" && this.term == "0"};

    derivative(){
        if (this.term == "x"){
            return new Expression("1");
        }else{
            return new Expression("0");
        }
    }

    simplify() {return this; }

    toLatex(){
        return this.term;
    }

    toString(){
        return this.term;
    }
}