import { Vector2 } from './Vector2';
/**
 * Defines static obstacles in the simulation.
 */
export declare class Obstacle {
    next: Obstacle | null;
    previous: Obstacle | null;
    direction: Vector2;
    point: Vector2;
    id: number;
    convex: boolean;
}
//# sourceMappingURL=Obstacle.d.ts.map