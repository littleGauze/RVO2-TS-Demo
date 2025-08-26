/*
 * KdTree.ts
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
import { Obstacle } from './Obstacle.js';
import { RVOMath } from './RVOMath.js';
import { Simulator } from './Simulator.js';
/**
 * Defines a node of an agent k-D tree.
 */
class AgentTreeNode {
    constructor() {
        this.begin = 0;
        this.end = 0;
        this.left = 0;
        this.right = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.minX = 0;
        this.minY = 0;
    }
}
/**
 * Defines a pair of scalar values.
 */
class FloatPair {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    static lessThan(pair1, pair2) {
        return pair1.a < pair2.a || !(pair2.a < pair1.a) && pair1.b < pair2.b;
    }
    static lessThanOrEqual(pair1, pair2) {
        return (pair1.a === pair2.a && pair1.b === pair2.b) || FloatPair.lessThan(pair1, pair2);
    }
    static greaterThan(pair1, pair2) {
        return !FloatPair.lessThanOrEqual(pair1, pair2);
    }
    static greaterThanOrEqual(pair1, pair2) {
        return !FloatPair.lessThan(pair1, pair2);
    }
}
/**
 * Defines a node of an obstacle k-D tree.
 */
class ObstacleTreeNode {
    constructor() {
        this.obstacle = null;
        this.left = null;
        this.right = null;
    }
}
/**
 * Defines k-D trees for agents and static obstacles in the simulation.
 */
export class KdTree {
    constructor() {
        this.agents = [];
        this.agentTree = [];
        this.obstacleTree = null;
    }
    buildAgentTree() {
        if (this.agents.length !== Simulator.Instance.getNumAgents()) {
            this.agents = new Array(Simulator.Instance.getNumAgents());
            for (let i = 0; i < this.agents.length; ++i) {
                this.agents[i] = Simulator.Instance.getAgent(i);
            }
            this.agentTree = new Array(2 * this.agents.length);
            for (let i = 0; i < this.agentTree.length; ++i) {
                this.agentTree[i] = new AgentTreeNode();
            }
        }
        if (this.agents.length !== 0) {
            this.buildAgentTreeRecursive(0, this.agents.length, 0);
        }
    }
    buildObstacleTree() {
        this.obstacleTree = new ObstacleTreeNode();
        const obstacles = new Array(Simulator.Instance.getNumObstacleVertices());
        for (let i = 0; i < Simulator.Instance.getNumObstacleVertices(); ++i) {
            obstacles[i] = Simulator.Instance.getObstacle(i);
        }
        this.obstacleTree = this.buildObstacleTreeRecursive(obstacles);
    }
    computeAgentNeighbors(agent, rangeSq) {
        this.queryAgentTreeRecursive(agent, rangeSq, 0);
    }
    computeObstacleNeighbors(agent, rangeSq) {
        this.queryObstacleTreeRecursive(agent, rangeSq, this.obstacleTree);
    }
    queryVisibility(q1, q2, radius) {
        return this.queryVisibilityRecursive(q1, q2, radius, this.obstacleTree);
    }
    buildAgentTreeRecursive(begin, end, node) {
        this.agentTree[node].begin = begin;
        this.agentTree[node].end = end;
        this.agentTree[node].minX = this.agentTree[node].maxX = this.agents[begin].position.x();
        this.agentTree[node].minY = this.agentTree[node].maxY = this.agents[begin].position.y();
        for (let i = begin + 1; i < end; ++i) {
            this.agentTree[node].maxX = Math.max(this.agentTree[node].maxX, this.agents[i].position.x());
            this.agentTree[node].minX = Math.min(this.agentTree[node].minX, this.agents[i].position.x());
            this.agentTree[node].maxY = Math.max(this.agentTree[node].maxY, this.agents[i].position.y());
            this.agentTree[node].minY = Math.min(this.agentTree[node].minY, this.agents[i].position.y());
        }
        if (end - begin > KdTree.MAX_LEAF_SIZE) {
            const isVertical = this.agentTree[node].maxX - this.agentTree[node].minX > this.agentTree[node].maxY - this.agentTree[node].minY;
            const splitValue = 0.5 * (isVertical ? this.agentTree[node].maxX + this.agentTree[node].minX : this.agentTree[node].maxY + this.agentTree[node].minY);
            let left = begin;
            let right = end;
            while (left < right) {
                while (left < right && (isVertical ? this.agents[left].position.x() : this.agents[left].position.y()) < splitValue) {
                    ++left;
                }
                while (right > left && (isVertical ? this.agents[right - 1].position.x() : this.agents[right - 1].position.y()) >= splitValue) {
                    --right;
                }
                if (left < right) {
                    const tempAgent = this.agents[left];
                    this.agents[left] = this.agents[right - 1];
                    this.agents[right - 1] = tempAgent;
                    ++left;
                    --right;
                }
            }
            let leftSize = left - begin;
            if (leftSize === 0) {
                leftSize = 1;
                ++left;
            }
            this.agentTree[node].left = node + 1;
            this.agentTree[node].right = node + 2 * leftSize;
            this.buildAgentTreeRecursive(begin, left, this.agentTree[node].left);
            this.buildAgentTreeRecursive(left, end, this.agentTree[node].right);
        }
    }
    buildObstacleTreeRecursive(obstacles) {
        if (obstacles.length === 0) {
            return null;
        }
        const node = new ObstacleTreeNode();
        let optimalSplit = 0;
        let minLeft = obstacles.length;
        let minRight = obstacles.length;
        for (let i = 0; i < obstacles.length; ++i) {
            let leftSize = 0;
            let rightSize = 0;
            const obstacleI1 = obstacles[i];
            const obstacleI2 = obstacleI1.next;
            for (let j = 0; j < obstacles.length; ++j) {
                if (i === j) {
                    continue;
                }
                const obstacleJ1 = obstacles[j];
                const obstacleJ2 = obstacleJ1.next;
                const j1LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ1.point);
                const j2LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ2.point);
                if (j1LeftOfI >= -RVOMath.RVO_EPSILON && j2LeftOfI >= -RVOMath.RVO_EPSILON) {
                    ++leftSize;
                }
                else if (j1LeftOfI <= RVOMath.RVO_EPSILON && j2LeftOfI <= RVOMath.RVO_EPSILON) {
                    ++rightSize;
                }
                else {
                    ++leftSize;
                    ++rightSize;
                }
                if (FloatPair.greaterThanOrEqual(new FloatPair(Math.max(leftSize, rightSize), Math.min(leftSize, rightSize)), new FloatPair(Math.max(minLeft, minRight), Math.min(minLeft, minRight)))) {
                    break;
                }
            }
            if (FloatPair.lessThan(new FloatPair(Math.max(leftSize, rightSize), Math.min(leftSize, rightSize)), new FloatPair(Math.max(minLeft, minRight), Math.min(minLeft, minRight)))) {
                minLeft = leftSize;
                minRight = rightSize;
                optimalSplit = i;
            }
        }
        const leftObstacles = new Array(minLeft);
        const rightObstacles = new Array(minRight);
        for (let n = 0; n < minLeft; ++n) {
            leftObstacles[n] = null;
        }
        for (let n = 0; n < minRight; ++n) {
            rightObstacles[n] = null;
        }
        let leftCounter = 0;
        let rightCounter = 0;
        let i = optimalSplit;
        const obstacleI1 = obstacles[i];
        const obstacleI2 = obstacleI1.next;
        for (let j = 0; j < obstacles.length; ++j) {
            if (i === j) {
                continue;
            }
            const obstacleJ1 = obstacles[j];
            const obstacleJ2 = obstacleJ1.next;
            const j1LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ1.point);
            const j2LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ2.point);
            if (j1LeftOfI >= -RVOMath.RVO_EPSILON && j2LeftOfI >= -RVOMath.RVO_EPSILON) {
                leftObstacles[leftCounter++] = obstacles[j];
            }
            else if (j1LeftOfI <= RVOMath.RVO_EPSILON && j2LeftOfI <= RVOMath.RVO_EPSILON) {
                rightObstacles[rightCounter++] = obstacles[j];
            }
            else {
                const t = RVOMath.det(obstacleI2.point.subtract(obstacleI1.point), obstacleJ1.point.subtract(obstacleI1.point)) / RVOMath.det(obstacleI2.point.subtract(obstacleI1.point), obstacleJ1.point.subtract(obstacleJ2.point));
                const splitPoint = obstacleJ1.point.add((obstacleJ2.point.subtract(obstacleJ1.point)).multiply(t));
                const newObstacle = new Obstacle();
                newObstacle.point = splitPoint;
                newObstacle.previous = obstacleJ1;
                newObstacle.next = obstacleJ2;
                newObstacle.convex = true;
                newObstacle.direction = obstacleJ1.direction;
                newObstacle.id = Simulator.Instance.getNumObstacleVertices();
                Simulator.Instance.addObstacleVertex(newObstacle);
                obstacleJ1.next = newObstacle;
                obstacleJ2.previous = newObstacle;
                if (j1LeftOfI > 0.0) {
                    leftObstacles[leftCounter++] = obstacleJ1;
                    rightObstacles[rightCounter++] = newObstacle;
                }
                else {
                    rightObstacles[rightCounter++] = obstacleJ1;
                    leftObstacles[leftCounter++] = newObstacle;
                }
            }
        }
        node.obstacle = obstacleI1;
        node.left = this.buildObstacleTreeRecursive(leftObstacles);
        node.right = this.buildObstacleTreeRecursive(rightObstacles);
        return node;
    }
    queryAgentTreeRecursive(agent, rangeSq, node) {
        if (this.agentTree[node].end - this.agentTree[node].begin <= KdTree.MAX_LEAF_SIZE) {
            for (let i = this.agentTree[node].begin; i < this.agentTree[node].end; ++i) {
                agent.insertAgentNeighbor(this.agents[i], rangeSq);
            }
        }
        else {
            const distSqLeft = RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].left].minX - agent.position.x())) + RVOMath.sqr(Math.max(0.0, agent.position.x() - this.agentTree[this.agentTree[node].left].maxX)) + RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].left].minY - agent.position.y())) + RVOMath.sqr(Math.max(0.0, agent.position.y() - this.agentTree[this.agentTree[node].left].maxY));
            const distSqRight = RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].right].minX - agent.position.x())) + RVOMath.sqr(Math.max(0.0, agent.position.x() - this.agentTree[this.agentTree[node].right].maxX)) + RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].right].minY - agent.position.y())) + RVOMath.sqr(Math.max(0.0, agent.position.y() - this.agentTree[this.agentTree[node].right].maxY));
            if (distSqLeft < distSqRight) {
                if (distSqLeft < rangeSq.value) {
                    this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left);
                    if (distSqRight < rangeSq.value) {
                        this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right);
                    }
                }
            }
            else {
                if (distSqRight < rangeSq.value) {
                    this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right);
                    if (distSqLeft < rangeSq.value) {
                        this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left);
                    }
                }
            }
        }
    }
    queryObstacleTreeRecursive(agent, rangeSq, node) {
        if (node !== null) {
            const obstacle1 = node.obstacle;
            const obstacle2 = obstacle1.next;
            const agentLeftOfLine = RVOMath.leftOf(obstacle1.point, obstacle2.point, agent.position);
            this.queryObstacleTreeRecursive(agent, rangeSq, agentLeftOfLine >= 0.0 ? node.left : node.right);
            const distSqLine = RVOMath.sqr(agentLeftOfLine) / RVOMath.absSq(obstacle2.point.subtract(obstacle1.point));
            if (distSqLine < rangeSq) {
                if (agentLeftOfLine < 0.0) {
                    agent.insertObstacleNeighbor(node.obstacle, rangeSq);
                }
                this.queryObstacleTreeRecursive(agent, rangeSq, agentLeftOfLine >= 0.0 ? node.right : node.left);
            }
        }
    }
    queryVisibilityRecursive(q1, q2, radius, node) {
        if (node === null) {
            return true;
        }
        const obstacle1 = node.obstacle;
        const obstacle2 = obstacle1.next;
        const q1LeftOfI = RVOMath.leftOf(obstacle1.point, obstacle2.point, q1);
        const q2LeftOfI = RVOMath.leftOf(obstacle1.point, obstacle2.point, q2);
        const invLengthI = 1.0 / RVOMath.absSq(obstacle2.point.subtract(obstacle1.point));
        if (q1LeftOfI >= 0.0 && q2LeftOfI >= 0.0) {
            return this.queryVisibilityRecursive(q1, q2, radius, node.left) && ((RVOMath.sqr(q1LeftOfI) * invLengthI >= RVOMath.sqr(radius) && RVOMath.sqr(q2LeftOfI) * invLengthI >= RVOMath.sqr(radius)) || this.queryVisibilityRecursive(q1, q2, radius, node.right));
        }
        if (q1LeftOfI <= 0.0 && q2LeftOfI <= 0.0) {
            return this.queryVisibilityRecursive(q1, q2, radius, node.right) && ((RVOMath.sqr(q1LeftOfI) * invLengthI >= RVOMath.sqr(radius) && RVOMath.sqr(q2LeftOfI) * invLengthI >= RVOMath.sqr(radius)) || this.queryVisibilityRecursive(q1, q2, radius, node.left));
        }
        if (q1LeftOfI >= 0.0 && q2LeftOfI <= 0.0) {
            return this.queryVisibilityRecursive(q1, q2, radius, node.left) && this.queryVisibilityRecursive(q1, q2, radius, node.right);
        }
        const point1LeftOfQ = RVOMath.leftOf(q1, q2, obstacle1.point);
        const point2LeftOfQ = RVOMath.leftOf(q1, q2, obstacle2.point);
        const invLengthQ = 1.0 / RVOMath.absSq(q2.subtract(q1));
        return point1LeftOfQ * point2LeftOfQ >= 0.0 && RVOMath.sqr(point1LeftOfQ) * invLengthQ > RVOMath.sqr(radius) && RVOMath.sqr(point2LeftOfQ) * invLengthQ > RVOMath.sqr(radius) && this.queryVisibilityRecursive(q1, q2, radius, node.left) && this.queryVisibilityRecursive(q1, q2, radius, node.right);
    }
}
KdTree.MAX_LEAF_SIZE = 10;
//# sourceMappingURL=KdTree.js.map