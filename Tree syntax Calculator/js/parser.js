function Parser() {
    const lexer = new Lexer(),
        T = Token;

    function checkToken(token, op) {
        return (typeof token !== 'undefined') && token.type === T.Operator && token.value === op;
    }

    function isDigit(ch) {
        return /\d/.test(ch);
    }

    function isLetter(ch) {
        return /[a-z]/i.test(ch);
    }

    function isOperator(ch) {
        return /\+|-|\*|\/|\^/.test(ch);
    }

    function isLeftParenthesis(ch) {
        return /\(/.test(ch);
    }

    function isRightParenthesis(ch) {
        return /\)/.test(ch);
    }
    function isComma(ch) {
        return /,/.test(ch);
    }

    function isVarDeclaration(ch) {
        return /\$/.test(ch);
    }

    // ArgumentList := Expression |
    //                 Expression ',' ArgumentList
    function parseArgumentList() {
        let token, expr;
        const args = [];

        while (true) {
            expr = parseExpression();
            if (typeof expr === 'undefined') {
                // TODO maybe throw exception?
                break;
            }
            args.push(expr);
            token = lexer.peek();
            if (!checkToken(token, ',')) {
                break;
            }
            lexer.next();
        }
        return args;
    }

    // FunctionCall ::= Identifier '(' ')' ||
    //                  Identifier '(' ArgumentList ')'
    function parseFunctionCall(name) {
        let token, args = [];

        token = lexer.next();
        if (!checkToken(token, '(')) {
            throw new SyntaxError('Expecting ( in a function call "' + name + '"');
        }

        token = lexer.peek();
        if (!checkToken(token, ')')) {
            args = parseArgumentList();
        }

        token = lexer.next();
        if (!checkToken(token, ')')) {
            throw new SyntaxError('Expecting ) in a function call "' + name + '"');
        }

        return {
            'FunctionCall' : {
                'name': name,
                'args': args
            }
        };
    }

    // Primary ::= Identifier |
    //             Number |
    //             '(' Assignment ')' |
    //             FunctionCall
    function parsePrimary() {
        let token, expr;
        token = lexer.peek();
        if (typeof token === 'undefined') {
            throw new SyntaxError('Unexpected termination of expression');
        }

        if(token.type === T.Var){
            token = lexer.next();
            return {
                'Variables': token.value
            };
        }
        if (token.type === T.Identifier) {
            token = lexer.next();
            if (checkToken(lexer.peek(), '(')) {
                return parseFunctionCall(token.value);
            } else {
                return {
                    'Identifier': token.value
                };
            }
        }

        if (token.type === T.Number) {
            token = lexer.next();
            return {
                'Number': token.value
            };
        }

        if (checkToken(token, '(')) {
            lexer.next();
            expr = parseAssignment();
            token = lexer.next();
            if (!checkToken(token, ')')) {
                throw new SyntaxError('Expecting )');
            }
            return {
                'Expression': expr
            };
        }

        throw new SyntaxError('Parse error, can not process token ' + token.value);
    }

    // Unary ::= Primary |
    //           '-' Unary
    function parseUnary() {
        let token, expr;

        token = lexer.peek();
        if (checkToken(token, '-') || checkToken(token, '+')) {
            token = lexer.next();
            expr = parseUnary();
            return {
                'Unary': {
                    operator: token.value,
                    expression: expr
                }
            };
        }

        return parsePrimary();
    }

    // Multiplicative ::= Unary |
    //                    Multiplicative '*' Unary |
    //                    Multiplicative '/' Unary
    function parseMultiplicative() {
        let expr, token;
        expr = parseUnary();
        token = lexer.peek();
        while (checkToken(token, '*') || checkToken(token, '/')) {
            token = lexer.next();
            expr = {
                'Binary': {
                    operator: token.value,
                    left: expr,
                    right: parseUnary()
                }
            };
            token = lexer.peek();
        }
        return expr;
    }

    // Additive ::= Multiplicative |
    //              Additive '+' Multiplicative |
    //              Additive '-' Multiplicative
    function parseAdditive() {
        let expr, token;
        expr = parseMultiplicative();
        token = lexer.peek();
        while (checkToken(token, '+') || checkToken(token, '-')) {
            token = lexer.next();
            expr = {
                'Binary': {
                    operator: token.value,
                    left: expr,
                    right: parseMultiplicative()
                }
            };
            token = lexer.peek();
        }
        return expr;
    }

    // Assignment ::= Identifier '=' Assignment |
    //                Additive
    function parseAssignment() {
        let token, expr;
        expr = parseAdditive();
        if (typeof expr !== 'undefined' && expr.Identifier) {
            token = lexer.peek();
            if (checkToken(token, '=')) {
                lexer.next();
                return {
                    'Assignment': {
                        name: expr,
                        value: parseAssignment()
                    }
                };
            }
            return expr;
        }
        return expr;
    }

    // Expression ::= Assignment
    function parseExpression() {
        return parseAssignment();
    }

    function parse(expression) {
        let expr, token;
        lexer.reset(expression);
        expr = parseExpression();
        token = lexer.next();
        if (typeof token !== 'undefined') {
            throw new SyntaxError('Unexpected token ' + token.value);
        }
        return { 'Expression': expr };
    }

    return { parse: parse};
};