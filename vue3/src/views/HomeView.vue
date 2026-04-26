<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="header-left">
        <div class="status-dot online"></div>
        <h1>无人碾压数字孪生系统</h1>
      </div>
      <div class="header-center">
        <span class="header-label">总进度</span>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: store.completionRate + '%' }"></div>
        </div>
        <span class="header-value">{{ store.completionRate }}%</span>
      </div>
      <div class="header-right">
        <span class="clock">{{ currentTime }}</span>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <aside class="panel left-panel">
        <!-- 设备列表 -->
        <section class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">📡</span> 设备状态
          </h3>
          <div class="device-list">
            <div
              v-for="device in store.devices"
              :key="device.id"
              class="device-card"
              :class="{ active: store.selectedDevice === device.id }"
              @click="store.selectedDevice = device.id"
            >
              <div class="device-header">
                <span class="status-dot" :class="device.status"></span>
                <span class="device-name">{{ device.name }}</span>
                <span class="device-id">{{ device.id }}</span>
              </div>
              <div class="device-stats">
                <div class="stat-item">
                  <span class="stat-label">电量</span>
                  <span class="stat-value" :class="{ low: device.battery < 30 }">
                    {{ device.battery }}%
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">速度</span>
                  <span class="stat-value">{{ device.speed }} km/h</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">振动</span>
                  <span class="stat-value">{{ device.vibration }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">温度</span>
                  <span class="stat-value" :class="{ high: device.temperature > 65 }">
                    {{ device.temperature }}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 告警信息 -->
        <section class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">⚠️</span> 告警信息
          </h3>
          <div class="alert-list">
            <div
              v-for="alert in store.alerts"
              :key="alert.id"
              class="alert-card"
              :class="alert.type"
            >
              <div class="alert-indicator"></div>
              <div class="alert-content">
                <span class="alert-message">{{ alert.message }}</span>
                <span class="alert-time">{{ alert.time }}</span>
              </div>
            </div>
          </div>
        </section>
      </aside>

      <!-- 中间 3D 场景 -->
      <main class="scene-container">
        <ThreeScene />
        <div class="scene-overlay">
          <span class="scene-label">3D 实时场景</span>
        </div>
      </main>

      <!-- 右侧面板 -->
      <aside class="panel right-panel">
        <!-- 作业进度 -->
        <section class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">📊</span> 作业进度
          </h3>
          <div class="progress-stats">
            <div class="progress-stat-item">
              <span class="progress-label">总面积</span>
              <span class="progress-value">{{ store.progress.totalArea }} m²</span>
            </div>
            <div class="progress-stat-item">
              <span class="progress-label">已完成</span>
              <span class="progress-value green">{{ store.progress.completedArea }} m²</span>
            </div>
            <div class="progress-stat-item">
              <span class="progress-label">碾压遍数</span>
              <span class="progress-value">
                {{ store.progress.completedPasses }}/{{ store.progress.requiredPasses }}
              </span>
            </div>
            <div class="progress-stat-item">
              <span class="progress-label">平均压实度</span>
              <span class="progress-value" :class="{ green: store.progress.avgCompaction >= 93 }">
                {{ store.progress.avgCompaction }}%
              </span>
            </div>
          </div>
          <div class="pass-progress">
            <div
              v-for="i in store.progress.requiredPasses"
              :key="i"
              class="pass-bar"
              :class="{ completed: i <= store.progress.completedPasses }"
            >
              第{{ i }}遍
            </div>
          </div>
        </section>

        <!-- 环境监测 -->
        <section class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">🌤️</span> 环境监测
          </h3>
          <div class="env-grid">
            <div class="env-item">
              <span class="env-icon">🌡️</span>
              <div class="env-info">
                <span class="env-label">气温</span>
                <span class="env-value">{{ store.environment.temperature }}°C</span>
              </div>
            </div>
            <div class="env-item">
              <span class="env-icon">💧</span>
              <div class="env-info">
                <span class="env-label">湿度</span>
                <span class="env-value">{{ store.environment.humidity }}%</span>
              </div>
            </div>
            <div class="env-item">
              <span class="env-icon">💨</span>
              <div class="env-info">
                <span class="env-label">风速</span>
                <span class="env-value">{{ store.environment.windSpeed }} m/s</span>
              </div>
            </div>
            <div class="env-item">
              <span class="env-icon">☀️</span>
              <div class="env-info">
                <span class="env-label">天气</span>
                <span class="env-value">{{ store.environment.weather }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 系统参数 -->
        <section class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">⚙️</span> 系统参数
          </h3>
          <div class="param-grid">
            <div class="param-item">
              <span class="param-label">目标振动</span>
              <span class="param-value">{{ store.systemParams.targetVibration }}%</span>
            </div>
            <div class="param-item">
              <span class="param-label">限速</span>
              <span class="param-value">{{ store.systemParams.maxSpeed }} km/h</span>
            </div>
            <div class="param-item">
              <span class="param-label">碾压遍数</span>
              <span class="param-value">{{ store.systemParams.passCount }}</span>
            </div>
            <div class="param-item">
              <span class="param-label">温度阈值</span>
              <span class="param-value">{{ store.systemParams.temperatureLimit }}°C</span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSystemStore } from '@/stores/system'
import ThreeScene from '@/components/ThreeScene.vue'

const store = useSystemStore()
const currentTime = ref('')
let timer: ReturnType<typeof setInterval>

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
}

/* 顶部标题栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 50px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header h1 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2px;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-bar-container {
  width: 200px;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.header-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-green);
  min-width: 40px;
}

.header-right {
  display: flex;
  align-items: center;
}

.clock {
  font-size: 14px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* 主内容 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 通用面板 */
.panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-panel {
  border-right: none;
  border-left: 1px solid var(--border-color);
}

.panel-section {
  padding: 14px;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.title-icon {
  font-size: 14px;
}

/* 状态指示灯 */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: var(--accent-green);
  box-shadow: 0 0 6px var(--accent-green);
}

.status-dot.offline {
  background: var(--text-muted);
}

.status-dot.warning {
  background: var(--accent-yellow);
  box-shadow: 0 0 6px var(--accent-yellow);
}

/* 设备卡片 */
.device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-card {
  padding: 10px;
  background: var(--bg-card);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.device-card:hover {
  background: var(--bg-card-hover);
}

.device-card.active {
  border-color: var(--accent-blue);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
}

.device-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.device-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.device-id {
  font-size: 10px;
  color: var(--text-muted);
  margin-left: auto;
}

.device-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value.low {
  color: var(--accent-red);
}

.stat-value.high {
  color: var(--accent-yellow);
}

/* 告警信息 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-card {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 6px;
  border-left: 3px solid var(--border-color);
}

.alert-card.warning {
  border-left-color: var(--accent-yellow);
}

.alert-card.error {
  border-left-color: var(--accent-red);
}

.alert-card.info {
  border-left-color: var(--accent-blue);
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-message {
  font-size: 11px;
  color: var(--text-primary);
}

.alert-time {
  font-size: 10px;
  color: var(--text-muted);
}

/* 3D 场景 */
.scene-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.scene-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  pointer-events: none;
}

.scene-label {
  font-size: 11px;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 10px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* 进度统计 */
.progress-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-stat-item {
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 6px;
}

.progress-label {
  font-size: 10px;
  color: var(--text-muted);
}

.progress-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-value.green {
  color: var(--accent-green);
}

/* 碾压遍数进度 */
.pass-progress {
  display: flex;
  gap: 4px;
}

.pass-bar {
  flex: 1;
  text-align: center;
  font-size: 10px;
  padding: 4px 2px;
  background: var(--bg-card);
  border-radius: 4px;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.pass-bar.completed {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-green);
  border-color: var(--accent-green);
}

/* 环境监测 */
.env-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.env-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 6px;
}

.env-icon {
  font-size: 18px;
}

.env-info {
  display: flex;
  flex-direction: column;
}

.env-label {
  font-size: 10px;
  color: var(--text-muted);
}

.env-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 系统参数 */
.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.param-item {
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 6px;
}

.param-label {
  font-size: 10px;
  color: var(--text-muted);
}

.param-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-cyan);
}
</style>
