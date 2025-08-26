/*
 * Agent.ts
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
import { Vector2 } from './Vector2.js';
import { Line } from './Line.js';
import { RVOMath } from './RVOMath.js';
import { Simulator } from './Simulator.js';
/**
 * Defines an agent in the simulation.
 */
export class Agent {
    constructor() {
        this.agentNeighbors = [];
        this.obstacleNeighbors = [];
        this.orcaLines = [];
        this.position = new Vector2(0, 0);
        this.prefVelocity = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.id = 0;
        this.maxNeighbors = 0;
        this.maxSpeed = 0.0;
        this.neighborDist = 0.0;
        this.radius = 0.0;
        this.timeHorizon = 0.0;
        this.timeHorizonObst = 0.0;
        this.newVelocity = new Vector2(0, 0);
    }
    /**
     * Computes the neighbors of this agent.
     */
    computeNeighbors() {
        this.obstacleNeighbors.length = 0;
        let rangeSq = RVOMath.sqr(this.timeHorizonObst * this.maxSpeed + this.radius);
        Simulator.Instance.kdTree.computeObstacleNeighbors(this, rangeSq);
        this.agentNeighbors.length = 0;
        if (this.maxNeighbors > 0) {
            rangeSq = RVOMath.sqr(this.neighborDist);
            Simulator.Instance.kdTree.computeAgentNeighbors(this, { value: rangeSq });
        }
    }
    /**
     * Computes the new velocity of this agent.
     */
    computeNewVelocity() {
        // 清空ORCA线
        this.orcaLines.length = 0;
        const invTimeHorizonObst = 1.0 / this.timeHorizonObst;
        // 处理障碍物ORCA线
        for (let i = 0; i < this.obstacleNeighbors.length; ++i) {
            const obstacle1 = this.obstacleNeighbors[i].value;
            const obstacle2 = obstacle1.next;
            const relativePosition1 = obstacle1.point.subtract(this.position);
            const relativePosition2 = obstacle2.point.subtract(this.position);
            // 检查是否已经被覆盖
            let alreadyCovered = false;
            for (let j = 0; j < this.orcaLines.length; ++j) {
                const line = this.orcaLines[j];
                const det1 = RVOMath.det(relativePosition1.multiply(invTimeHorizonObst).subtract(line.point), line.direction);
                const det2 = RVOMath.det(relativePosition2.multiply(invTimeHorizonObst).subtract(line.point), line.direction);
                if (det1 - invTimeHorizonObst * this.radius >= -RVOMath.RVO_EPSILON &&
                    det2 - invTimeHorizonObst * this.radius >= -RVOMath.RVO_EPSILON) {
                    alreadyCovered = true;
                    break;
                }
            }
            if (alreadyCovered)
                continue;
            // 计算距离
            const distSq1 = RVOMath.absSq(relativePosition1);
            const distSq2 = RVOMath.absSq(relativePosition2);
            const radiusSq = RVOMath.sqr(this.radius);
            const obstacleVector = obstacle2.point.subtract(obstacle1.point);
            const s = (-relativePosition1.dot(obstacleVector)) / RVOMath.absSq(obstacleVector);
            const distSqLine = RVOMath.absSq(relativePosition1.negate().subtract(obstacleVector.multiply(s)));
            // 处理碰撞情况
            if (s < 0.0 && distSq1 <= radiusSq) {
                if (obstacle1.convex) {
                    const line = new Line();
                    line.point = new Vector2(0.0, 0.0);
                    line.direction = RVOMath.normalize(new Vector2(-relativePosition1.y(), relativePosition1.x()));
                    this.orcaLines.push(line);
                }
                continue;
            }
            else if (s > 1.0 && distSq2 <= radiusSq) {
                if (obstacle2.convex) {
                    const line = new Line();
                    line.point = new Vector2(0.0, 0.0);
                    line.direction = RVOMath.normalize(new Vector2(-relativePosition2.y(), relativePosition2.x()));
                    this.orcaLines.push(line);
                }
                continue;
            }
            else if (s >= 0.0 && s <= 1.0 && distSqLine <= radiusSq) {
                const line = new Line();
                line.point = new Vector2(0.0, 0.0);
                line.direction = obstacle1.direction.negate();
                this.orcaLines.push(line);
                continue;
            }
            // 计算腿部方向
            let leftLegDirection, rightLegDirection;
            if (s < 0.0 && distSqLine <= radiusSq) {
                if (!obstacle1.convex)
                    continue;
                const leg1 = RVOMath.sqrt(distSq1 - radiusSq);
                leftLegDirection = new Vector2(relativePosition1.x() * leg1 - relativePosition1.y() * this.radius, relativePosition1.x() * this.radius + relativePosition1.y() * leg1).divide(distSq1);
                rightLegDirection = new Vector2(relativePosition1.x() * leg1 + relativePosition1.y() * this.radius, -relativePosition1.x() * this.radius + relativePosition1.y() * leg1).divide(distSq1);
            }
            else if (s > 1.0 && distSqLine <= radiusSq) {
                if (!obstacle2.convex)
                    continue;
                const leg2 = RVOMath.sqrt(distSq2 - radiusSq);
                leftLegDirection = new Vector2(relativePosition2.x() * leg2 - relativePosition2.y() * this.radius, relativePosition2.x() * this.radius + relativePosition2.y() * leg2).divide(distSq2);
                rightLegDirection = new Vector2(relativePosition2.x() * leg2 + relativePosition2.y() * this.radius, -relativePosition2.x() * this.radius + relativePosition2.y() * leg2).divide(distSq2);
            }
            else {
                if (obstacle1.convex) {
                    const leg1 = RVOMath.sqrt(distSq1 - radiusSq);
                    leftLegDirection = new Vector2(relativePosition1.x() * leg1 - relativePosition1.y() * this.radius, relativePosition1.x() * this.radius + relativePosition1.y() * leg1).divide(distSq1);
                }
                else {
                    leftLegDirection = obstacle1.direction.negate();
                }
                if (obstacle2.convex) {
                    const leg2 = RVOMath.sqrt(distSq2 - radiusSq);
                    rightLegDirection = new Vector2(relativePosition2.x() * leg2 + relativePosition2.y() * this.radius, -relativePosition2.x() * this.radius + relativePosition2.y() * leg2).divide(distSq2);
                }
                else {
                    rightLegDirection = obstacle1.direction;
                }
            }
            // 处理腿部方向冲突
            const leftNeighbor = obstacle1.previous;
            let isLeftLegForeign = false;
            let isRightLegForeign = false;
            if (obstacle1.convex && RVOMath.det(leftLegDirection, leftNeighbor.direction.negate()) >= 0.0) {
                leftLegDirection = leftNeighbor.direction.negate();
                isLeftLegForeign = true;
            }
            if (obstacle2.convex && RVOMath.det(rightLegDirection, obstacle2.direction) <= 0.0) {
                rightLegDirection = obstacle2.direction;
                isRightLegForeign = true;
            }
            // 计算截断中心
            const leftCutOff = relativePosition1.multiply(invTimeHorizonObst);
            const rightCutOff = relativePosition2.multiply(invTimeHorizonObst);
            const cutOffVector = rightCutOff.subtract(leftCutOff);
            // 投影当前速度
            const t = obstacle1 === obstacle2 ? 0.5 :
                ((this.velocity.subtract(leftCutOff)).dot(cutOffVector)) / RVOMath.absSq(cutOffVector);
            const tLeft = (this.velocity.subtract(leftCutOff)).dot(leftLegDirection);
            const tRight = (this.velocity.subtract(rightCutOff)).dot(rightLegDirection);
            if ((t < 0.0 && tLeft < 0.0) || (obstacle1 === obstacle2 && tLeft < 0.0 && tRight < 0.0)) {
                const unitW = RVOMath.normalize(this.velocity.subtract(leftCutOff));
                const line = new Line();
                line.direction = new Vector2(unitW.y(), -unitW.x());
                line.point = leftCutOff.add(unitW.multiply(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);
                continue;
            }
            else if (t > 1.0 && tRight < 0.0) {
                const unitW = RVOMath.normalize(this.velocity.subtract(rightCutOff));
                const line = new Line();
                line.direction = new Vector2(unitW.y(), -unitW.x());
                line.point = rightCutOff.add(unitW.multiply(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);
                continue;
            }
            // 计算到腿部的距离
            const distSqCutoff = (t < 0.0 || t > 1.0 || obstacle1 === obstacle2) ?
                Number.POSITIVE_INFINITY :
                RVOMath.absSq(this.velocity.subtract(leftCutOff.add(cutOffVector.multiply(t))));
            const distSqLeft = tLeft < 0.0 ? Number.POSITIVE_INFINITY :
                RVOMath.absSq(this.velocity.subtract(leftCutOff.add(leftLegDirection.multiply(tLeft))));
            const distSqRight = tRight < 0.0 ? Number.POSITIVE_INFINITY :
                RVOMath.absSq(this.velocity.subtract(rightCutOff.add(rightLegDirection.multiply(tRight))));
            if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
                const line = new Line();
                line.direction = obstacle1.direction.negate();
                line.point = leftCutOff.add(new Vector2(-line.direction.y(), line.direction.x()).multiply(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);
                continue;
            }
            if (distSqLeft <= distSqRight) {
                if (isLeftLegForeign)
                    continue;
                const line = new Line();
                line.direction = leftLegDirection;
                line.point = leftCutOff.add(new Vector2(-line.direction.y(), line.direction.x()).multiply(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);
                continue;
            }
            if (isRightLegForeign)
                continue;
            const line = new Line();
            line.direction = rightLegDirection.negate();
            line.point = rightCutOff.add(new Vector2(-line.direction.y(), line.direction.x()).multiply(this.radius * invTimeHorizonObst));
            this.orcaLines.push(line);
        }
        const invTimeHorizon = 1.0 / this.timeHorizon;
        // 处理智能体ORCA线
        for (let i = 0; i < this.agentNeighbors.length; ++i) {
            const other = this.agentNeighbors[i].value;
            const relativePosition = other.position.subtract(this.position);
            const relativeVelocity = this.velocity.subtract(other.velocity);
            const distSq = RVOMath.absSq(relativePosition);
            const combinedRadius = this.radius + other.radius;
            const combinedRadiusSq = RVOMath.sqr(combinedRadius);
            let line;
            let u;
            if (distSq > combinedRadiusSq) {
                const w = relativeVelocity.subtract(relativePosition.multiply(invTimeHorizon));
                const wLengthSq = RVOMath.absSq(w);
                const dotProduct1 = w.dot(relativePosition);
                if (dotProduct1 < 0.0 && RVOMath.sqr(dotProduct1) > combinedRadiusSq * wLengthSq) {
                    const wLength = RVOMath.sqrt(wLengthSq);
                    const unitW = w.divide(wLength);
                    line = new Line();
                    line.direction = new Vector2(unitW.y(), -unitW.x());
                    u = unitW.multiply(combinedRadius * invTimeHorizon - wLength);
                }
                else {
                    const leg = RVOMath.sqrt(distSq - combinedRadiusSq);
                    if (RVOMath.det(relativePosition, w) > 0.0) {
                        line = new Line();
                        line.direction = new Vector2(relativePosition.x() * leg - relativePosition.y() * combinedRadius, relativePosition.x() * combinedRadius + relativePosition.y() * leg).divide(distSq);
                    }
                    else {
                        line = new Line();
                        line.direction = new Vector2(relativePosition.x() * leg + relativePosition.y() * combinedRadius, -relativePosition.x() * combinedRadius + relativePosition.y() * leg).divide(distSq).negate();
                    }
                    const dotProduct2 = relativeVelocity.dot(line.direction);
                    u = line.direction.multiply(dotProduct2).subtract(relativeVelocity);
                }
            }
            else {
                const invTimeStep = 1.0 / Simulator.Instance.getTimeStep();
                const w = relativeVelocity.subtract(relativePosition.multiply(invTimeStep));
                const wLength = RVOMath.abs(w);
                const unitW = w.divide(wLength);
                line = new Line();
                line.direction = new Vector2(unitW.y(), -unitW.x());
                u = unitW.multiply(combinedRadius * invTimeStep - wLength);
            }
            line.point = this.velocity.add(u.multiply(0.5));
            this.orcaLines.push(line);
        }
        // 使用线性规划求解最优速度
        const numObstLines = this.orcaLines.length;
        let lineFail = this.linearProgram2(this.orcaLines, this.maxSpeed, this.prefVelocity, false);
        if (lineFail < this.orcaLines.length) {
            this.linearProgram3(this.orcaLines, numObstLines, lineFail, this.maxSpeed);
        }
    }
    /**
     * Solves a one-dimensional linear program on a specified line
     * subject to linear constraints defined by lines and a circular
     * constraint.
     *
     * @param lines Lines defining the linear constraints.
     * @param lineNo The specified line constraint.
     * @param radius The radius of the circular constraint.
     * @param optVelocity The optimization velocity.
     * @param directionOpt True if the direction should be optimized.
     * @param result A reference to the result of the linear program.
     * @returns True if successful.
     */
    linearProgram1(lines, lineNo, radius, optVelocity, directionOpt, result) {
        const dotProduct = lines[lineNo].point.dot(lines[lineNo].direction);
        const discriminant = RVOMath.sqr(dotProduct) + RVOMath.sqr(radius) - RVOMath.absSq(lines[lineNo].point);
        if (discriminant < 0.0) {
            /* Max speed circle fully invalidates line lineNo. */
            return false;
        }
        const sqrtDiscriminant = RVOMath.sqrt(discriminant);
        let tLeft = -dotProduct - sqrtDiscriminant;
        let tRight = -dotProduct + sqrtDiscriminant;
        for (let i = 0; i < lineNo; ++i) {
            const denominator = RVOMath.det(lines[lineNo].direction, lines[i].direction);
            const numerator = RVOMath.det(lines[i].direction, lines[lineNo].point.subtract(lines[i].point));
            if (Math.abs(denominator) <= RVOMath.RVO_EPSILON) {
                /* Lines lineNo and i are (almost) parallel. */
                if (numerator < 0.0) {
                    return false;
                }
                continue;
            }
            const t = numerator / denominator;
            if (denominator >= 0.0) {
                /* Line i bounds line lineNo on the right. */
                tRight = Math.min(tRight, t);
            }
            else {
                /* Line i bounds line lineNo on the left. */
                tLeft = Math.max(tLeft, t);
            }
            if (tLeft > tRight) {
                return false;
            }
        }
        if (directionOpt) {
            /* Optimize direction. */
            if (optVelocity.dot(lines[lineNo].direction) > 0.0) {
                /* Take right extreme. */
                result.value = lines[lineNo].point.add(lines[lineNo].direction.multiply(tRight));
            }
            else {
                /* Take left extreme. */
                result.value = lines[lineNo].point.add(lines[lineNo].direction.multiply(tLeft));
            }
        }
        else {
            /* Optimize closest point. */
            const t = lines[lineNo].direction.dot(optVelocity.subtract(lines[lineNo].point));
            if (t < tLeft) {
                result.value = lines[lineNo].point.add(lines[lineNo].direction.multiply(tLeft));
            }
            else if (t > tRight) {
                result.value = lines[lineNo].point.add(lines[lineNo].direction.multiply(tRight));
            }
            else {
                result.value = lines[lineNo].point.add(lines[lineNo].direction.multiply(t));
            }
        }
        return true;
    }
    /**
     * Solves a two-dimensional linear program subject to linear
     * constraints defined by lines and a circular constraint.
     *
     * @param lines Lines defining the linear constraints.
     * @param radius The radius of the circular constraint.
     * @param optVelocity The optimization velocity.
     * @param directionOpt True if the direction should be optimized.
     * @returns The number of the line it fails on, and the number of lines if successful.
     */
    linearProgram2(lines, radius, optVelocity, directionOpt) {
        if (directionOpt) {
            /*
             * Optimize direction. Note that the optimization velocity is of
             * unit length in this case.
             */
            this.newVelocity = optVelocity.multiply(radius);
        }
        else if (RVOMath.absSq(optVelocity) > RVOMath.sqr(radius)) {
            /* Optimize closest point and outside circle. */
            this.newVelocity = RVOMath.normalize(optVelocity).multiply(radius);
        }
        else {
            /* Optimize closest point and inside circle. */
            this.newVelocity = optVelocity;
        }
        for (let i = 0; i < lines.length; ++i) {
            if (RVOMath.det(lines[i].direction, lines[i].point.subtract(this.newVelocity)) > 0.0) {
                /* Result does not satisfy constraint i. Compute new optimal result. */
                const tempResult = this.newVelocity;
                const result = { value: this.newVelocity };
                if (!this.linearProgram1(lines, i, radius, optVelocity, directionOpt, result)) {
                    this.newVelocity = tempResult;
                    return i;
                }
                this.newVelocity = result.value;
            }
        }
        return lines.length;
    }
    /**
     * Solves a two-dimensional linear program subject to linear
     * constraints defined by lines and a circular constraint.
     *
     * @param lines Lines defining the linear constraints.
     * @param numObstLines Count of obstacle lines.
     * @param beginLine The line on which the 2-d linear program failed.
     * @param radius The radius of the circular constraint.
     */
    linearProgram3(lines, numObstLines, beginLine, radius) {
        let distance = 0.0;
        for (let i = beginLine; i < lines.length; ++i) {
            if (RVOMath.det(lines[i].direction, lines[i].point.subtract(this.newVelocity)) > distance) {
                /* Result does not satisfy constraint of line i. */
                const projLines = [];
                for (let ii = 0; ii < numObstLines; ++ii) {
                    projLines.push(lines[ii]);
                }
                for (let j = numObstLines; j < i; ++j) {
                    let line;
                    const determinant = RVOMath.det(lines[i].direction, lines[j].direction);
                    if (Math.abs(determinant) <= RVOMath.RVO_EPSILON) {
                        /* Line i and line j are parallel. */
                        if (lines[i].direction.dot(lines[j].direction) > 0.0) {
                            /* Line i and line j point in the same direction. */
                            continue;
                        }
                        else {
                            /* Line i and line j point in opposite direction. */
                            line = new Line();
                            line.point = lines[i].point.add(lines[j].point).multiply(0.5);
                        }
                    }
                    else {
                        line = new Line();
                        line.point = lines[i].point.add(lines[i].direction.multiply(RVOMath.det(lines[j].direction, lines[i].point.subtract(lines[j].point)) / determinant));
                    }
                    line.direction = RVOMath.normalize(lines[j].direction.subtract(lines[i].direction));
                    projLines.push(line);
                }
                const tempResult = this.newVelocity;
                const result = { value: this.newVelocity };
                if (this.linearProgram2(projLines, radius, new Vector2(-lines[i].direction.y(), lines[i].direction.x()), true) < projLines.length) {
                    /*
                     * This should in principle not happen. The result is by
                     * definition already in the feasible region of this
                     * linear program. If it fails, it is due to small
                     * floating point error, and the current result is kept.
                     */
                    this.newVelocity = tempResult;
                }
                else {
                    this.newVelocity = result.value;
                }
                distance = RVOMath.det(lines[i].direction, lines[i].point.subtract(this.newVelocity));
            }
        }
    }
    /**
     * Updates the two-dimensional position and two-dimensional
     * velocity of this agent.
     */
    update() {
        this.velocity = this.newVelocity;
        this.position = this.position.add(this.velocity.multiply(Simulator.Instance.getTimeStep()));
    }
    /**
     * Inserts an agent neighbor into the set of neighbors of this
     * agent.
     *
     * @param agent A pointer to the agent to be inserted.
     * @param rangeSq The squared range around this agent.
     */
    insertAgentNeighbor(agent, rangeSq) {
        if (this !== agent) {
            const distSq = RVOMath.absSq(this.position.subtract(agent.position));
            if (distSq < rangeSq.value) {
                if (this.agentNeighbors.length < this.maxNeighbors) {
                    this.agentNeighbors.push({ key: distSq, value: agent });
                }
                let i = this.agentNeighbors.length - 1;
                while (i !== 0 && distSq < this.agentNeighbors[i - 1].key) {
                    this.agentNeighbors[i] = this.agentNeighbors[i - 1];
                    --i;
                }
                this.agentNeighbors[i] = { key: distSq, value: agent };
                if (this.agentNeighbors.length === this.maxNeighbors) {
                    rangeSq.value = this.agentNeighbors[this.agentNeighbors.length - 1].key;
                }
            }
        }
    }
    /**
     * Inserts a static obstacle neighbor into the set of neighbors
     * of this agent.
     *
     * @param obstacle The number of the static obstacle to be inserted.
     * @param rangeSq The squared range around this agent.
     */
    insertObstacleNeighbor(obstacle, rangeSq) {
        const nextObstacle = obstacle.next;
        const distSq = RVOMath.distSqPointLineSegment(obstacle.point, nextObstacle.point, this.position);
        if (distSq < rangeSq) {
            this.obstacleNeighbors.push({ key: distSq, value: obstacle });
            let i = this.obstacleNeighbors.length - 1;
            while (i !== 0 && distSq < this.obstacleNeighbors[i - 1].key) {
                this.obstacleNeighbors[i] = this.obstacleNeighbors[i - 1];
                --i;
            }
            this.obstacleNeighbors[i] = { key: distSq, value: obstacle };
        }
    }
}
//# sourceMappingURL=Agent.js.map