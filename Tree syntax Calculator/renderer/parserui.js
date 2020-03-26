var lexer, parseId;

function parse() {
    if (parseId) {
        window.clearTimeout(parseId);
    }

    parseId = window.setTimeout(function () {
        var code, str,
            lexer, tokens, token, i,
            parser, syntax;

        code = document.getElementById('code').value;
        try {
            if (typeof lexer === 'undefined') {
                lexer = new Lexer();
            }

            if (typeof parser === 'undefined') {
                parser = new Parser();
            }

            tokens = [];
            lexer.reset(code);
            while (true) {
                token = lexer.next();
                if (typeof token === 'undefined') {
                    break;
                }
                tokens.push(token);
            }

            str = '<table width=200>\n';
            for (i = 0; i < tokens.length; i += 1) {
                token = tokens[i];
                str += '<tr>';
                str += '<td>';
                str += token.type;
                str += '</td>';
                str += '<td align=center>';
                str += token.value;
                str += '</td>';
                str += '</tr>';
                str += '\n';
            }
            document.getElementById('tokens').innerHTML = str;
            syntax = parser.parse(code);
            function stringify(object, key, depth) {
                var indent = '',
                    str = '',
                    value = object[key],
                    i,
                    len;

                while (indent.length < depth * 3) {
                    indent += ' ';
                }

                switch (typeof value) {
                    case 'string':
                        str = value;
                        break;
                    case 'number':
                    case 'boolean':
                    case 'null':
                        str = String(value);
                        break;
                    case 'object':
                        for (i in value) {
                            if (value.hasOwnProperty(i)) {
                                str += ('<br>' + stringify(value, i, depth + 1));
                            }
                        }
                        break;
                }
                return indent + ' ' + key + ': ' + str;
            }
            document.getElementById('syntax').innerHTML = stringify(syntax, 'Expression', 0);
        } catch (e) {
            document.getElementById('syntax').innerText = e.message;
            document.getElementById('tokens').innerText = '';
        }
        parseId = undefined;
    }, 345);
}
