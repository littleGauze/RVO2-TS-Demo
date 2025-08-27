/**
 * RVO2 小球避障演示
 * 使用HTML5 Canvas展示RVO2算法的效果
 */

import { Simulator, Vector2 } from './index.js';

class RVO2Demo {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private simulator: Simulator;

    // 仿真状态
    private isRunning: boolean = true;
    private isPaused: boolean = false;
    private simulationTime: number = 0;
    private lastTime: number = 0;
    private fps: number = 0;
    private frameCount: number = 0;
    private lastFpsTime: number = 0;

    // 配置参数
    private agentCount: number = 15;
    private obstacleCount: number = 3;
    private simulationSpeed: number = 5;
    
    // RVO2算法参数
    private neighborDist: number = 30.0;
    private maxSpeed: number = 50.0;
    private radius: number = 8.0;
    
    // RVO2算法固定参数
    private readonly maxNeighbors: number = 10;
    private timeHorizon: number = 10.0;
    private timeHorizonObst: number = 10.0;

    // 目标点
    private targets: Vector2[] = [];

    // 预定义的内部障碍物位置（固定位置）
    private readonly predefinedObstaclePositions = [
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

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.simulator = Simulator.Instance;

        // 初始化
        this.init();
        this.setupEventListeners();
        this.startSimulation();
    }

    private init(): void {
        // 设置RVO2仿真器参数
        this.simulator.setAgentDefaults(
            this.neighborDist,   // neighborDist - 邻居检测距离
            this.maxNeighbors,   // maxNeighbors - 最大邻居数量
            this.timeHorizon,    // timeHorizon - 时间视野
            this.timeHorizonObst, // timeHorizonObst - 障碍物时间视野
            this.radius,    // radius - 智能体半径
            this.maxSpeed,   // maxSpeed - 最大速度
            new Vector2(0, 0)  // 初始速度
        );

        this.simulator.setTimeStep(0.1);
        this.createAgents();
        this.createObstacles();
        this.simulator.processObstacles();
    }

    private createAgents(): void {
        // 清空现有智能体
        this.simulator.clear();
        this.targets = [];

        // 重新设置默认参数（因为clear()会清空defaultAgent）
        this.simulator.setAgentDefaults(
            this.neighborDist,   // neighborDist - 邻居检测距离
            this.maxNeighbors,   // maxNeighbors - 最大邻居数量
            this.timeHorizon,    // timeHorizon - 时间视野
            this.timeHorizonObst, // timeHorizonObst - 障碍物时间视野
            this.radius,    // radius - 智能体半径
            this.maxSpeed,   // maxSpeed - 最大速度
            new Vector2(0, 0)  // 初始速度
        );

        // 创建智能体
        for (let i = 0; i < this.agentCount; ++i) {
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            const agentNo = this.simulator.addAgent(new Vector2(x, y));
            
            // 检查智能体是否成功创建
            if (agentNo >= 0) {
                            // 设置智能体参数
            this.simulator.setAgentRadius(agentNo, this.radius);
            this.simulator.setAgentMaxSpeed(agentNo, this.maxSpeed);
            this.simulator.setAgentNeighborDist(agentNo, this.neighborDist);
                this.simulator.setAgentMaxNeighbors(agentNo, this.maxNeighbors);
                this.simulator.setAgentTimeHorizon(agentNo, this.timeHorizon);
                this.simulator.setAgentTimeHorizonObst(agentNo, this.timeHorizonObst);
            } else {
                console.error(`智能体 ${i} 创建失败`);
            }

            // 创建随机目标点 - 使用统一的可用位置选择器
            const targetPos = this.getRandomFreePosition();
            this.targets.push(targetPos);
        }
    }

    private createObstacles(): void {
        // 创建边界障碍物（只在初始化时创建一次）
        this.createBoundaryObstacles();
        
        // 创建内部障碍物
        this.createInternalObstacles();
    }

    private createBoundaryObstacles(): void {
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

    private createInternalObstacles(): void {
        // 清除现有的内部障碍物（保留边界障碍物）
        this.clearInternalObstacles();
        
        // 创建内部障碍物（使用预定义位置）
        for (let i = 0; i < this.obstacleCount && i < this.predefinedObstaclePositions.length; ++i) {
            const pos = this.predefinedObstaclePositions[i];
            const size = pos.size;

            // 创建矩形障碍物
            this.simulator.addObstacle([
                new Vector2(pos.x - size/2, pos.y - size/2),
                new Vector2(pos.x + size/2, pos.y - size/2),
                new Vector2(pos.x + size/2, pos.y + size/2),
                new Vector2(pos.x - size/2, pos.y + size/2)
            ]);
        }
    }

    private clearInternalObstacles(): void {
        // 由于无法直接删除特定的障碍物，我们采用另一种方法：
        // 在createInternalObstacles中重新创建所有障碍物
        // 这里我们暂时不清除，让新的障碍物覆盖旧的
    }

    // 返回一个不与障碍物重叠且在有效边界内的随机位置
    private getRandomFreePosition(): Vector2 {
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

    private isPositionInObstacle(x: number, y: number): boolean {
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

    private setupEventListeners(): void {
        // 智能体数量滑块
        const agentSlider = document.getElementById('agentCount') as HTMLInputElement;
        const agentValueInput = document.getElementById('agentCountValue') as HTMLInputElement;
        agentSlider.addEventListener('input', (e) => {
            this.agentCount = parseInt((e.target as HTMLInputElement).value);
            agentValueInput.value = this.agentCount.toString();
            this.createAgents();
        });
        agentValueInput.addEventListener('input', (e) => {
            this.agentCount = parseInt((e.target as HTMLInputElement).value);
            agentSlider.value = this.agentCount.toString();
            this.createAgents();
        });

        // 障碍物数量滑块
        const obstacleSlider = document.getElementById('obstacleCount') as HTMLInputElement;
        const obstacleValueInput = document.getElementById('obstacleCountValue') as HTMLInputElement;
        obstacleSlider.addEventListener('input', (e) => {
            this.obstacleCount = parseInt((e.target as HTMLInputElement).value);
            obstacleValueInput.value = this.obstacleCount.toString();
            this.createObstacles();
        });
        obstacleValueInput.addEventListener('input', (e) => {
            this.obstacleCount = parseInt((e.target as HTMLInputElement).value);
            obstacleSlider.value = this.obstacleCount.toString();
            this.createObstacles();
        });

        // 仿真速度滑块
        const speedSlider = document.getElementById('simulationSpeed') as HTMLInputElement;
        const speedValueInput = document.getElementById('simulationSpeedValue') as HTMLInputElement;
        speedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt((e.target as HTMLInputElement).value);
            speedValueInput.value = this.simulationSpeed.toString();
        });
        speedValueInput.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt((e.target as HTMLInputElement).value);
            speedSlider.value = this.simulationSpeed.toString();
        });

        // 邻居检测距离滑块
        const neighborDistSlider = document.getElementById('neighborDist') as HTMLInputElement;
        const neighborDistValueInput = document.getElementById('neighborDistValue') as HTMLInputElement;
        neighborDistSlider.addEventListener('input', (e) => {
            this.neighborDist = parseFloat((e.target as HTMLInputElement).value);
            neighborDistValueInput.value = this.neighborDist.toString();
            this.updateAllAgentsParameters();
        });
        neighborDistValueInput.addEventListener('input', (e) => {
            this.neighborDist = parseFloat((e.target as HTMLInputElement).value);
            neighborDistSlider.value = this.neighborDist.toString();
            this.updateAllAgentsParameters();
        });

        // 最大速度滑块
        const maxSpeedSlider = document.getElementById('maxSpeed') as HTMLInputElement;
        const maxSpeedValueInput = document.getElementById('maxSpeedValue') as HTMLInputElement;
        maxSpeedSlider.addEventListener('input', (e) => {
            this.maxSpeed = parseFloat((e.target as HTMLInputElement).value);
            maxSpeedValueInput.value = this.maxSpeed.toString();
            this.updateAllAgentsParameters();
        });
        maxSpeedValueInput.addEventListener('input', (e) => {
            this.maxSpeed = parseFloat((e.target as HTMLInputElement).value);
            maxSpeedSlider.value = this.maxSpeed.toString();
            this.updateAllAgentsParameters();
        });

        // 智能体半径滑块
        const radiusSlider = document.getElementById('radius') as HTMLInputElement;
        const radiusValueInput = document.getElementById('radiusValue') as HTMLInputElement;
        radiusSlider.addEventListener('input', (e) => {
            this.radius = parseFloat((e.target as HTMLInputElement).value);
            radiusValueInput.value = this.radius.toString();
            this.updateAllAgentsParameters();
        });
        radiusValueInput.addEventListener('input', (e) => {
            this.radius = parseFloat((e.target as HTMLInputElement).value);
            radiusSlider.value = this.radius.toString();
            this.updateAllAgentsParameters();
        });

        // 障碍物时间视野滑块
        const timeHorizonObstSlider = document.getElementById('timeHorizonObst') as HTMLInputElement;
        const timeHorizonObstValueInput = document.getElementById('timeHorizonObstValue') as HTMLInputElement;
        timeHorizonObstSlider.addEventListener('input', (e) => {
            this.timeHorizonObst = parseFloat((e.target as HTMLInputElement).value);
            timeHorizonObstValueInput.value = this.timeHorizonObst.toString();
            this.updateAllAgentsParameters();
        });
        timeHorizonObstValueInput.addEventListener('input', (e) => {
            this.timeHorizonObst = parseFloat((e.target as HTMLInputElement).value);
            timeHorizonObstSlider.value = this.timeHorizonObst.toString();
            this.updateAllAgentsParameters();
        });

        // 智能体时间视野滑块
        const timeHorizonSlider = document.getElementById('timeHorizon') as HTMLInputElement;
        const timeHorizonValueInput = document.getElementById('timeHorizonValue') as HTMLInputElement;
        timeHorizonSlider.addEventListener('input', (e) => {
            this.timeHorizon = parseFloat((e.target as HTMLInputElement).value);
            timeHorizonValueInput.value = this.timeHorizon.toString();
            this.updateAllAgentsParameters();
        });
        timeHorizonValueInput.addEventListener('input', (e) => {
            this.timeHorizon = parseFloat((e.target as HTMLInputElement).value);
            timeHorizonSlider.value = this.timeHorizon.toString();
            this.updateAllAgentsParameters();
        });

        // 重置按钮
        const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        resetBtn.addEventListener('click', () => {
            this.resetSimulation();
        });

        // 暂停/继续按钮
        const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
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
            } else {
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

    private addAgentAt(x: number, y: number): void {
        // 确保默认参数已设置
        if (this.simulator.getNumAgents() === 0) {
            this.simulator.setAgentDefaults(
                this.neighborDist, this.maxNeighbors, this.timeHorizon, this.timeHorizonObst, this.radius, this.maxSpeed, new Vector2(0, 0)
            );
        }

        const agentNo = this.simulator.addAgent(new Vector2(x, y));
        
        // 检查智能体是否成功创建
        if (agentNo >= 0) {
            // 设置智能体参数
            this.simulator.setAgentRadius(agentNo, this.radius);
            this.simulator.setAgentMaxSpeed(agentNo, this.maxSpeed);
            this.simulator.setAgentNeighborDist(agentNo, this.neighborDist);
            this.simulator.setAgentMaxNeighbors(agentNo, this.maxNeighbors);
            this.simulator.setAgentTimeHorizon(agentNo, this.timeHorizon);
            this.simulator.setAgentTimeHorizonObst(agentNo, this.timeHorizonObst);

            // 创建随机目标点 - 使用统一的可用位置选择器
            const targetPos = this.getRandomFreePosition();
            this.targets.push(targetPos);

            this.agentCount++;
            this.updateUI();
        } else {
            console.error('智能体创建失败');
        }
    }

    private removeNearestAgent(x: number, y: number): void {
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

    private startSimulation(): void {
        this.lastTime = performance.now();
        this.animate();
    }

    private animate(): void {
        if (!this.isRunning) return;

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

    private updateSimulation(deltaTime: number): void {
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

    private render(): void {
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

    private drawGrid(): void {
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

    private drawObstacles(): void {
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
            this.ctx.arc(pos.x, pos.y, size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    private drawAgents(): void {
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

            // 绘制邻居检测范围（半透明圆圈）
            this.ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(agent.position.x(), agent.position.y(), this.neighborDist, 0, Math.PI * 2);
            this.ctx.stroke();

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

            // 绘制参数信息提示（当鼠标悬停时显示）
            if (this.isMouseOverAgent(agent.position.x(), agent.position.y())) {
                this.drawAgentInfo(agent, i);
            }
        }
    }

    private drawTargets(): void {
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

    private updateUI(): void {
        // 更新统计信息
        const currentAgentCountEl = document.getElementById('currentAgentCount') as HTMLElement;
        const currentObstacleCountEl = document.getElementById('currentObstacleCount') as HTMLElement;
        const simulationTimeEl = document.getElementById('simulationTime') as HTMLElement;
        const fpsEl = document.getElementById('fps') as HTMLElement;

        if (currentAgentCountEl) currentAgentCountEl.textContent = this.agentCount.toString();
        if (currentObstacleCountEl) currentObstacleCountEl.textContent = this.obstacleCount.toString();
        if (simulationTimeEl) simulationTimeEl.textContent = this.simulationTime.toFixed(1);
        if (fpsEl) fpsEl.textContent = this.fps.toFixed(0);

        // 更新RVO2参数显示
        const currentNeighborDistEl = document.getElementById('currentNeighborDist') as HTMLElement;
        const currentMaxSpeedEl = document.getElementById('currentMaxSpeed') as HTMLElement;
        const currentRadiusEl = document.getElementById('currentRadius') as HTMLElement;
        const currentTimeHorizonObstEl = document.getElementById('currentTimeHorizonObst') as HTMLElement;
        const currentTimeHorizonEl = document.getElementById('currentTimeHorizon') as HTMLElement;

        if (currentNeighborDistEl) currentNeighborDistEl.textContent = this.neighborDist.toFixed(1);
        if (currentMaxSpeedEl) currentMaxSpeedEl.textContent = this.maxSpeed.toFixed(1);
        if (currentRadiusEl) currentRadiusEl.textContent = this.radius.toFixed(1);
        if (currentTimeHorizonObstEl) currentTimeHorizonObstEl.textContent = this.timeHorizonObst.toFixed(1);
        if (currentTimeHorizonEl) currentTimeHorizonEl.textContent = this.timeHorizon.toFixed(1);

        // 更新FPS
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }

    /**
     * 更新所有现有智能体的RVO2参数
     */
    private updateAllAgentsParameters(): void {
        for (let i = 0; i < this.simulator.getNumAgents(); ++i) {
            this.simulator.setAgentRadius(i, this.radius);
            this.simulator.setAgentMaxSpeed(i, this.maxSpeed);
            this.simulator.setAgentNeighborDist(i, this.neighborDist);
            this.simulator.setAgentTimeHorizon(i, this.timeHorizon);
            this.simulator.setAgentTimeHorizonObst(i, this.timeHorizonObst);
        }
    }

    /**
     * 检查鼠标是否悬停在智能体上
     */
    private isMouseOverAgent(x: number, y: number): boolean {
        // 简化版本：暂时返回false，避免复杂的鼠标检测逻辑
        return false;
    }

    /**
     * 绘制智能体信息提示
     */
    private drawAgentInfo(agent: any, index: number): void {
        // 简化版本：暂时不实现，避免复杂的UI绘制逻辑
    }

    private resetSimulation(): void {
        this.simulationTime = 0;
        this.init();
    }

    private togglePause(): void {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
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
