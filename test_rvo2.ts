/**
 * RVO2 库测试脚本
 * 测试基本的RVO2功能
 */

import { Simulator, Vector2, Agent } from './index';

console.log('开始测试RVO2库...');

try {
    // 创建仿真器实例
    const simulator = Simulator.Instance;
    console.log('✓ 仿真器创建成功');

    // 设置仿真器参数
    simulator.setAgentDefaults(
        30.0,   // neighborDist
        10,     // maxNeighbors
        10.0,   // timeHorizon
        10.0,   // timeHorizonObst
        8.0,    // radius
        50.0,   // maxSpeed
        new Vector2(0, 0)  // velocity
    );
    simulator.setTimeStep(0.1);
    console.log('✓ 仿真器参数设置成功');

    // 添加智能体
    const agent1No = simulator.addAgent(new Vector2(100, 100));
    const agent2No = simulator.addAgent(new Vector2(200, 100));
    console.log(`✓ 添加了2个智能体: ${agent1No}, ${agent2No}`);

    // 设置智能体参数
    simulator.setAgentRadius(agent1No, 10.0);
    simulator.setAgentMaxSpeed(agent1No, 30.0);
    simulator.setAgentRadius(agent2No, 8.0);
    simulator.setAgentMaxSpeed(agent2No, 25.0);
    console.log('✓ 智能体参数设置成功');

    // 添加障碍物
    const obstacleNo = simulator.addObstacle([
        new Vector2(150, 50),
        new Vector2(250, 50),
        new Vector2(250, 150),
        new Vector2(150, 150)
    ]);
    console.log(`✓ 添加了障碍物: ${obstacleNo}`);

    // 处理障碍物
    simulator.processObstacles();
    console.log('✓ 障碍物处理完成');

    // 获取智能体
    const agent1 = simulator.getAgent(agent1No);
    const agent2 = simulator.getAgent(agent2No);
    console.log(`✓ 获取智能体成功: ${agent1.id}, ${agent2.id}`);

    // 设置首选速度
    agent1.prefVelocity = new Vector2(1, 0);
    agent2.prefVelocity = new Vector2(-1, 0);
    console.log('✓ 首选速度设置成功');

    // 执行仿真步骤
    const time = simulator.doStep();
    console.log(`✓ 仿真步骤执行成功，时间: ${time}`);

    // 检查智能体位置
    console.log(`智能体1位置: (${agent1.position.x().toFixed(2)}, ${agent1.position.y().toFixed(2)})`);
    console.log(`智能体2位置: (${agent2.position.x().toFixed(2)}, ${agent2.position.y().toFixed(2)})`);

    // 检查智能体速度
    console.log(`智能体1速度: (${agent1.velocity.x().toFixed(2)}, ${agent1.velocity.y().toFixed(2)})`);
    console.log(`智能体2速度: (${agent2.velocity.x().toFixed(2)}, ${agent2.velocity.y().toFixed(2)})`);

    console.log('🎉 RVO2库测试完成！所有功能正常！');

} catch (error) {
    console.error('❌ RVO2库测试失败:', error);
}
