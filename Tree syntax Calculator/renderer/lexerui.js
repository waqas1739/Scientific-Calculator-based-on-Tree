var lexer, parseId;

function parse() {
    if (parseId) {
        window.clearTimeout(parseId);
    }

    parseId = window.setTimeout(function () {
        var code, str,
            lexer, tokens, token, i;

        code = document.getElementById('code').value;
        try {
            if (typeof lexer === 'undefined') {
                lexer = new Lexer();
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

        } catch (e) {
            document.getElementById('tokens').innerText = '';
        }
        parseId = undefined;
    }, 345);
}
