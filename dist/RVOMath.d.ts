import { Vector2 } from './Vector2';
/**
 * Contains functions and constants used in multiple classes.
 */
export declare class RVOMath {
    /**
     * A sufficiently small positive number.
     */
    static readonly RVO_EPSILON: number;
    /**
     * Computes the length of a specified two-dimensional vector.
     *
     * @param vector The two-dimensional vector whose length is to be computed.
     * @returns The length of the two-dimensional vector.
     */
    static abs(vector: Vector2): number;
    /**
     * Computes the squared length of a specified two-dimensional
     * vector.
     *
     * @param vector The two-dimensional vector whose squared length is to be computed.
     * @returns The squared length of the two-dimensional vector.
     */
    static absSq(vector: Vector2): number;
    /**
     * Computes the normalization of the specified two-dimensional
     * vector.
     *
     * @param vector The two-dimensional vector whose normalization is to be computed.
     * @returns The normalization of the two-dimensional vector.
     */
    static normalize(vector: Vector2): Vector2;
    /**
     * Computes the determinant of a two-dimensional square matrix
     * with rows consisting of the specified two-dimensional vectors.
     *
     * @param vector1 The top row of the two-dimensional square matrix.
     * @param vector2 The bottom row of the two-dimensional square matrix.
     * @returns The determinant of the two-dimensional square matrix.
     */
    static det(vector1: Vector2, vector2: Vector2): number;
    /**
     * Computes the squared distance from a line segment with the
     * specified endpoints to a specified point.
     *
     * @param vector1 The first endpoint of the line segment.
     * @param vector2 The second endpoint of the line segment.
     * @param vector3 The point to which the squared distance is to be calculated.
     * @returns The squared distance from the line segment to the point.
     */
    static distSqPointLineSegment(vector1: Vector2, vector2: Vector2, vector3: Vector2): number;
    /**
     * Computes the absolute value of a float.
     *
     * @param scalar The float of which to compute the absolute value.
     * @returns The absolute value of the float.
     */
    static fabs(scalar: number): number;
    /**
     * Computes the signed distance from a line connecting the
     * specified points to a specified point.
     *
     * @param a The first point on the line.
     * @param b The second point on the line.
     * @param c The point to which the signed distance is to be calculated.
     * @returns Positive when the point c lies to the left of the line ab.
     */
    static leftOf(a: Vector2, b: Vector2, c: Vector2): number;
    /**
     * Computes the square of a float.
     *
     * @param scalar The float to be squared.
     * @returns The square of the float.
     */
    static sqr(scalar: number): number;
    /**
     * Computes the square root of a float.
     *
     * @param scalar The float of which to compute the square root.
     * @returns The square root of the float.
     */
    static sqrt(scalar: number): number;
}
//# sourceMappingURL=RVOMath.d.ts.map