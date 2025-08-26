"use strict";
/*
 * test.ts
 * Simple test file for RVO2 Library TypeScript
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
console.log('RVO2 Library TypeScript Test');
console.log('=============================');
// Create simulator instance
const simulator = index_1.Simulator.Instance;
// Set default agent properties
simulator.setAgentDefaults(15.0, // neighborDist
10, // maxNeighbors
10.0, // timeHorizon
10.0, // timeHorizonObst
2.0, // radius
2.0, // maxSpeed
new index_1.Vector2(0, 0) // velocity
);
console.log('✓ Default agent properties set');
// Add agents
const agent0 = simulator.addAgent(new index_1.Vector2(0, 0));
const agent1 = simulator.addAgent(new index_1.Vector2(10, 0));
console.log(`✓ Added agents: ${agent0}, ${agent1}`);
// Set preferred velocities
simulator.setAgentPrefVelocity(agent0, new index_1.Vector2(1, 0));
simulator.setAgentPrefVelocity(agent1, new index_1.Vector2(-1, 0));
console.log('✓ Set preferred velocities');
// Add a simple square obstacle
const obstacleVertices = [
    new index_1.Vector2(-5, -5),
    new index_1.Vector2(-5, 5),
    new index_1.Vector2(5, 5),
    new index_1.Vector2(5, -5)
];
const obstacleId = simulator.addObstacle(obstacleVertices);
simulator.processObstacles();
console.log(`✓ Added obstacle: ${obstacleId}`);
// Run simulation for a few steps
console.log('\nRunning simulation...');
console.log('Step | Agent 0 Position | Agent 1 Position');
for (let i = 0; i < 10; ++i) {
    simulator.doStep();
    // Get agent positions
    const pos0 = simulator.getAgentPosition(agent0);
    const pos1 = simulator.getAgentPosition(agent1);
    console.log(`${i.toString().padStart(4)} | ${pos0.toString().padStart(16)} | ${pos1.toString().padStart(16)}`);
}
console.log('\n✓ Simulation completed successfully!');
console.log('\nRVO2 Library TypeScript is working correctly! 🎉');
//# sourceMappingURL=test.js.map