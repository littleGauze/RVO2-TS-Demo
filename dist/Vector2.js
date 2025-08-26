/*
 * Vector2.ts
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
 * Defines a two-dimensional vector.
 */
export class Vector2 {
    /**
     * Constructs and initializes a two-dimensional vector from the
     * specified xy-coordinates.
     *
     * @param x The x-coordinate of the two-dimensional vector.
     * @param y The y-coordinate of the two-dimensional vector.
     */
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    /**
     * Returns the string representation of this vector.
     *
     * @returns The string representation of this vector.
     */
    toString() {
        return `(${this._x},${this._y})`;
    }
    /**
     * Returns the x-coordinate of this two-dimensional vector.
     *
     * @returns The x-coordinate of the two-dimensional vector.
     */
    x() {
        return this._x;
    }
    /**
     * Returns the y-coordinate of this two-dimensional vector.
     *
     * @returns The y-coordinate of the two-dimensional vector.
     */
    y() {
        return this._y;
    }
    /**
     * Computes the dot product of the two specified
     * two-dimensional vectors.
     *
     * @param vector1 The first two-dimensional vector.
     * @param vector2 The second two-dimensional vector.
     * @returns The dot product of the two specified two-dimensional vectors.
     */
    static dot(vector1, vector2) {
        return vector1._x * vector2._x + vector1._y * vector2._y;
    }
    /**
     * Computes the scalar multiplication of the specified
     * two-dimensional vector with the specified scalar value.
     *
     * @param scalar The scalar value.
     * @param vector The two-dimensional vector.
     * @returns The scalar multiplication of the specified two-dimensional vector with the specified scalar value.
     */
    static multiply(scalar, vector) {
        return vector.multiply(scalar);
    }
    /**
     * Computes the scalar multiplication of the specified
     * two-dimensional vector with the specified scalar value.
     *
     * @param vector The two-dimensional vector.
     * @param scalar The scalar value.
     * @returns The scalar multiplication of the specified two-dimensional vector with the specified scalar value.
     */
    multiply(scalar) {
        return new Vector2(this._x * scalar, this._y * scalar);
    }
    /**
     * Computes the scalar division of the specified
     * two-dimensional vector with the specified scalar value.
     *
     * @param vector The two-dimensional vector.
     * @param scalar The scalar value.
     * @returns The scalar division of the specified two-dimensional vector with the specified scalar value.
     */
    divide(scalar) {
        return new Vector2(this._x / scalar, this._y / scalar);
    }
    /**
     * Computes the vector sum of the two specified two-dimensional
     * vectors.
     *
     * @param vector1 The first two-dimensional vector.
     * @param vector2 The second two-dimensional vector.
     * @returns The vector sum of the two specified two-dimensional vectors.
     */
    static add(vector1, vector2) {
        return new Vector2(vector1._x + vector2._x, vector1._y + vector2._y);
    }
    /**
     * Computes the vector difference of the two specified
     * two-dimensional vectors
     *
     * @param vector1 The first two-dimensional vector.
     * @param vector2 The second two-dimensional vector.
     * @returns The vector difference of the two specified two-dimensional vectors.
     */
    static subtract(vector1, vector2) {
        return new Vector2(vector1._x - vector2._x, vector1._y - vector2._y);
    }
    /**
     * Computes the negation of the specified two-dimensional
     * vector.
     *
     * @param vector The two-dimensional vector.
     * @returns The negation of the specified two-dimensional vector.
     */
    static negate(vector) {
        return new Vector2(-vector._x, -vector._y);
    }
    // Operator overloading equivalents
    /**
     * Vector addition
     */
    add(other) {
        return Vector2.add(this, other);
    }
    /**
     * Vector subtraction
     */
    subtract(other) {
        return Vector2.subtract(this, other);
    }
    /**
     * Vector negation
     */
    negate() {
        return Vector2.negate(this);
    }
    /**
     * Computes the length of this vector.
     */
    length() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }
    /**
     * Computes the squared length of this vector.
     */
    lengthSq() {
        return this._x * this._x + this._y * this._y;
    }
    /**
     * Normalizes this vector.
     */
    normalize() {
        const len = this.length();
        if (len > 0) {
            return this.divide(len);
        }
        return new Vector2(0, 0);
    }
    /**
     * Dot product
     */
    dot(other) {
        return Vector2.dot(this, other);
    }
    // For compatibility with C# code
    static operatorMultiply(vector1, vector2) {
        return Vector2.dot(vector1, vector2);
    }
    static operatorMultiplyScalar(scalar, vector) {
        return Vector2.multiply(scalar, vector);
    }
    static operatorMultiplyVector(vector, scalar) {
        return vector.multiply(scalar);
    }
    static operatorDivide(vector, scalar) {
        return vector.divide(scalar);
    }
    static operatorAdd(vector1, vector2) {
        return Vector2.add(vector1, vector2);
    }
    static operatorSubtract(vector1, vector2) {
        return Vector2.subtract(vector1, vector2);
    }
    static operatorNegate(vector) {
        return Vector2.negate(vector);
    }
    /**
     * Computes the length of the specified vector.
     */
    static getLength(vector) {
        return vector.length();
    }
    /**
     * Computes the squared length of the specified vector.
     */
    static lengthSq(vector) {
        return vector.lengthSq();
    }
    /**
     * Normalizes the specified vector.
     */
    static normalize(vector) {
        return vector.normalize();
    }
}
//# sourceMappingURL=Vector2.js.map