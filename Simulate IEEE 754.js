function encodeIEEE754_64(number) {
    if (typeof number !== 'number' || number == +Infinity || number == -Infinity || Number.isNaN(number)) {
        return;
    }
    let res = {};
    let Bias = 1023;

    if (number === 0) {
        res.sign = number > 0 ? 0 : 1;
        res.exponent = '00000000000';
        res.fraction = '0'.repeat(52);
        res.ieee754 = `${res.sign} | ${res.exponent} | ${res.fraction}`;
        return res;
    }

    if (number.toString().indexOf('.') == -1) {
        console.log('Integer number');
        let number_string = number.toString(2);
        // find index of first 1 and add '.' before first 1
        let index = number_string.indexOf('1');
        number_string = number_string.slice(0, index + 1) + '.' + number_string.slice(index + 1);
        // find exp , add change format to binary
        let exp = number.toString(2).length - index - 1 ;
        let Exponent = (exp + Bias).toString(2).padStart(11, '0');
        // mantisa
        let Mantisa = number_string.slice(number_string.indexOf('1') + 2);
        while(Mantisa.length < 52){
            Mantisa +=  '0';
        }
        // result 
        res.sign = number > 0 ? 0 : 1;
        res.exponent = Exponent;
        res.fraction = Mantisa;
        res.ieee754 = `${res.sign} | ${res.exponent} | ${res.fraction}`;
        return res;
    } else {
        console.log('floating point number');
        let number_str = number.toString();
        let number_arr = number_str.split('.');
        let intPart_bin = Number(number_arr[0]).toString(2);
        let fractionalPart_bin = '0.';
        let decimalFraction =  Number('0.' + number_arr[1]);                
        for (let i = 0; i < 10; i++) {
            decimalFraction *= 2;   
            let integerPart = Math.floor(decimalFraction);
            fractionalPart_bin += integerPart;
            decimalFraction -= integerPart;
            if (decimalFraction === 0) {
                break;
            }
        }
        let binary = intPart_bin +  fractionalPart_bin.slice(1)        
        let index = binary.indexOf('1');
        // find exp , add change format to binary
        let exp = binary.indexOf('.') - index - 1 ;         
        let Exponent = (exp + Bias).toString(2).padStart(11, '0');
        // mantisa
        let Mantisa = binary.split('.').join('').slice(1);        
        while(Mantisa.length < 52){
            Mantisa +=  '0';
        }
        // result
        res.sign = number > 0 ? 0 : 1;
        res.exponent = Exponent;
        res.fraction = Mantisa;
        res.ieee754 = `${res.sign} | ${res.exponent} | ${res.fraction}`;
        return res;    
    }
}

function decodeIEEE754_64(number) {
    if(!Array.isArray(number) && number.length !== 64) { return 'Invalid value'; }
        
    let sign = number[0]; 
    number = number.slice(1);
    let exponent = number.slice(0,11);
    let fraction = number.slice(11);
    
    if (exponent.indexOf("1") === -1) {  // Subnormal numbers 
        console.log('Denormalized number');
        let Bias = 1023
        let decimalExp = 1 - Bias;
        let decimalMantisa = parseInt(fraction, 2) / 2 ** 53;

        // calculate result
        let res = ((-1) ** sign) * decimalMantisa * (2 ** decimalExp);
        return res;
        
    } else if(exponent.indexOf("0") === -1 && fraction.indexOf("1") === -1 ) { // case +Infinity and -Infinity
        if(Number(sign) == 0)
            return 'Result is a +Infinity';
        else 
            return 'Result is a -Infinity';
    } else if(exponent.indexOf(0) === -1 && fraction.indexOf(1) != -1) {  //case Nan
        return 'Result is a NaN'
    } else {
        console.log('Normalized number');
        let Bias = 1023;
        let decimalExp =  parseInt(exponent, 2) - Bias ;
        let Mantisa = 1 + '.' + fraction;
        // mantisa to decimal
        // --
        let power = -1;
        let decimalMantisa = 1;
        for (let i = 2; i < Mantisa.length; i++) {
            if (Mantisa[i] == 1) {
                decimalMantisa += 2 ** power;
            }
            --power;
        }
        // --
        // calculate result   ((−1) ** sign) × 1.f × (2 ** e−bias)
        let result = ((-1) ** sign) * decimalMantisa * (2 ** decimalExp)        
        return result.toFixed(3)
    }
}

console.log(encodeIEEE754_64(5));
console.log(decodeIEEE754_64("0100000000001001001000011111101101010100010001000010110100011000"));


