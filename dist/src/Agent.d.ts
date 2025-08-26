import { Vector2 } from './Vector2.js';
import { Obstacle } from './Obstacle.js';
import { Line } from './Line.js';
/**
 * Defines an agent in the simulation.
 */
export declare class Agent {
    agentNeighbors: Array<{
        key: number;
        value: Agent;
    }>;
    obstacleNeighbors: Array<{
        key: number;
        value: Obstacle;
    }>;
    orcaLines: Line[];
    position: Vector2;
    prefVelocity: Vector2;
    velocity: Vector2;
    id: number;
    maxNeighbors: number;
    maxSpeed: number;
    neighborDist: number;
    radius: number;
    timeHorizon: number;
    timeHorizonObst: number;
    private newVelocity;
    /**
     * Computes the neighbors of this agent.
     */
    computeNeighbors(): void;
    /**
     * Computes the new velocity of this agent.
     */
    computeNewVelocity(): void;
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
    private linearProgram1;
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
    private linearProgram2;
    /**
     * Solves a two-dimensional linear program subject to linear
     * constraints defined by lines and a circular constraint.
     *
     * @param lines Lines defining the linear constraints.
     * @param numObstLines Count of obstacle lines.
     * @param beginLine The line on which the 2-d linear program failed.
     * @param radius The radius of the circular constraint.
     */
    private linearProgram3;
    /**
     * Updates the two-dimensional position and two-dimensional
     * velocity of this agent.
     */
    update(): void;
    /**
     * Inserts an agent neighbor into the set of neighbors of this
     * agent.
     *
     * @param agent A pointer to the agent to be inserted.
     * @param rangeSq The squared range around this agent.
     */
    insertAgentNeighbor(agent: Agent, rangeSq: {
        value: number;
    }): void;
    /**
     * Inserts a static obstacle neighbor into the set of neighbors
     * of this agent.
     *
     * @param obstacle The number of the static obstacle to be inserted.
     * @param rangeSq The squared range around this agent.
     */
    insertObstacleNeighbor(obstacle: Obstacle, rangeSq: number): void;
}
//# sourceMappingURL=Agent.d.ts.map