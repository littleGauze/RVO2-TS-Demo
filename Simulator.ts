/*
 * Simulator.ts
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

import { Vector2 } from './Vector2';
import { Agent } from './Agent';
import { Obstacle } from './Obstacle';
import { KdTree } from './KdTree';

/**
 * Defines the simulation.
 */
export class Simulator {
    private static instance: Simulator = new Simulator();

    public agents: Agent[] = [];
    public obstacles: Obstacle[] = [];
    public kdTree: KdTree = new KdTree();
    public timeStep: number = 0.1;

    private defaultAgent: Agent | null = null;
    private globalTime: number = 0.0;

    public static get Instance(): Simulator {
        return Simulator.instance;
    }

    /**
     * Adds a new agent with default properties to the simulation.
     *
     * @param position The two-dimensional starting position of this agent.
     * @returns The number of the agent, or -1 when the agent defaults have not been set.
     */
    public addAgent(position: Vector2): number {
        if (this.defaultAgent === null) {
            return -1;
        }

        const agent = new Agent();
        agent.id = this.agents.length;
        agent.maxNeighbors = this.defaultAgent.maxNeighbors;
        agent.maxSpeed = this.defaultAgent.maxSpeed;
        agent.neighborDist = this.defaultAgent.neighborDist;
        agent.position = position;
        agent.radius = this.defaultAgent.radius;
        agent.timeHorizon = this.defaultAgent.timeHorizon;
        agent.timeHorizonObst = this.defaultAgent.timeHorizonObst;
        agent.velocity = this.defaultAgent.velocity;
        this.agents.push(agent);

        return agent.id;
    }

    /**
     * Adds a new agent to the simulation.
     *
     * @param position The two-dimensional starting position of this agent.
     * @param neighborDist The maximum distance to other agents this agent takes into account.
     * @param maxNeighbors The maximum number of other agents this agent takes into account.
     * @param timeHorizon The minimal amount of time for which this agent's velocities are safe.
     * @param timeHorizonObst The minimal amount of time for which this agent's velocities are safe with respect to obstacles.
     * @param radius The radius of this agent.
     * @param maxSpeed The maximum speed of this agent.
     * @param velocity The initial two-dimensional linear velocity of this agent.
     * @returns The number of the agent.
     */
    public addAgentWithParams(
        position: Vector2,
        neighborDist: number,
        maxNeighbors: number,
        timeHorizon: number,
        timeHorizonObst: number,
        radius: number,
        maxSpeed: number,
        velocity: Vector2
    ): number {
        const agent = new Agent();
        agent.id = this.agents.length;
        agent.maxNeighbors = maxNeighbors;
        agent.maxSpeed = maxSpeed;
        agent.neighborDist = neighborDist;
        agent.position = position;
        agent.radius = radius;
        agent.timeHorizon = timeHorizon;
        agent.timeHorizonObst = timeHorizonObst;
        agent.velocity = velocity;
        this.agents.push(agent);

        return agent.id;
    }

    /**
     * Adds a new obstacle to the simulation.
     *
     * @param vertices List of the vertices of the polygonal obstacle in counterclockwise order.
     * @returns The number of the first vertex of the obstacle, or -1 when the number of vertices is less than two.
     */
    public addObstacle(vertices: Vector2[]): number {
        if (vertices.length < 2) {
            return -1;
        }

        const obstacleNo = this.obstacles.length;

        for (let i = 0; i < vertices.length; ++i) {
            const obstacle = new Obstacle();
            obstacle.point = vertices[i];

            if (i !== 0) {
                obstacle.previous = this.obstacles[this.obstacles.length - 1];
                obstacle.previous!.next = obstacle;
            }

            if (i === vertices.length - 1) {
                obstacle.next = this.obstacles[obstacleNo];
                obstacle.next!.previous = obstacle;
            }

            obstacle.direction = RVOMath.normalize(vertices[(i === vertices.length - 1 ? 0 : i + 1)].subtract(vertices[i]));

            if (vertices.length === 2) {
                obstacle.convex = true;
            } else {
                obstacle.convex = (RVOMath.leftOf(vertices[(i === 0 ? vertices.length - 1 : i - 1)], vertices[i], vertices[(i === vertices.length - 1 ? 0 : i + 1)]) >= 0.0);
            }

            obstacle.id = this.obstacles.length;
            this.obstacles.push(obstacle);
        }

        return obstacleNo;
    }

    /**
     * Clears the simulation.
     */
    public clear(): void {
        this.agents = [];
        this.defaultAgent = null;
        this.kdTree = new KdTree();
        this.obstacles = [];
        this.globalTime = 0.0;
        this.timeStep = 0.1;
    }

    /**
     * Performs a simulation step and updates the two-dimensional
     * position and two-dimensional velocity of each agent.
     *
     * @returns The global time after the simulation step.
     */
    public doStep(): number {
        this.kdTree.buildAgentTree();

        for (const agent of this.agents) {
            agent.computeNeighbors();
            agent.computeNewVelocity();
        }

        for (const agent of this.agents) {
            agent.update();
        }

        this.globalTime += this.timeStep;

        return this.globalTime;
    }

    /**
     * Returns the specified agent neighbor of the specified agent.
     *
     * @param agentNo The number of the agent whose agent neighbor is to be retrieved.
     * @param neighborNo The number of the agent neighbor to be retrieved.
     * @returns The number of the neighboring agent.
     */
    public getAgentAgentNeighbor(agentNo: number, neighborNo: number): number {
        return this.agents[agentNo].agentNeighbors[neighborNo].value.id;
    }

    /**
     * Returns the maximum neighbor count of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor count is to be retrieved.
     * @returns The present maximum neighbor count of the agent.
     */
    public getAgentMaxNeighbors(agentNo: number): number {
        return this.agents[agentNo].maxNeighbors;
    }

    /**
     * Returns the maximum speed of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum speed is to be retrieved.
     * @returns The present maximum speed of the agent.
     */
    public getAgentMaxSpeed(agentNo: number): number {
        return this.agents[agentNo].maxSpeed;
    }

    /**
     * Returns the maximum neighbor distance of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor distance is to be retrieved.
     * @returns The present maximum neighbor distance of the agent.
     */
    public getAgentNeighborDist(agentNo: number): number {
        return this.agents[agentNo].neighborDist;
    }

    /**
     * Returns the count of agent neighbors taken into account to
     * compute the current velocity for the specified agent.
     *
     * @param agentNo The number of the agent whose count of agent neighbors is to be retrieved.
     * @returns The count of agent neighbors taken into account to compute the current velocity for the specified agent.
     */
    public getAgentNumAgentNeighbors(agentNo: number): number {
        return this.agents[agentNo].agentNeighbors.length;
    }

    /**
     * Returns the count of obstacle neighbors taken into account
     * to compute the current velocity for the specified agent.
     *
     * @param agentNo The number of the agent whose count of obstacle neighbors is to be retrieved.
     * @returns The count of obstacle neighbors taken into account to compute the current velocity for the specified agent.
     */
    public getAgentNumObstacleNeighbors(agentNo: number): number {
        return this.agents[agentNo].obstacleNeighbors.length;
    }

    /**
     * Returns the specified obstacle neighbor of the specified agent.
     *
     * @param agentNo The number of the agent whose obstacle neighbor is to be retrieved.
     * @param neighborNo The number of the obstacle neighbor to be retrieved.
     * @returns The number of the first vertex of the neighboring obstacle edge.
     */
    public getAgentObstacleNeighbor(agentNo: number, neighborNo: number): number {
        return this.agents[agentNo].obstacleNeighbors[neighborNo].value.id;
    }

    /**
     * Returns the ORCA constraints of the specified agent.
     *
     * @param agentNo The number of the agent whose ORCA constraints are to be retrieved.
     * @returns A list of lines representing the ORCA constraints.
     */
    public getAgentOrcaLines(agentNo: number): Line[] {
        return this.agents[agentNo].orcaLines;
    }

    /**
     * Returns the two-dimensional position of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional position is to be retrieved.
     * @returns The present two-dimensional position of the (center of the) agent.
     */
    public getAgentPosition(agentNo: number): Vector2 {
        return this.agents[agentNo].position;
    }

    /**
     * Returns the two-dimensional preferred velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional preferred velocity is to be retrieved.
     * @returns The present two-dimensional preferred velocity of the agent.
     */
    public getAgentPrefVelocity(agentNo: number): Vector2 {
        return this.agents[agentNo].prefVelocity;
    }

    /**
     * Returns the radius of a specified agent.
     *
     * @param agentNo The number of the agent whose radius is to be retrieved.
     * @returns The present radius of the agent.
     */
    public getAgentRadius(agentNo: number): number {
        return this.agents[agentNo].radius;
    }

    /**
     * Returns the time horizon of a specified agent.
     *
     * @param agentNo The number of the agent whose time horizon is to be retrieved.
     * @returns The present time horizon of the agent.
     */
    public getAgentTimeHorizon(agentNo: number): number {
        return this.agents[agentNo].timeHorizon;
    }

    /**
     * Returns the time horizon with respect to obstacles of a specified agent.
     *
     * @param agentNo The number of the agent whose time horizon with respect to obstacles is to be retrieved.
     * @returns The present time horizon with respect to obstacles of the agent.
     */
    public getAgentTimeHorizonObst(agentNo: number): number {
        return this.agents[agentNo].timeHorizonObst;
    }

    /**
     * Returns the two-dimensional linear velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional linear velocity is to be retrieved.
     * @returns The present two-dimensional linear velocity of the agent.
     */
    public getAgentVelocity(agentNo: number): Vector2 {
        return this.agents[agentNo].velocity;
    }

    /**
     * Returns the global time of the simulation.
     *
     * @returns The present global time of the simulation (zero initially).
     */
    public getGlobalTime(): number {
        return this.globalTime;
    }

    /**
     * Returns the count of agents in the simulation.
     *
     * @returns The count of agents in the simulation.
     */
    public getNumAgents(): number {
        return this.agents.length;
    }

    /**
     * Returns the count of obstacle vertices in the simulation.
     *
     * @returns The count of obstacle vertices in the simulation.
     */
    public getNumObstacleVertices(): number {
        return this.obstacles.length;
    }

    /**
     * Returns the two-dimensional position of a specified obstacle vertex.
     *
     * @param vertexNo The number of the obstacle vertex to be retrieved.
     * @returns The two-dimensional position of the specified obstacle vertex.
     */
    public getObstacleVertex(vertexNo: number): Vector2 {
        return this.obstacles[vertexNo].point;
    }

    /**
     * Returns the number of the obstacle vertex succeeding the specified obstacle vertex in its polygon.
     *
     * @param vertexNo The number of the obstacle vertex whose successor is to be retrieved.
     * @returns The number of the obstacle vertex succeeding the specified obstacle vertex in its polygon.
     */
    public getNextObstacleVertexNo(vertexNo: number): number {
        return this.obstacles[vertexNo].next!.id;
    }

    /**
     * Returns the number of the obstacle vertex preceding the specified obstacle vertex in its polygon.
     *
     * @param vertexNo The number of the obstacle vertex whose predecessor is to be retrieved.
     * @returns The number of the obstacle vertex preceding the specified obstacle vertex in its polygon.
     */
    public getPrevObstacleVertexNo(vertexNo: number): number {
        return this.obstacles[vertexNo].previous!.id;
    }

    /**
     * Returns the time step of the simulation.
     *
     * @returns The present time step of the simulation.
     */
    public getTimeStep(): number {
        return this.timeStep;
    }

    /**
     * Processes the obstacles that have been added so that they
     * are accounted for in the simulation.
     */
    public processObstacles(): void {
        this.kdTree.buildObstacleTree();
    }

    /**
     * Performs a visibility query between the two specified points
     * with respect to the obstacles.
     *
     * @param point1 The first point of the query.
     * @param point2 The second point of the query.
     * @param radius The minimal distance between the line connecting the two points and the obstacles.
     * @returns A boolean specifying whether the two points are mutually visible.
     */
    public queryVisibility(point1: Vector2, point2: Vector2, radius: number): boolean {
        return this.kdTree.queryVisibility(point1, point2, radius);
    }

    /**
     * Sets the default properties for any new agent that is added.
     *
     * @param neighborDist The default maximum distance to other agents a new agent takes into account.
     * @param maxNeighbors The default maximum number of other agents a new agent takes into account.
     * @param timeHorizon The default minimal amount of time for which a new agent's velocities are safe.
     * @param timeHorizonObst The default minimal amount of time for which a new agent's velocities are safe with respect to obstacles.
     * @param radius The default radius of a new agent.
     * @param maxSpeed The default maximum speed of a new agent.
     * @param velocity The default initial two-dimensional linear velocity of a new agent.
     */
    public setAgentDefaults(
        neighborDist: number,
        maxNeighbors: number,
        timeHorizon: number,
        timeHorizonObst: number,
        radius: number,
        maxSpeed: number,
        velocity: Vector2
    ): void {
        if (this.defaultAgent === null) {
            this.defaultAgent = new Agent();
        }

        this.defaultAgent.maxNeighbors = maxNeighbors;
        this.defaultAgent.maxSpeed = maxSpeed;
        this.defaultAgent.neighborDist = neighborDist;
        this.defaultAgent.radius = radius;
        this.defaultAgent.timeHorizon = timeHorizon;
        this.defaultAgent.timeHorizonObst = timeHorizonObst;
        this.defaultAgent.velocity = velocity;
    }

    /**
     * Sets the maximum neighbor count of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor count is to be modified.
     * @param maxNeighbors The replacement maximum neighbor count.
     */
    public setAgentMaxNeighbors(agentNo: number, maxNeighbors: number): void {
        this.agents[agentNo].maxNeighbors = maxNeighbors;
    }

    /**
     * Sets the maximum speed of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum speed is to be modified.
     * @param maxSpeed The replacement maximum speed.
     */
    public setAgentMaxSpeed(agentNo: number, maxSpeed: number): void {
        this.agents[agentNo].maxSpeed = maxSpeed;
    }

    /**
     * Sets the maximum neighbor distance of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor distance is to be modified.
     * @param neighborDist The replacement maximum neighbor distance.
     */
    public setAgentNeighborDist(agentNo: number, neighborDist: number): void {
        this.agents[agentNo].neighborDist = neighborDist;
    }

    /**
     * Sets the two-dimensional position of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional position is to be modified.
     * @param position The replacement of the two-dimensional position.
     */
    public setAgentPosition(agentNo: number, position: Vector2): void {
        this.agents[agentNo].position = position;
    }

    /**
     * Sets the two-dimensional preferred velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional preferred velocity is to be modified.
     * @param prefVelocity The replacement of the two-dimensional preferred velocity.
     */
    public setAgentPrefVelocity(agentNo: number, prefVelocity: Vector2): void {
        this.agents[agentNo].prefVelocity = prefVelocity;
    }

    /**
     * Sets the radius of a specified agent.
     *
     * @param agentNo The number of the agent whose radius is to be modified.
     * @param radius The replacement radius.
     */
    public setAgentRadius(agentNo: number, radius: number): void {
        this.agents[agentNo].radius = radius;
    }

    /**
     * Sets the time horizon of a specified agent with respect to other agents.
     *
     * @param agentNo The number of the agent whose time horizon is to be modified.
     * @param timeHorizon The replacement time horizon with respect to other agents.
     */
    public setAgentTimeHorizon(agentNo: number, timeHorizon: number): void {
        this.agents[agentNo].timeHorizon = timeHorizon;
    }

    /**
     * Sets the time horizon of a specified agent with respect to obstacles.
     *
     * @param agentNo The number of the agent whose time horizon with respect to obstacles is to be modified.
     * @param timeHorizonObst The replacement time horizon with respect to obstacles.
     */
    public setAgentTimeHorizonObst(agentNo: number, timeHorizonObst: number): void {
        this.agents[agentNo].timeHorizonObst = timeHorizonObst;
    }

    /**
     * Sets the two-dimensional linear velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional linear velocity is to be modified.
     * @param velocity The replacement two-dimensional linear velocity.
     */
    public setAgentVelocity(agentNo: number, velocity: Vector2): void {
        this.agents[agentNo].velocity = velocity;
    }

    /**
     * Sets the global time of the simulation.
     *
     * @param globalTime The global time of the simulation.
     */
    public setGlobalTime(globalTime: number): void {
        this.globalTime = globalTime;
    }

    /**
     * Sets the time step of the simulation.
     *
     * @param timeStep The time step of the simulation.
     */
    public setTimeStep(timeStep: number): void {
        this.timeStep = timeStep;
    }

    /**
     * Gets an agent by index.
     *
     * @param index The index of the agent.
     * @returns The agent at the specified index.
     */
    public getAgent(index: number): Agent {
        return this.agents[index];
    }

    /**
     * Gets an obstacle by index.
     *
     * @param index The index of the obstacle.
     * @returns The obstacle at the specified index.
     */
    public getObstacle(index: number): Obstacle {
        return this.obstacles[index];
    }

    /**
     * Adds an obstacle vertex.
     *
     * @param obstacle The obstacle to add.
     */
    public addObstacleVertex(obstacle: Obstacle): void {
        this.obstacles.push(obstacle);
    }

    /**
     * Constructs and initializes a simulation.
     */
    private constructor() {
        this.clear();
    }
}

// Import RVOMath for use in this file
import { RVOMath } from './RVOMath';
import { Line } from './Line';
