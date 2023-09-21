class MathParser{
    static parse(s){
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
}

class Operator{
    constructor(type, term1, term2){
        this.type = type;
        this.term1 = term1;
        if (typeof term1 == "string") this.term1 = MathParser.parse(term1);
        this.term2 = term2;
        if (typeof term2 == "string") this.term2 = MathParser.parse(term2);
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
                var t1 = new Operator("Multiply", new Operator("Multiply", this.term2, new Operator("Power", this.term1, new Operator("Subtract", this.term2, MathParser.parse("1")))), this.term1.derivative());
                var t2 = new Operator("Multiply", this.term2.derivative(), new Operator("Multiply", new Operator("Log", "e", this.term1), new Operator("Power", this.term1, this.term2)));
                return new Operator("Add", t1, t2);

            case "Log":
                return new Operator("Divide", this.term2.derivative(), new Operator("Multiply", this.term2, new Operator("Log", "e", this.term1)));

            default:
                break;
        }
    }

    simplify(){
        console.log(this.term1.toLatex(), this.term2.toLatex());
        this.term1 = this.term1.simplify();
        this.term2 = this.term2.simplify();
        console.log(this.type, this.term1.toLatex(), this.term2.toLatex());
        switch (this.type){
            case "Add":
                if (this.term1.constructor == Expression && this.term1.isZero()) return this.term2;
                if (this.term2.constructor == Expression && this.term2.isZero()) return this.term1;
                if (this.term1.constructor == Expression && this.term2.constructor == Expression){
                    if (this.term1.type == "number" && this.term2.type == "number"){
                        return new Expression((BigInt(this.term1.term) + BigInt(this.term2.term)).toString());
                    }
                }

            case "Multiply":
                if (this.term1.constructor == Expression && this.term1.isZero()) return new Expression("0");
                if (this.term2.constructor == Expression && this.term2.isZero()) return new Expression("0");
                if (this.term1.constructor == Expression && this.term1.isOne()) return this.term2;
                if (this.term2.constructor == Expression && this.term2.isOne()) return this.term1;
                if (this.term1.constructor == Expression && this.term2.constructor == Expression){
                    if (this.term1.type == "number" && this.term2.type == "number"){
                        return new Expression((BigInt(this.term1.term)*BigInt(this.term2.term)).toString());
                    }
                }
                var multiplyArr = [];
                var recurse = (exp) => {
                    if (exp.term1.constructor == Expression){
                        recurse(exp.term1);
                    }else{
                        multiplyArr.push(exp.term1);
                    }
                    if (exp.term2.constructor == Expression){
                        recurse(exp.term2);
                    }else{
                        multiplyArr.push(exp.term2);
                    }
                };

            case "Subtract":
                if (this.term2.constructor == Expression && this.term2.isZero()) return this.term1;
                if (this.term1.type == "number" && this.term2.type == "number"){
                    return new Expression((BigInt(this.term1.term)-BigInt(this.term2.term)).toString());
                }

            case "Divide":
                if (this.term2.constructor == Expression && this.term2.isOne()) return this.term1;
                
            case "Power":
                if (this.term2.constructor == Expression && this.term2.isZero()) return new Expression("1");
                if (this.term1.type == "number" && this.term2.type == "number"){
                    return new Expression((BigInt(this.term1.term)^BigInt(this.term2.term)).toString());
                }

            case "Log":
                if (this.term2.constructor == Expression && this.term2.isOne()) return new Expression("0");

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
                return `{${this.term1.toLatex()}}^{${this.term2.toLatex()}}`
            case "Log":
                if (this.term1.term == "e"){
                    return `\\ln \\left(${this.term2.toLatex()}\\right)`;
                }
                return `\\log_{${this.term1.toLatex()}} \\left(${this.term2.toLatex()}\\right)`
            default:
                break;
        }
    }
}

class Expression{
    constructor(term){
        this.term = term;
        this.type = "number";
        if (term == "x") this.type = "variable";
        if (term == "e") this.type = "constant";
    }

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
}