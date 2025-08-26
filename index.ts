/*
 * index.ts
 * RVO2 Library TypeScript - Main Export File
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

// Export all RVO2 classes
export { Vector2 } from './Vector2';
export { Line } from './Line';
export { RVOMath } from './RVOMath';
export { Obstacle } from './Obstacle';
export { Agent } from './Agent';
export { KdTree } from './KdTree';
export { Simulator } from './Simulator';

// Re-export commonly used classes for convenience
export { Simulator as RVO2Simulator } from './Simulator';
export { Vector2 as RVO2Vector2 } from './Vector2';
export { Agent as RVO2Agent } from './Agent';
