function Evaluator(ctx) {
    const parser = new Parser(),
        context = (arguments.length < 1) ? new Context() : ctx;

    function execute(node) {
        let left, right, expr, args, i;

        if (node.hasOwnProperty('Expression')) {
            return execute(node.Expression);
        }
        if (node.hasOwnProperty('Number')) {
            return parseFloat(node.Number);
        }
        if (node.hasOwnProperty('Binary')) {
            node = node.Binary;
            left = execute(node.left);
            right = execute(node.right);
            switch (node.operator) {
                case '+':
                    return left + right;
                case '-':
                    return left - right;
                case '*':
                    return left * right;
                case '/':
                    return left / right;
                default:
                    throw new SyntaxError('Unknown operator ' + node.operator);
            }
        }

        if (node.hasOwnProperty('Unary')) {
            node = node.Unary;
            expr = execute(node.expression);
            switch (node.operator) {
                case '+':
                    return expr;
                case '-':
                    return -expr;
                default:
                    throw new SyntaxError('Unknown operator ' + node.operator);
            }
        }

        if (node.hasOwnProperty('Identifier')) {
            if (context.Constants.hasOwnProperty(node.Identifier)) {
                return context.Constants[node.Identifier];
            }
            if (context.Variables.hasOwnProperty(node.Identifier)) {
                return context.Variables[node.Identifier];
            }
            throw new SyntaxError('Unknown identifier');
        }

        if (node.hasOwnProperty('Assignment')) {
            right = execute(node.Assignment.value);
            context.Variables[node.Assignment.name.Identifier] = right;
            return right;
        }

        if (node.hasOwnProperty('FunctionCall')) {
            expr = node.FunctionCall;
            if (context.Functions.hasOwnProperty(expr.name)) {
                args = [];
                for (i = 0; i < expr.args.length; i += 1) {
                    args.push(execute(expr.args[i]));
                }
                return context.Functions[expr.name].apply(null, args);
            }
            throw new SyntaxError('Unknown function ' + expr.name);
        }

        throw new SyntaxError('Unknown syntax node');
    }

    function evaluate(expr) {
        const tree = parser.parse(expr);
        return execute(tree);
    }

    return {
        evaluate: evaluate
    };
};