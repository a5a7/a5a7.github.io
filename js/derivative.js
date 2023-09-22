document.getElementById("calculate").addEventListener('click', (e) => {
    var tex = HTML.Value("exp");
    var out = MathParser.parseString(tex);
    HTML.ID("out").innerHTML = "$" + out.derivative().simplify().toLatex() + "$";
    MathJax.typeset();
})