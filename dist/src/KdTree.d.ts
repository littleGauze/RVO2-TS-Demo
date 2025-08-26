import { Vector2 } from './Vector2.js';
import { Agent } from './Agent.js';
/**
 * Defines k-D trees for agents and static obstacles in the simulation.
 */
export declare class KdTree {
    private static readonly MAX_LEAF_SIZE;
    private agents;
    private agentTree;
    private obstacleTree;
    buildAgentTree(): void;
    buildObstacleTree(): void;
    computeAgentNeighbors(agent: Agent, rangeSq: {
        value: number;
    }): void;
    computeObstacleNeighbors(agent: Agent, rangeSq: number): void;
    queryVisibility(q1: Vector2, q2: Vector2, radius: number): boolean;
    private buildAgentTreeRecursive;
    private buildObstacleTreeRecursive;
    private queryAgentTreeRecursive;
    private queryObstacleTreeRecursive;
    private queryVisibilityRecursive;
}
//# sourceMappingURL=KdTree.d.ts.map