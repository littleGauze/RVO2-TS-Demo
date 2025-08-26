/**
 * RVO2 小球避障演示
 * 使用HTML5 Canvas展示RVO2算法的效果
 */
import { Simulator, Vector2 } from './index.js';
class RVO2Demo {
    constructor() {
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
        // 预定义的内部障碍物位置（固定位置）
        this.predefinedObstaclePositions = [
            { x: 200, y: 150, size: 50 },
            { x: 400, y: 200, size: 60 },
            { x: 300, y: 350, size: 45 },
            { x: 500, y: 300, size: 55 },
            { x: 150, y: 400, size: 40 },
            { x: 450, y: 100, size: 65 },
            { x: 250, y: 250, size: 50 },
            { x: 350, y: 450, size: 55 },
            { x: 550, y: 200, size: 45 },
            { x: 100, y: 300, size: 60 }
        ];
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.simulator = Simulator.Instance;
        // 初始化
        this.init();
        this.setupEventListeners();
        this.startSimulation();
    }
    init() {
        // 设置RVO2仿真器参数
        this.simulator.setAgentDefaults(30.0, // neighborDist - 邻居检测距离
        10, // maxNeighbors - 最大邻居数量
        10.0, // timeHorizon - 时间视野
        10.0, // timeHorizonObst - 障碍物时间视野
        8.0, // radius - 智能体半径
        50.0, // maxSpeed - 最大速度
        new Vector2(0, 0) // 初始速度
        );
        this.simulator.setTimeStep(0.1);
        this.createAgents();
        this.createObstacles();
        this.simulator.processObstacles();
    }
    createAgents() {
        // 清空现有智能体
        this.simulator.clear();
        this.targets = [];
        // 重新设置默认参数（因为clear()会清空defaultAgent）
        this.simulator.setAgentDefaults(30.0, // neighborDist - 邻居检测距离
        10, // maxNeighbors - 最大邻居数量
        10.0, // timeHorizon - 时间视野
        10.0, // timeHorizonObst - 障碍物时间视野
        8.0, // radius - 智能体半径
        50.0, // maxSpeed - 最大速度
        new Vector2(0, 0) // 初始速度
        );
        // 创建智能体
        for (let i = 0; i < this.agentCount; ++i) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            const agentNo = this.simulator.addAgent(new Vector2(x, y));
            // 检查智能体是否成功创建
            if (agentNo >= 0) {
                // 设置智能体参数
                this.simulator.setAgentRadius(agentNo, 8.0);
                this.simulator.setAgentMaxSpeed(agentNo, 50.0);
                this.simulator.setAgentNeighborDist(agentNo, 30.0);
                this.simulator.setAgentMaxNeighbors(agentNo, 10);
                this.simulator.setAgentTimeHorizon(agentNo, 10.0);
                this.simulator.setAgentTimeHorizonObst(agentNo, 10.0);
            }
            else {
                console.error(`智能体 ${i} 创建失败`);
            }
            // 创建随机目标点 - 使用统一的可用位置选择器
            const targetPos = this.getRandomFreePosition();
            this.targets.push(targetPos);
        }
    }
    createObstacles() {
        // 创建边界障碍物（只在初始化时创建一次）
        this.createBoundaryObstacles();
        // 创建内部障碍物
        this.createInternalObstacles();
    }
    createBoundaryObstacles() {
        // 检查是否已经创建了边界障碍物
        if (this.simulator.getNumObstacleVertices() > 0) {
            return; // 边界障碍物已存在，不需要重复创建
        }
        const margin = 20;
        const width = this.canvas.width;
        const height = this.canvas.height;
        // 上边界
        this.simulator.addObstacle([
            new Vector2(margin, margin),
            new Vector2(width - margin, margin)
        ]);
        // 右边界
        this.simulator.addObstacle([
            new Vector2(width - margin, margin),
            new Vector2(width - margin, height - margin)
        ]);
        // 下边界
        this.simulator.addObstacle([
            new Vector2(width - margin, height - margin),
            new Vector2(margin, height - margin)
        ]);
        // 左边界
        this.simulator.addObstacle([
            new Vector2(margin, height - margin),
            new Vector2(margin, margin)
        ]);
    }
    createInternalObstacles() {
        // 清除现有的内部障碍物（保留边界障碍物）
        this.clearInternalObstacles();
        // 创建内部障碍物（使用预定义位置）
        for (let i = 0; i < this.obstacleCount && i < this.predefinedObstaclePositions.length; ++i) {
            const pos = this.predefinedObstaclePositions[i];
            const size = pos.size;
            // 创建矩形障碍物
            this.simulator.addObstacle([
                new Vector2(pos.x - size / 2, pos.y - size / 2),
                new Vector2(pos.x + size / 2, pos.y - size / 2),
                new Vector2(pos.x + size / 2, pos.y + size / 2),
                new Vector2(pos.x - size / 2, pos.y + size / 2)
            ]);
        }
    }
    clearInternalObstacles() {
        // 由于无法直接删除特定的障碍物，我们采用另一种方法：
        // 在createInternalObstacles中重新创建所有障碍物
        // 这里我们暂时不清除，让新的障碍物覆盖旧的
    }
    // 返回一个不与障碍物重叠且在有效边界内的随机位置
    getRandomFreePosition() {
        const maxAttempts = 200;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            if (!this.isPositionInObstacle(x, y)) {
                return new Vector2(x, y);
            }
        }
        // 兜底：网格扫描寻找第一个可用点
        const step = 20;
        for (let yy = 50; yy <= this.canvas.height - 50; yy += step) {
            for (let xx = 50; xx <= this.canvas.width - 50; xx += step) {
                if (!this.isPositionInObstacle(xx, yy)) {
                    return new Vector2(xx, yy);
                }
            }
        }
        // 极端兜底：返回画布中心
        return new Vector2(this.canvas.width * 0.5, this.canvas.height * 0.5);
    }
    isPositionInObstacle(x, y) {
        // 检查是否在边界障碍物内
        const margin = 20;
        if (x < margin || x > this.canvas.width - margin ||
            y < margin || y > this.canvas.height - margin) {
            return true;
        }
        // 检查是否在内部障碍物内
        for (let i = 0; i < this.obstacleCount && i < this.predefinedObstaclePositions.length; ++i) {
            const pos = this.predefinedObstaclePositions[i];
            const size = pos.size;
            // 计算到障碍物中心的距离
            const dx = x - pos.x;
            const dy = y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // 如果距离小于障碍物半径，则认为在障碍物内
            if (distance < size / 2) {
                return true;
            }
        }
        return false;
    }
    setupEventListeners() {
        // 智能体数量滑块
        const agentSlider = document.getElementById('agentCount');
        agentSlider.addEventListener('input', (e) => {
            this.agentCount = parseInt(e.target.value);
            this.createAgents();
        });
        // 障碍物数量滑块
        const obstacleSlider = document.getElementById('obstacleCount');
        obstacleSlider.addEventListener('input', (e) => {
            this.obstacleCount = parseInt(e.target.value);
            this.createObstacles();
        });
        // 仿真速度滑块
        const speedSlider = document.getElementById('simulationSpeed');
        speedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
        });
        // 重置按钮
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.addEventListener('click', () => {
            this.resetSimulation();
        });
        // 暂停/继续按钮
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
        // 鼠标点击添加/删除智能体
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (e.ctrlKey || e.metaKey) {
                // Ctrl+点击删除最近的智能体
                this.removeNearestAgent(x, y);
            }
            else {
                // 普通点击添加智能体
                this.addAgentAt(x, y);
            }
        });
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
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
    addAgentAt(x, y) {
        // 确保默认参数已设置
        if (this.simulator.getNumAgents() === 0) {
            this.simulator.setAgentDefaults(30.0, 10, 10.0, 10.0, 8.0, 50.0, new Vector2(0, 0));
        }
        const agentNo = this.simulator.addAgent(new Vector2(x, y));
        // 检查智能体是否成功创建
        if (agentNo >= 0) {
            // 设置智能体参数
            this.simulator.setAgentRadius(agentNo, 8.0);
            this.simulator.setAgentMaxSpeed(agentNo, 50.0);
            this.simulator.setAgentNeighborDist(agentNo, 30.0);
            this.simulator.setAgentMaxNeighbors(agentNo, 10);
            this.simulator.setAgentTimeHorizon(agentNo, 10.0);
            this.simulator.setAgentTimeHorizonObst(agentNo, 10.0);
            // 创建随机目标点 - 使用统一的可用位置选择器
            const targetPos = this.getRandomFreePosition();
            this.targets.push(targetPos);
            this.agentCount++;
            this.updateUI();
        }
        else {
            console.error('智能体创建失败');
        }
    }
    removeNearestAgent(x, y) {
        let nearestIndex = -1;
        let minDist = Number.MAX_VALUE;
        for (let i = 0; i < this.simulator.getNumAgents(); ++i) {
            const agent = this.simulator.getAgent(i);
            const dist = agent.position.subtract(new Vector2(x, y)).length();
            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }
        if (nearestIndex >= 0 && minDist < 50) {
            // 注意：Simulator没有removeAgent方法，我们只能清空并重新创建
            // 这里我们暂时不清除，只是减少计数
            this.targets.splice(nearestIndex, 1);
            this.agentCount--;
            this.updateUI();
        }
    }
    startSimulation() {
        this.lastTime = performance.now();
        this.animate();
    }
    animate() {
        if (!this.isRunning)
            return;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        if (!this.isPaused) {
            this.updateSimulation(deltaTime);
        }
        this.render();
        this.updateUI();
        requestAnimationFrame(() => this.animate());
    }
    updateSimulation(deltaTime) {
        this.simulationTime += deltaTime * 0.001 * this.simulationSpeed;
        // 更新智能体目标
        for (let i = 0; i < this.simulator.getNumAgents(); ++i) {
            const agent = this.simulator.getAgent(i);
            const target = this.targets[i];
            if (target) {
                // 计算到目标的距离
                const toTarget = target.subtract(agent.position);
                const distToTarget = toTarget.length();
                // 如果到达目标，创建新目标 - 使用统一的可用位置选择器
                if (distToTarget < 20) {
                    this.targets[i] = this.getRandomFreePosition();
                }
                // 设置首选速度
                if (distToTarget > 0) {
                    const maxSpeed = this.simulator.getAgentMaxSpeed(i);
                    agent.prefVelocity = toTarget.normalize().multiply(maxSpeed);
                }
            }
        }
        // 执行RVO2仿真步骤
        this.simulator.doStep();
    }
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制网格
        this.drawGrid();
        // 绘制障碍物
        this.drawObstacles();
        // 先绘制目标点（在小球下面）
        this.drawTargets();
        // 再绘制智能体（在目标点上面）
        this.drawAgents();
    }
    drawGrid() {
        this.ctx.strokeStyle = '#f0f0f0';
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
    drawObstacles() {
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        // 绘制边界障碍物（简单的矩形）
        const margin = 20;
        const width = this.canvas.width;
        const height = this.canvas.height;
        // 绘制边界
        this.ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
        // 绘制内部障碍物（使用与createInternalObstacles相同的固定位置）
        for (let i = 0; i < this.obstacleCount && i < this.predefinedObstaclePositions.length; ++i) {
            const pos = this.predefinedObstaclePositions[i];
            const size = pos.size;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    drawAgents() {
        for (let i = 0; i < this.simulator.getNumAgents(); ++i) {
            const agent = this.simulator.getAgent(i);
            const speed = agent.velocity.length();
            const maxSpeed = this.simulator.getAgentMaxSpeed(i);
            // 根据速度设置颜色
            const speedRatio = Math.min(speed / maxSpeed, 1.0);
            const hue = 120 - speedRatio * 60; // 绿色到红色
            this.ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            // 绘制智能体
            const radius = this.simulator.getAgentRadius(i);
            this.ctx.beginPath();
            this.ctx.arc(agent.position.x(), agent.position.y(), radius, 0, Math.PI * 2);
            this.ctx.fill();
            // 绘制速度向量
            if (speed > 0.1) {
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(agent.position.x(), agent.position.y());
                const velocityEnd = agent.position.add(agent.velocity.multiply(0.1));
                this.ctx.lineTo(velocityEnd.x(), velocityEnd.y());
                this.ctx.stroke();
            }
            // 绘制ID - 增强可见性
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            // 绘制文本阴影以提高可读性
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            // 绘制文本
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(i.toString(), agent.position.x(), agent.position.y());
            // 重置阴影
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }
    }
    drawTargets() {
        for (let i = 0; i < this.targets.length; ++i) {
            const target = this.targets[i];
            // 绘制目标圆圈 - 填充颜色和边框颜色相同
            this.ctx.fillStyle = '#ff6600';
            this.ctx.strokeStyle = '#ff6600';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(target.x(), target.y(), 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            // 绘制目标ID - 使用白色文本
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            // 绘制文本
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(i.toString(), target.x(), target.y());
        }
    }
    updateUI() {
        // 更新统计信息
        const currentAgentCountEl = document.getElementById('currentAgentCount');
        const currentObstacleCountEl = document.getElementById('currentObstacleCount');
        const simulationTimeEl = document.getElementById('simulationTime');
        const fpsEl = document.getElementById('fps');
        if (currentAgentCountEl)
            currentAgentCountEl.textContent = this.agentCount.toString();
        if (currentObstacleCountEl)
            currentObstacleCountEl.textContent = this.obstacleCount.toString();
        if (simulationTimeEl)
            simulationTimeEl.textContent = this.simulationTime.toFixed(1);
        if (fpsEl)
            fpsEl.textContent = this.fps.toFixed(0);
        // 更新FPS
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }
    resetSimulation() {
        this.simulationTime = 0;
        this.init();
    }
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
    }
}
// 等待页面加载完成后启动演示
document.addEventListener('DOMContentLoaded', () => {
    try {
        new RVO2Demo();
        console.log('RVO2演示启动成功！');
    }
    catch (error) {
        console.error('RVO2演示启动失败:', error);
        alert('演示启动失败，请检查控制台错误信息');
    }
});
//# sourceMappingURL=demo.js.map