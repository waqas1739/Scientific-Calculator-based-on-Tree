function Editor(element) {

    let input, editor, cursor, blinkTimer, lexer, hasFocus;

    function hideCursor() {
        if (blinkTimer) {
            window.clearInterval(blinkTimer);
        }
        blinkTimer = undefined;
        cursor.style.visibility = 'hidden';
    }

    function blinkCursor() {
        let visible = true;
        if (blinkTimer) {
            window.clearInterval(blinkTimer);
        }
        blinkTimer = window.setInterval(function () {
            cursor.style.visibility = visible ? '' : 'hidden';
            visible = !visible;
        }, 423);
    }

    function updateCursor() {
        let start, end, x, y, i, el, cls;

        if (typeof cursor === 'undefined') {
            return;
        }

        if (cursor.getAttribute('id') !== 'cursor') {
            return;
        }

        start = input.selectionStart;
        end = input.selectionEnd;
        if (start > end) {
            end = input.selectionStart;
            start = input.selectionEnd;
        }

        if (editor.childNodes.length <= start) {
            return;
        }

        el = editor.childNodes[start];
        if (el) {
            x = el.offsetLeft;
            y = el.offsetTop;
            cursor.style.left = x + 'px';
            cursor.style.top = y + 'px';
            cursor.style.opacity = 1;
        }

        // If there is a selection, add the CSS class 'selected'
        // to all nodes inside the selection range.
        cursor.style.opacity = (start === end) ? 1 : 0;
        for (i = 0; i < editor.childNodes.length; i += 1) {
            el = editor.childNodes[i];
            cls = el.getAttribute('class');
            if (cls !== null) {
                cls = cls.replace(' selected', '');
                if (i >= start && i < end) {
                    cls += ' selected';
                }
                el.setAttribute('class', cls);
            }
        }
    }

    // Get a new text from the proxy input and update the syntax highlight
    function updateEditor() {
        let expr, tokens, token, i, j, text, str, html;

        if (typeof lexer === 'undefined') {
            lexer = new Lexer();
        }

        tokens = [];
        try {
            expr = input.value;
            lexer.reset(expr);
            while (true) {
                token = lexer.next();
                if (typeof token === 'undefined') {
                    break;
                }
                tokens.push(token);
            }

            text = '';
            html = '';
            for (i = 0; i < tokens.length; i += 1) {
                token = tokens[i];
                j = 0;
                while (text.length < token.start) {
                    text += ' ';
                    html += '<span class="blank"> </span>';
                    j = 1;
                }
                str = expr.substring(token.start, token.end + 1);
                for (j = 0; j < str.length; j += 1) {
                    html += '<span class="' + token.type + '">';
                    html += str.charAt(j);
                    text += str.charAt(j);
                    html += '</span>';
                }
            }
            while (text.length < expr.length) {
                text += ' ';
                html += '<span class="blank"> </span>';
            }
        } catch (e) {
            // plain spans for the editor
            html = '';
            for (i = 0; i < expr.length; i += 1) {
                html += '<span class="error">' + expr.charAt(i) + '</span>';
            }
        } finally {
            html += '<span class="cursor" id="cursor">\u00A0</span>';
            if (html !== editor.innerHTML) {
                editor.innerHTML = html;
                cursor = document.getElementById('cursor');
                blinkCursor();
                updateCursor();
            }
        }
    }

    function focus() {
        window.setTimeout(function () {
            input.focus();
            blinkCursor();
            updateCursor();
        }, 0);
    }

    function blur() {
        input.blur();
    }

    function deselect() {
        let el, cls;
        input.selectionEnd = input.selectionStart;
        el = editor.firstChild;
        while (el) {
            cls = el.getAttribute('class');
            if (cls && cls.match('selected')) {
                cls = cls.replace('selected', '');
                el.setAttribute('class', cls);
            }
            el = el.nextSibling;
        }
    }

    function setHandler(el, event, handler) {
        if (el.addEventListener) {
            el.addEventListener(event, handler, false);
        } else {
            el.attachEvent('on' + event, handler);
        }
    }

    function resetHandler(el, event, handler) {
        if (el.removeEventListener) {
            el.removeEventListener(event, handler, false);
        } else {
            el.detachEvent('on' + event, handler);
        }
    }

    function onInputKeyDown(event) {
        updateCursor();
    }

    function onInputKeyUp(event) {
        updateEditor();
    }

    function onInputBlur() {
        hasFocus = false;
        hideCursor();
    }

    function onInputFocus() {
        hasFocus = true;
    }

    function onEditorMouseDown(event) {
        let x, y, i, el, x1, y1, x2, y2, anchor;

        deselect();

        x = event.clientX;
        y = event.clientY;
        for (i = 0; i < editor.childNodes.length; i += 1) {
            el = editor.childNodes[i];
            x1 = el.offsetLeft;
            x2 = x1 + el.offsetWidth;
            y1 = el.offsetTop;
            y2 = y1 + el.offsetHeight;
            if (x1 <= x && x < x2 && y1 <= y && y < y2) {
                input.selectionStart = i;
                input.selectionEnd = i;
                anchor = i;
                blinkCursor();
                break;
            }
        }

        // no match, then assume it is at the end
        if (i >= editor.childNodes.length) {
            input.selectionStart = input.value.length;
            input.selectionEnd = input.selectionStart;
            anchor = input.value.length;
        }

        function onDocumentMouseMove(event) {
            let i;
            if (event.target && event.target.parentNode === editor) {
                for (i = 0; i < editor.childNodes.length; i += 1) {
                    el = editor.childNodes[i];
                    if (el === event.target && el !== cursor) {
                        input.selectionStart = Math.min(i, anchor);
                        input.selectionEnd = Math.max(i, anchor);
                        blinkCursor();
                        updateCursor();
                        break;
                    }
                }
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.returnValue = false;
        }

        function onDocumentMouseUp(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            event.returnValue = false;
            window.setTimeout(function () {
                resetHandler(document, 'mousemove', onDocumentMouseMove);
                resetHandler(document, 'mouseup', onDocumentMouseUp);
            }, 100);
        }

        focus();
        setHandler(document, 'mousemove', onDocumentMouseMove);
        setHandler(document, 'mouseup', onDocumentMouseUp);
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.returnValue = false;
    }

    function setupDOM(element) {
        let container, wrapper;

        // Proxy input where we capture user keyboard interaction
        input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.width = '100px';
        input.value = 'x = 40 + (6 / 3.0)';
        input.style.position = 'absolute';

        // Container for the above proxy, it also hides the proxy element
        container = document.createElement('div');
        container.appendChild(input);
        container.style.overflow = 'hidden';
        container.style.width = '1px';
        container.style.height = '0px';
        container.style.position = 'relative';

        // The "fake" editor
        editor = document.createElement('div');
        editor.setAttribute('class', 'editor');
        editor.style.wrap = 'on';
        editor.textContent = ' ';

        // Top-level wrapper for container
        wrapper = document.createElement('div');
        wrapper.appendChild(container);
        wrapper.appendChild(editor);
        element.appendChild(wrapper);

        // Wire all event handlers
        setHandler(input, 'keydown', onInputKeyDown);
        setHandler(input, 'keyup', onInputKeyUp);
        setHandler(input, 'blur', onInputBlur);
        setHandler(input, 'focus', onInputFocus);
        setHandler(editor, 'mousedown', onEditorMouseDown);
    }

    hasFocus = false;
    setupDOM(element);
    updateEditor();

    return {
        focus: focus,
        blur: blur,
        deselect: deselect
    };
};