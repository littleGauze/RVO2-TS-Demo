/*
 * RVOMath.ts
 * RVO2 Library TypeScript
 *
 * SPDX-FileCopyrightText: 2008 University of North Carolina at Chapel Hill
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Please send all bug reports to <geom@cs.unc.edu>.
 *
 * The authors may be contacted via:
 *
 * Jur van den Berg, Stephen J. Guy, Jamie Snape, Ming C. Lin, Dinesh Manocha
 * Dept. of Computer Science
 * 201 S. Columbia St.
 * Frederick P. Brooks, Jr. Computer Science Bldg.
 * Chapel Hill, N.C. 27599-3175
 * United States of America
 *
 * <http://gamma.cs.unc.edu/RVO2/>
 */
/**
 * Contains functions and constants used in multiple classes.
 */
export class RVOMath {
    /**
     * Computes the length of a specified two-dimensional vector.
     *
     * @param vector The two-dimensional vector whose length is to be computed.
     * @returns The length of the two-dimensional vector.
     */
    static abs(vector) {
        return this.sqrt(this.absSq(vector));
    }
    /**
     * Computes the squared length of a specified two-dimensional
     * vector.
     *
     * @param vector The two-dimensional vector whose squared length is to be computed.
     * @returns The squared length of the two-dimensional vector.
     */
    static absSq(vector) {
        return vector.dot(vector);
    }
    /**
     * Computes the normalization of the specified two-dimensional
     * vector.
     *
     * @param vector The two-dimensional vector whose normalization is to be computed.
     * @returns The normalization of the two-dimensional vector.
     */
    static normalize(vector) {
        return vector.divide(this.abs(vector));
    }
    /**
     * Computes the determinant of a two-dimensional square matrix
     * with rows consisting of the specified two-dimensional vectors.
     *
     * @param vector1 The top row of the two-dimensional square matrix.
     * @param vector2 The bottom row of the two-dimensional square matrix.
     * @returns The determinant of the two-dimensional square matrix.
     */
    static det(vector1, vector2) {
        return vector1.x() * vector2.y() - vector1.y() * vector2.x();
    }
    /**
     * Computes the squared distance from a line segment with the
     * specified endpoints to a specified point.
     *
     * @param vector1 The first endpoint of the line segment.
     * @param vector2 The second endpoint of the line segment.
     * @param vector3 The point to which the squared distance is to be calculated.
     * @returns The squared distance from the line segment to the point.
     */
    static distSqPointLineSegment(vector1, vector2, vector3) {
        const r = ((vector3.subtract(vector1)).dot(vector2.subtract(vector1))) / this.absSq(vector2.subtract(vector1));
        if (r < 0.0) {
            return this.absSq(vector3.subtract(vector1));
        }
        if (r > 1.0) {
            return this.absSq(vector3.subtract(vector2));
        }
        return this.absSq(vector3.subtract(vector1.add((vector2.subtract(vector1)).multiply(r))));
    }
    /**
     * Computes the absolute value of a float.
     *
     * @param scalar The float of which to compute the absolute value.
     * @returns The absolute value of the float.
     */
    static fabs(scalar) {
        return Math.abs(scalar);
    }
    /**
     * Computes the signed distance from a line connecting the
     * specified points to a specified point.
     *
     * @param a The first point on the line.
     * @param b The second point on the line.
     * @param c The point to which the signed distance is to be calculated.
     * @returns Positive when the point c lies to the left of the line ab.
     */
    static leftOf(a, b, c) {
        return this.det(a.subtract(c), b.subtract(a));
    }
    /**
     * Computes the square of a float.
     *
     * @param scalar The float to be squared.
     * @returns The square of the float.
     */
    static sqr(scalar) {
        return scalar * scalar;
    }
    /**
     * Computes the square root of a float.
     *
     * @param scalar The float of which to compute the square root.
     * @returns The square root of the float.
     */
    static sqrt(scalar) {
        return Math.sqrt(scalar);
    }
}
/**
 * A sufficiently small positive number.
 */
RVOMath.RVO_EPSILON = 0.00001;
//# sourceMappingURL=RVOMath.js.map