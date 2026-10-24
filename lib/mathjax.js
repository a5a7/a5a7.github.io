// MathJax's configuration, loaded before the library itself, and shared by
// every article so a macro defined here is available to all of them.
//
// A macro is [definition, argument count].
//   \pd{f}{x}       the partial of f with respect to x
//   \pd{}{x}        the bare operator, with nothing on top
//   \pdn{2}{f}{x}   a higher order partial
//   \pdm{f}{x}{y}   a mixed second partial
//   \od{f}{t}, \odn{2}{y}{x}    the ordinary derivatives
// The order is a separate macro rather than an optional argument: writing
// \partial^{#1} with an empty default leaves an empty superscript, which is
// not free. It widens the \partial and, over a subscripted variable, stacks
// above it and drops the whole fraction's baseline, so \pd{h}{x_i} would not
// line up with a \frac{\partial h}{\partial x_i} next to it.
window.MathJax = {
    tex: {
        inlineMath: [["$", "$"], ["\\(", "\\)"]],
        tags: "ams",
        macros: {
            pd: ["\\frac{\\partial #1}{\\partial #2}", 2],
            pdn: ["\\frac{\\partial^{#1} #2}{\\partial #3^{#1}}", 3],
            pdm: ["\\frac{\\partial^2 #1}{\\partial #2 \\, \\partial #3}", 3],
            od: ["\\frac{d #1}{d #2}", 2],
            odn: ["\\frac{d^{#1} #2}{d #3^{#1}}", 3],
            grad: ["\\nabla"],
        }
    }
};
