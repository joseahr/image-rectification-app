import math from 'mathjs'

export default function leastSquares(arrayA, K, arrayP) {
    const A = math.matrix(arrayA)
    const aSize = A.size()

    console.log('MMCC', arrayA, K, arrayP)

    if(!arrayP) {
        const [cols, ] = aSize
        const size = [cols, cols]
        arrayP = math.eye(size)
    }

    const AT = math.transpose(A)
    const ATAinv = math.inv(math.multiply(math.multiply(AT, arrayP), A))
    const ATK = math.multiply(math.multiply(AT, arrayP), math.transpose(K))
    // A.T * K *(A.T * A)-1
    const X = math.multiply(ATK, ATAinv)
    // R = AX - K
    const R = math.subtract(math.multiply(A, X), K)
    // sum = Sumatorio de los elementos Transpose(R) * R
    const sumSquareErrors = math.sum(math.multiply(math.transpose(R), R))

    // console.log(sumSquareErrors, 'SquareErrors')

    const [m, n] = aSize

    const est = math.sqrt(sumSquareErrors / (m - n))

    return { X, R, est }
    
}