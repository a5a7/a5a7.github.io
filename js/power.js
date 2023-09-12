var shadow = HTML.ID("shadow");
var output = HTML.ID("output-container");

window.onload = () => {
    shadow.style.display = "none";
    output.style.display = "none";
}

function Power(a, b){
    var res = BigInt(1);
    var a_ = BigInt(a);
    var b_ = BigInt(b);
    while (b_ > 0){
        if (b_%2n == 1n) res *= a_;
        a_ *= a_;
        b_ /= 2n;
    }
    return res.toString(); 
}

document.getElementById('calculate').addEventListener("click", (e) => {
    console.log("HELLO");
    e.preventDefault();
    console.log("CALCULATED");
    var a = HTML.Value("base");
    var b = HTML.Value("exponent");
    HTML.ID("result").innerHTML = "Your result is <div>" + a + "<sup>" + b + "</sup>="+Power(a, b) + "</div>";
    output.style.display = "block";
    shadow.style.display = "block";
})

document.getElementById('output-close').addEventListener("click", (e) => {
    if (output.style.display != "none"){
        output.style.display = "none";
        shadow.style.display = "none";
    }
})