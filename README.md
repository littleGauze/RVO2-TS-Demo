# RVO2 Library TypeScript

This is a TypeScript port of the RVO2 Library, implementing Optimal Reciprocal Collision Avoidance for multi-agent systems.

## Overview

RVO2 Library TypeScript is an open-source TypeScript implementation of the optimal reciprocal collision avoidance (ORCA) algorithm in two dimensions. It provides a simple API for third-party applications to simulate multiple agents avoiding collisions with each other and static obstacles.

## Features

- **Multi-Agent Simulation**: Handle thousands of agents efficiently
- **Collision Avoidance**: Automatic collision-free path planning
- **Static Obstacles**: Support for polygonal obstacle definitions
- **Real-time Performance**: Fast computation suitable for real-time applications
- **TypeScript Support**: Full type safety and modern JavaScript features

## Installation

```bash
npm install
npm run build
```

## Basic Usage

```typescript
import { Simulator, Vector2 } from './RVO2';

// Create simulator instance
const simulator = Simulator.Instance;

// Set default agent properties
simulator.setAgentDefaults(
    15.0,   // neighborDist
    10,     // maxNeighbors
    10.0,   // timeHorizon
    10.0,   // timeHorizonObst
    2.0,    // radius
    2.0,    // maxSpeed
    new Vector2(0, 0)  // velocity
);

// Add agents
const agent0 = simulator.addAgent(new Vector2(0, 0));
const agent1 = simulator.addAgent(new Vector2(10, 0));

// Set preferred velocities
simulator.setAgentPrefVelocity(agent0, new Vector2(1, 0));
simulator.setAgentPrefVelocity(agent1, new Vector2(-1, 0));

// Add obstacles (optional)
const obstacleVertices = [
    new Vector2(-5, -5),
    new Vector2(-5, 5),
    new Vector2(5, 5),
    new Vector2(5, -5)
];
simulator.addObstacle(obstacleVertices);
simulator.processObstacles();

// Simulation loop
for (let i = 0; i < 100; ++i) {
    simulator.doStep();
    
    // Get agent positions
    const pos0 = simulator.getAgentPosition(agent0);
    const pos1 = simulator.getAgentPosition(agent1);
    
    console.log(`Step ${i}: Agent 0 at ${pos0}, Agent 1 at ${pos1}`);
}
```

## API Reference

### Simulator

The main simulation class that manages agents and obstacles.

- `addAgent(position: Vector2)`: Add agent with default properties
- `addAgentWithParams(...)`: Add agent with custom properties
- `addObstacle(vertices: Vector2[])`: Add polygonal obstacle
- `doStep()`: Perform one simulation step
- `getAgentPosition(agentNo: number)`: Get agent position
- `setAgentPrefVelocity(agentNo: number, velocity: Vector2)`: Set preferred velocity

### Vector2

2D vector class with mathematical operations.

- `add(other: Vector2)`: Vector addition
- `subtract(other: Vector2)`: Vector subtraction
- `multiply(scalar: number)`: Scalar multiplication
- `dot(other: Vector2)`: Dot product
- `x()`, `y()`: Access coordinates

### Agent

Represents a single agent in the simulation.

- `position`: Current position
- `velocity`: Current velocity
- `prefVelocity`: Preferred velocity
- `radius`: Agent radius
- `maxSpeed`: Maximum speed

## Building

```bash
npm run build
```

This will compile the TypeScript files to JavaScript in the `dist/` directory.

## License

Licensed under the Apache License, Version 2.0. See LICENSE file for details.

## Original Authors

- Jur van den Berg
- Stephen J. Guy
- Jamie Snape
- Ming C. Lin
- Dinesh Manocha

Department of Computer Science, University of North Carolina at Chapel Hill

## More Information

- [RVO2 Project Page](https://gamma.cs.unc.edu/RVO2/)
- [Original C++ Implementation](https://github.com/snape/RVO2)
- [Original C# Implementation](https://github.com/snape/RVO2-CS)
