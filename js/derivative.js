document.getElementById("calculate").addEventListener('click', (e) => {
    var tex = HTML.Value("exp");
    var out = MathParser.parseString(tex);
    console.log(out.derivative().simplify());
    HTML.ID("out").innerHTML = "$" + out.derivative().simplify().toLatex() + "$";
    MathJax.typeset();
})