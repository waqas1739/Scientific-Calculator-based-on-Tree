 function Context() {
     let Constants, Functions;
     Constants = {
        pi: 3.1415926535897932384,
        phi: 1.6180339887498948482
    };
     Functions = {
         sqrt: Math.sqrt,
         abs: Math.abs,
         random: Math.random,
         ceil: Math.ceil,
         floor: Math.floor,
         exp: Math.exp
     };
    return {
        Constants: Constants,
        Functions: Functions,
        Variables: {}
    };
};