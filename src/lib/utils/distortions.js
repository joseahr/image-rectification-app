import math from 'mathjs'
import assert from 'assert'

export default {
    getRadialDistortion, 
    getTangencialDistortion
}

function getRadialDistortion(x, y, numParams, xo = 0, yo = 0) {

    assert(numParams >= 2 && numParams <=6, 'Número de parámatros erróneo (Válido entre 2 y 6). Valor pasado:' + numParams)

    const [_x, _y] = [x - xo, y - yo]
    const [r, ro] = [math.sqrt(x**2 + y**2), math.sqrt(xo**2 + yo**2)]

    const ax = []
        , ay = []

    for(let i = 2; i <= numParams * 2; i+=2) {
        ax.push(_x * (r**i - ro**i))
        ay.push(_y * (r**i - ro**i))
    }

    return [ax, ay]
}

function getTangencialDistortion(x, y, numParams, xo = 0, yo = 0) {

    assert(numParams >= 2 && numParams <=3, 'Número de parámatros erróneo (Válido entre 2 y 6). Valor pasado:' + numParams)

    const [_x, _y] = [x - xo, y - yo]
    const [r, ro] = [math.sqrt(x**2 + y**2), math.sqrt(xo**2 + yo**2)]

    const ax = []
        , ay = []

    if(numParams == 2) {
        ax.push(r**2 + (2 * _x**2), 2 * _x * _y)
        ay.push(2 * _x * _y, r**2 + (2 * _y**2))
    } else {
        console.warn('Not implemented Tangencial distortion with 3 parameters, 2 parameters selected')
        return getTangencialDistortion(xo, yo, x, y, 2)
    }

    return [ax, ay]
}

function zip(a, b) {
    return a.map((a1, i) => [a1, b[i]])
}