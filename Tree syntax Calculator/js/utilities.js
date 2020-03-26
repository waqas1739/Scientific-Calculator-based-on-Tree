function contains(array, obj) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function escapeValue(v) {
    if (typeof v === 'string') {
        return JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    }
    return v;
}

