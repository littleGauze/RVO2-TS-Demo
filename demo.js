/**
 * RVO2 小球避障演示
 * 使用HTML5 Canvas展示RVO2算法的效果
 */

import { Simulator, Vector2 } from './index.js';

class RVO2Demo {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.simulator = Simulator.Instance;
        
        // 仿真状态
        this.isRunning = true;
        this.isPaused = false;
        this.simulationTime = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsTime = 0;
        
        // 配置参数
        this.agentCount = 15;
        this.obstacleCount = 3;
        this.simulationSpeed = 5;
        
        // 目标点
        this.targets = [];
        
        // 初始化
        this.init();
        this.setupEventListeners();
        this.startSimulation();
    }
    
    init() {
        // 设置RVO2仿真器参数
        this.simulator.setAgentDefaults(
            30.0,   // neighborDist - 邻居检测距离
            10,     // maxNeighbors - 最大邻居数量
            10.0,   // timeHorizon - 时间视野
            10.0,   // timeHorizonObst - 障碍物时间视野
            8.0,    // radius - 智能体半径
            50.0,   // maxSpeed - 最大速度
            new Vector2(0, 0)  // 初始速度
        );
        
        this.simulator.setTimeStep(0.1);
        this.createAgents();
        this.createObstacles();
        this.simulator.processObstacles();
    }
    
    createAgents() {
        this.simulator.clear();
        this.targets = [];
        
        // 重新设置默认参数
        this.simulator.setAgentDefaults(
            30.0, 10, 10.0, 10.0, 8.0, 50.0, new Vector2(0, 0)
        );
        
        for (let i = 0; i < this.agentCount; i++) {
            // 随机位置，避免边缘
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            
            const agentId = this.simulator.addAgent(new Vector2(x, y));
            
            // 为每个智能体设置随机目标
            const targetX = Math.random() * (this.canvas.width - 100) + 50;
            const targetY = Math.random() * (this.canvas.height - 100) + 50;
            this.targets.push(new Vector2(targetX, targetY));
        }
    }
    
    createObstacles() {
        // 清除现有障碍物
        this.simulator.clear();
        this.createAgents(); // 重新创建智能体
        
        if (this.obstacleCount === 0) return;
        
        // 创建随机障碍物
        for (let i = 0; i < this.obstacleCount; i++) {
            const centerX = Math.random() * (this.canvas.width - 200) + 100;
            const centerY = Math.random() * (this.canvas.height - 200) + 100;
            const size = Math.random() * 60 + 40;
            
            // 创建矩形障碍物
            const vertices = [
                new Vector2(centerX - size/2, centerY - size/2),
                new Vector2(centerX + size/2, centerY - size/2),
                new Vector2(centerX + size/2, centerY + size/2),
                new Vector2(centerX - size/2, centerY + size/2)
            ];
            
            this.simulator.addObstacle(vertices);
        }
        
        this.simulator.processObstacles();
    }
    
    setupEventListeners() {
        // 控制滑块事件
        const agentCountSlider = document.getElementById('agentCount');
        const agentCountValue = document.getElementById('agentCountValue');
        const obstacleCountSlider = document.getElementById('obstacleCount');
        const obstacleCountValue = document.getElementById('obstacleCountValue');
        const simulationSpeedSlider = document.getElementById('simulationSpeed');
        const simulationSpeedValue = document.getElementById('simulationSpeed');
        
        // 同步滑块和数值输入
        agentCountSlider.addEventListener('input', (e) => {
            this.agentCount = parseInt(e.target.value);
            agentCountValue.value = this.agentCount;
            this.createAgents();
        });
        
        agentCountValue.addEventListener('change', (e) => {
            this.agentCount = parseInt(e.target.value);
            agentCountSlider.value = this.agentCount;
            this.createAgents();
        });
        
        obstacleCountSlider.addEventListener('input', (e) => {
            this.obstacleCount = parseInt(e.target.value);
            obstacleCountValue.value = this.obstacleCount;
            this.createObstacles();
        });
        
        obstacleCountValue.addEventListener('change', (e) => {
            this.obstacleCount = parseInt(e.target.value);
            obstacleCountSlider.value = this.obstacleCount;
            this.createObstacles();
        });
        
        simulationSpeedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
            simulationSpeedValue.value = this.simulationSpeed;
        });
        
        simulationSpeedValue.addEventListener('change', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
            simulationSpeedSlider.value = this.simulationSpeed;
        });
        
        // 按钮事件
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSimulation();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // 鼠标点击添加智能体
        this.canvas.addEventListener('click', (e) => {
            this.addAgentAtClick(e);
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.resetSimulation();
                    break;
            }
        });
    }
    
    addAgentAtClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击在智能体上
        for (let i = 0; i < this.simulator.getNumAgents(); i++) {
            const pos = this.simulator.getAgentPosition(i);
            const distance = Math.sqrt((x - pos.x())**2 + (y - pos.y())**2);
            if (distance < 20) {
                // 点击在智能体上，移除它
                this.removeAgent(i);
                return;
            }
        }
        
        // 添加新智能体
        const agentId = this.simulator.addAgent(new Vector2(x, y));
        
        // 设置随机目标
        const targetX = Math.random() * (this.canvas.width - 100) + 50;
        const targetY = Math.random() * (this.canvas.height - 100) + 50;
        this.targets.push(new Vector2(targetX, targetY));
        
        this.agentCount++;
        this.updateStats();
    }
    
    removeAgent(index) {
        // 简化版本：重新创建所有智能体，跳过要删除的
        const currentAgents = [];
        const currentTargets = [];
        
        for (let i = 0; i < this.simulator.getNumAgents(); i++) {
            if (i !== index) {
                const pos = this.simulator.getAgentPosition(i);
                currentAgents.push(pos);
                currentTargets.push(this.targets[i]);
            }
        }
        
        this.simulator.clear();
        this.createAgents();
        
        // 重新设置位置和目标
        for (let i = 0; i < currentAgents.length; i++) {
            this.simulator.setAgentPosition(i, currentAgents[i]);
            this.targets[i] = currentTargets[i];
        }
        
        this.agentCount--;
        this.updateStats();
    }
    
    resetSimulation() {
        this.simulationTime = 0;
        this.createAgents();
        this.createObstacles();
        this.updateStats();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
    }
    
    updateStats() {
        document.getElementById('currentAgentCount').textContent = this.simulator.getNumAgents();
        document.getElementById('currentObstacleCount').textContent = this.obstacleCount;
        document.getElementById('simulationTime').textContent = this.simulationTime.toFixed(1);
        document.getElementById('fps').textContent = this.fps;
    }
    
    updateSimulation(deltaTime) {
        if (this.isPaused) return;
        
        // 根据仿真速度调整时间步长
        const timeStep = deltaTime * this.simulationSpeed / 1000;
        
        // 更新RVO2仿真
        for (let i = 0; i < this.simulator.getNumAgents(); i++) {
            const agent = this.simulator.getAgent(i);
            const currentPos = agent.position;
            const target = this.targets[i];
            
            // 计算到目标的向量
            const toTarget = target.subtract(currentPos);
            const distance = Math.sqrt(toTarget.x()**2 + toTarget.y()**2);
            
            if (distance > 10) {
                // 设置首选速度（朝向目标）
                const normalizedDirection = toTarget.divide(distance);
                const preferredVelocity = normalizedDirection.multiply(agent.maxSpeed);
                this.simulator.setAgentPrefVelocity(i, preferredVelocity);
            } else {
                // 到达目标，设置新的随机目标
                const newTargetX = Math.random() * (this.canvas.width - 100) + 50;
                const newTargetY = Math.random() * (this.canvas.height - 100) + 50;
                this.targets[i] = new Vector2(newTargetX, newTargetY);
            }
        }
        
        // 执行RVO2仿真步
        this.simulator.doStep();
        this.simulationTime += this.simulator.getTimeStep();
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制障碍物
        this.renderObstacles();
        
        // 绘制目标点
        this.renderTargets();
        
        // 绘制智能体
        this.renderAgents();
        
        // 绘制网格（可选）
        this.renderGrid();
    }
    
    renderObstacles() {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.obstacleCount; i++) {
            const obstacle = this.simulator.getObstacle(i);
            if (obstacle) {
                this.ctx.beginPath();
                this.ctx.arc(obstacle.point.x(), obstacle.point.y(), 20, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
    
    renderTargets() {
        this.ctx.fillStyle = '#3498db';
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.targets.length; i++) {
            const target = this.targets[i];
            this.ctx.beginPath();
            this.ctx.arc(target.x(), target.y(), 5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    renderAgents() {
        for (let i = 0; i < this.simulator.getNumAgents(); i++) {
            const agent = this.simulator.getAgent(i);
            const pos = agent.position;
            const vel = agent.velocity;
            
            // 根据速度计算颜色
            const speed = Math.sqrt(vel.x()**2 + vel.y()**2);
            const maxSpeed = agent.maxSpeed;
            const speedRatio = Math.min(speed / maxSpeed, 1.0);
            
            // 从绿色到红色的渐变
            const r = Math.floor(255 * speedRatio);
            const g = Math.floor(255 * (1 - speedRatio));
            const b = 0;
            
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            
            // 绘制智能体
            this.ctx.beginPath();
            this.ctx.arc(pos.x(), pos.y(), agent.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // 绘制速度向量
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x(), pos.y());
            this.ctx.lineTo(pos.x() + vel.x() * 0.5, pos.y() + vel.y() * 0.5);
            this.ctx.stroke();
            
            // 绘制智能体ID
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(i.toString(), pos.x(), pos.y() - agent.radius - 5);
        }
    }
    
    renderGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }
    
    gameLoop(currentTime) {
        if (!this.lastTime) {
            this.lastTime = currentTime;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新FPS
        this.updateFPS(currentTime);
        
        // 更新仿真
        this.updateSimulation(deltaTime);
        
        // 渲染
        this.render();
        
        // 更新统计信息
        this.updateStats();
        
        // 继续循环
        if (this.isRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    startSimulation() {
        this.isRunning = true;
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    stopSimulation() {
        this.isRunning = false;
    }
}

// 等待页面加载完成后启动演示
document.addEventListener('DOMContentLoaded', () => {
    try {
        new RVO2Demo();
        console.log('RVO2演示启动成功！');
    } catch (error) {
        console.error('RVO2演示启动失败:', error);
        alert('演示启动失败，请检查控制台错误信息');
    }
});
