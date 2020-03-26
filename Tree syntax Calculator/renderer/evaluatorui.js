var evaluator, evalId;
function parse() {
    if (evalId) {
        window.clearTimeout(evalId);
    }

    evalId = window.setTimeout(function () {
        var el, expr;

        el = document.getElementById('result')
        expr = document.getElementById('code').value;
        try {
            if (typeof evaluator === 'undefined') {
                evaluator = new Evaluator();
            }
            result = evaluator.evaluate(expr);
            el.textContent = 'Result: ' + result;
        } catch (e) {
            el.textContent = 'Error: ' + e.toString();
        }
        evalId = undefined;
    }, 345);
}
