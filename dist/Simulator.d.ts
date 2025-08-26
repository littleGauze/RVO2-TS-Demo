import { Vector2 } from './Vector2';
import { Agent } from './Agent';
import { Obstacle } from './Obstacle';
import { KdTree } from './KdTree';
/**
 * Defines the simulation.
 */
export declare class Simulator {
    private static instance;
    agents: Agent[];
    obstacles: Obstacle[];
    kdTree: KdTree;
    timeStep: number;
    private defaultAgent;
    private globalTime;
    static get Instance(): Simulator;
    /**
     * Adds a new agent with default properties to the simulation.
     *
     * @param position The two-dimensional starting position of this agent.
     * @returns The number of the agent, or -1 when the agent defaults have not been set.
     */
    addAgent(position: Vector2): number;
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
    addAgentWithParams(position: Vector2, neighborDist: number, maxNeighbors: number, timeHorizon: number, timeHorizonObst: number, radius: number, maxSpeed: number, velocity: Vector2): number;
    /**
     * Adds a new obstacle to the simulation.
     *
     * @param vertices List of the vertices of the polygonal obstacle in counterclockwise order.
     * @returns The number of the first vertex of the obstacle, or -1 when the number of vertices is less than two.
     */
    addObstacle(vertices: Vector2[]): number;
    /**
     * Clears the simulation.
     */
    clear(): void;
    /**
     * Performs a simulation step and updates the two-dimensional
     * position and two-dimensional velocity of each agent.
     *
     * @returns The global time after the simulation step.
     */
    doStep(): number;
    /**
     * Returns the specified agent neighbor of the specified agent.
     *
     * @param agentNo The number of the agent whose agent neighbor is to be retrieved.
     * @param neighborNo The number of the agent neighbor to be retrieved.
     * @returns The number of the neighboring agent.
     */
    getAgentAgentNeighbor(agentNo: number, neighborNo: number): number;
    /**
     * Returns the maximum neighbor count of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor count is to be retrieved.
     * @returns The present maximum neighbor count of the agent.
     */
    getAgentMaxNeighbors(agentNo: number): number;
    /**
     * Returns the maximum speed of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum speed is to be retrieved.
     * @returns The present maximum speed of the agent.
     */
    getAgentMaxSpeed(agentNo: number): number;
    /**
     * Returns the maximum neighbor distance of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor distance is to be retrieved.
     * @returns The present maximum neighbor distance of the agent.
     */
    getAgentNeighborDist(agentNo: number): number;
    /**
     * Returns the count of agent neighbors taken into account to
     * compute the current velocity for the specified agent.
     *
     * @param agentNo The number of the agent whose count of agent neighbors is to be retrieved.
     * @returns The count of agent neighbors taken into account to compute the current velocity for the specified agent.
     */
    getAgentNumAgentNeighbors(agentNo: number): number;
    /**
     * Returns the count of obstacle neighbors taken into account
     * to compute the current velocity for the specified agent.
     *
     * @param agentNo The number of the agent whose count of obstacle neighbors is to be retrieved.
     * @returns The count of obstacle neighbors taken into account to compute the current velocity for the specified agent.
     */
    getAgentNumObstacleNeighbors(agentNo: number): number;
    /**
     * Returns the specified obstacle neighbor of the specified agent.
     *
     * @param agentNo The number of the agent whose obstacle neighbor is to be retrieved.
     * @param neighborNo The number of the obstacle neighbor to be retrieved.
     * @returns The number of the first vertex of the neighboring obstacle edge.
     */
    getAgentObstacleNeighbor(agentNo: number, neighborNo: number): number;
    /**
     * Returns the ORCA constraints of the specified agent.
     *
     * @param agentNo The number of the agent whose ORCA constraints are to be retrieved.
     * @returns A list of lines representing the ORCA constraints.
     */
    getAgentOrcaLines(agentNo: number): Line[];
    /**
     * Returns the two-dimensional position of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional position is to be retrieved.
     * @returns The present two-dimensional position of the (center of the) agent.
     */
    getAgentPosition(agentNo: number): Vector2;
    /**
     * Returns the two-dimensional preferred velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional preferred velocity is to be retrieved.
     * @returns The present two-dimensional preferred velocity of the agent.
     */
    getAgentPrefVelocity(agentNo: number): Vector2;
    /**
     * Returns the radius of a specified agent.
     *
     * @param agentNo The number of the agent whose radius is to be retrieved.
     * @returns The present radius of the agent.
     */
    getAgentRadius(agentNo: number): number;
    /**
     * Returns the time horizon of a specified agent.
     *
     * @param agentNo The number of the agent whose time horizon is to be retrieved.
     * @returns The present time horizon of the agent.
     */
    getAgentTimeHorizon(agentNo: number): number;
    /**
     * Returns the time horizon with respect to obstacles of a specified agent.
     *
     * @param agentNo The number of the agent whose time horizon with respect to obstacles is to be retrieved.
     * @returns The present time horizon with respect to obstacles of the agent.
     */
    getAgentTimeHorizonObst(agentNo: number): number;
    /**
     * Returns the two-dimensional linear velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional linear velocity is to be retrieved.
     * @returns The present two-dimensional linear velocity of the agent.
     */
    getAgentVelocity(agentNo: number): Vector2;
    /**
     * Returns the global time of the simulation.
     *
     * @returns The present global time of the simulation (zero initially).
     */
    getGlobalTime(): number;
    /**
     * Returns the count of agents in the simulation.
     *
     * @returns The count of agents in the simulation.
     */
    getNumAgents(): number;
    /**
     * Returns the count of obstacle vertices in the simulation.
     *
     * @returns The count of obstacle vertices in the simulation.
     */
    getNumObstacleVertices(): number;
    /**
     * Returns the two-dimensional position of a specified obstacle vertex.
     *
     * @param vertexNo The number of the obstacle vertex to be retrieved.
     * @returns The two-dimensional position of the specified obstacle vertex.
     */
    getObstacleVertex(vertexNo: number): Vector2;
    /**
     * Returns the number of the obstacle vertex succeeding the specified obstacle vertex in its polygon.
     *
     * @param vertexNo The number of the obstacle vertex whose successor is to be retrieved.
     * @returns The number of the obstacle vertex succeeding the specified obstacle vertex in its polygon.
     */
    getNextObstacleVertexNo(vertexNo: number): number;
    /**
     * Returns the number of the obstacle vertex preceding the specified obstacle vertex in its polygon.
     *
     * @param vertexNo The number of the obstacle vertex whose predecessor is to be retrieved.
     * @returns The number of the obstacle vertex preceding the specified obstacle vertex in its polygon.
     */
    getPrevObstacleVertexNo(vertexNo: number): number;
    /**
     * Returns the time step of the simulation.
     *
     * @returns The present time step of the simulation.
     */
    getTimeStep(): number;
    /**
     * Processes the obstacles that have been added so that they
     * are accounted for in the simulation.
     */
    processObstacles(): void;
    /**
     * Performs a visibility query between the two specified points
     * with respect to the obstacles.
     *
     * @param point1 The first point of the query.
     * @param point2 The second point of the query.
     * @param radius The minimal distance between the line connecting the two points and the obstacles.
     * @returns A boolean specifying whether the two points are mutually visible.
     */
    queryVisibility(point1: Vector2, point2: Vector2, radius: number): boolean;
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
    setAgentDefaults(neighborDist: number, maxNeighbors: number, timeHorizon: number, timeHorizonObst: number, radius: number, maxSpeed: number, velocity: Vector2): void;
    /**
     * Sets the maximum neighbor count of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor count is to be modified.
     * @param maxNeighbors The replacement maximum neighbor count.
     */
    setAgentMaxNeighbors(agentNo: number, maxNeighbors: number): void;
    /**
     * Sets the maximum speed of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum speed is to be modified.
     * @param maxSpeed The replacement maximum speed.
     */
    setAgentMaxSpeed(agentNo: number, maxSpeed: number): void;
    /**
     * Sets the maximum neighbor distance of a specified agent.
     *
     * @param agentNo The number of the agent whose maximum neighbor distance is to be modified.
     * @param neighborDist The replacement maximum neighbor distance.
     */
    setAgentNeighborDist(agentNo: number, neighborDist: number): void;
    /**
     * Sets the two-dimensional position of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional position is to be modified.
     * @param position The replacement of the two-dimensional position.
     */
    setAgentPosition(agentNo: number, position: Vector2): void;
    /**
     * Sets the two-dimensional preferred velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional preferred velocity is to be modified.
     * @param prefVelocity The replacement of the two-dimensional preferred velocity.
     */
    setAgentPrefVelocity(agentNo: number, prefVelocity: Vector2): void;
    /**
     * Sets the radius of a specified agent.
     *
     * @param agentNo The number of the agent whose radius is to be modified.
     * @param radius The replacement radius.
     */
    setAgentRadius(agentNo: number, radius: number): void;
    /**
     * Sets the time horizon of a specified agent with respect to other agents.
     *
     * @param agentNo The number of the agent whose time horizon is to be modified.
     * @param timeHorizon The replacement time horizon with respect to other agents.
     */
    setAgentTimeHorizon(agentNo: number, timeHorizon: number): void;
    /**
     * Sets the time horizon of a specified agent with respect to obstacles.
     *
     * @param agentNo The number of the agent whose time horizon with respect to obstacles is to be modified.
     * @param timeHorizonObst The replacement time horizon with respect to obstacles.
     */
    setAgentTimeHorizonObst(agentNo: number, timeHorizonObst: number): void;
    /**
     * Sets the two-dimensional linear velocity of a specified agent.
     *
     * @param agentNo The number of the agent whose two-dimensional linear velocity is to be modified.
     * @param velocity The replacement two-dimensional linear velocity.
     */
    setAgentVelocity(agentNo: number, velocity: Vector2): void;
    /**
     * Sets the global time of the simulation.
     *
     * @param globalTime The global time of the simulation.
     */
    setGlobalTime(globalTime: number): void;
    /**
     * Sets the time step of the simulation.
     *
     * @param timeStep The time step of the simulation.
     */
    setTimeStep(timeStep: number): void;
    /**
     * Gets an agent by index.
     *
     * @param index The index of the agent.
     * @returns The agent at the specified index.
     */
    getAgent(index: number): Agent;
    /**
     * Gets an obstacle by index.
     *
     * @param index The index of the obstacle.
     * @returns The obstacle at the specified index.
     */
    getObstacle(index: number): Obstacle;
    /**
     * Adds an obstacle vertex.
     *
     * @param obstacle The obstacle to add.
     */
    addObstacleVertex(obstacle: Obstacle): void;
    /**
     * Constructs and initializes a simulation.
     */
    private constructor();
}
import { Line } from './Line';
//# sourceMappingURL=Simulator.d.ts.map