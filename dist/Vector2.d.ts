/**
 * Defines a two-dimensional vector.
 */
export declare class Vector2 {
    private _x;
    private _y;
    /**
     * Constructs and initializes a two-dimensional vector from the
     * specified xy-coordinates.
     *
     * @param x The x-coordinate of the two-dimensional vector.
     * @param y The y-coordinate of the two-dimensional vector.
     */
    constructor(x: number, y: number);
    /**
     * Returns the string representation of this vector.
     *
     * @returns The string representation of this vector.
     */
    toString(): string;
    /**
     * Returns the x-coordinate of this two-dimensional vector.
     *
     * @returns The x-coordinate of the two-dimensional vector.
     */
    x(): number;
    /**
     * Returns the y-coordinate of this two-dimensional vector.
     *
     * @returns The y-coordinate of the two-dimensional vector.
     */
    y(): number;
    /**
     * Computes the dot product of the two specified
     * two-dimensional vectors.
     *
     * @param vector1 The first two-dimensional vector.
     * @param vector2 The second two-dimensional vector.
     * @returns The dot product of the two specified two-dimensional vectors.
     */
    static dot(vector1: Vector2, vector2: Vector2): number;
    /**
     * Computes the scalar multiplication of the specified
     * two-dimensional vector with the specified scalar value.
     *
     * @param scalar The scalar value.
     * @param vector The two-dimensional vector.
     * @returns The scalar multiplication of the specified two-dimensional vector with the specified scalar value.
     */
    static multiply(scalar: number, vector: Vector2): Vector2;
    /**
     * Computes the scalar multiplication of the specified
     * two-dimensional vector with the specified scalar value.
     *
     * @param vector The two-dimensional vector.
     * @param scalar The scalar value.
     * @returns The scalar multiplication of the specified two-dimensional vector with the specified scalar value.
     */
    multiply(scalar: number): Vector2;
    /**
     * Computes the scalar division of the specified
     * two-dimensional vector with the specified scalar value.
     *
     * @param vector The two-dimensional vector.
     * @param scalar The scalar value.
     * @returns The scalar division of the specified two-dimensional vector with the specified scalar value.
     */
    divide(scalar: number): Vector2;
    /**
     * Computes the vector sum of the two specified two-dimensional
     * vectors.
     *
     * @param vector1 The first two-dimensional vector.
     * @param vector2 The second two-dimensional vector.
     * @returns The vector sum of the two specified two-dimensional vectors.
     */
    static add(vector1: Vector2, vector2: Vector2): Vector2;
    /**
     * Computes the vector difference of the two specified
     * two-dimensional vectors
     *
     * @param vector1 The first two-dimensional vector.
     * @param vector2 The second two-dimensional vector.
     * @returns The vector difference of the two specified two-dimensional vectors.
     */
    static subtract(vector1: Vector2, vector2: Vector2): Vector2;
    /**
     * Computes the negation of the specified two-dimensional
     * vector.
     *
     * @param vector The two-dimensional vector.
     * @returns The negation of the specified two-dimensional vector.
     */
    static negate(vector: Vector2): Vector2;
    /**
     * Vector addition
     */
    add(other: Vector2): Vector2;
    /**
     * Vector subtraction
     */
    subtract(other: Vector2): Vector2;
    /**
     * Vector negation
     */
    negate(): Vector2;
    /**
     * Computes the length of this vector.
     */
    length(): number;
    /**
     * Computes the squared length of this vector.
     */
    lengthSq(): number;
    /**
     * Normalizes this vector.
     */
    normalize(): Vector2;
    /**
     * Dot product
     */
    dot(other: Vector2): number;
    static operatorMultiply(vector1: Vector2, vector2: Vector2): number;
    static operatorMultiplyScalar(scalar: number, vector: Vector2): Vector2;
    static operatorMultiplyVector(vector: Vector2, scalar: number): Vector2;
    static operatorDivide(vector: Vector2, scalar: number): Vector2;
    static operatorAdd(vector1: Vector2, vector2: Vector2): Vector2;
    static operatorSubtract(vector1: Vector2, vector2: Vector2): Vector2;
    static operatorNegate(vector: Vector2): Vector2;
    /**
     * Computes the length of the specified vector.
     */
    static getLength(vector: Vector2): number;
    /**
     * Computes the squared length of the specified vector.
     */
    static lengthSq(vector: Vector2): number;
    /**
     * Normalizes the specified vector.
     */
    static normalize(vector: Vector2): Vector2;
}
//# sourceMappingURL=Vector2.d.ts.map