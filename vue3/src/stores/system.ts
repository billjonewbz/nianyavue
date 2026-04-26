import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DeviceInfo {
  id: string
  name: string
  status: 'online' | 'offline' | 'warning'
  battery: number
  speed: number
  vibration: number
  temperature: number
  latitude: number
  longitude: number
}

export interface AlertInfo {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  time: string
  deviceId: string
}

export interface SystemParams {
  targetVibration: number
  maxSpeed: number
  passCount: number
  temperatureLimit: number
}

export const useSystemStore = defineStore('system', () => {
  // 设备列表
  const devices = ref<DeviceInfo[]>([
    {
      id: 'R001',
      name: '压路机-01',
      status: 'online',
      battery: 85,
      speed: 3.5,
      vibration: 45,
      temperature: 62,
      latitude: 31.2304,
      longitude: 121.4737,
    },
    {
      id: 'R002',
      name: '压路机-02',
      status: 'online',
      battery: 72,
      speed: 2.8,
      vibration: 52,
      temperature: 58,
      latitude: 31.2310,
      longitude: 121.4742,
    },
    {
      id: 'R003',
      name: '压路机-03',
      status: 'warning',
      battery: 23,
      speed: 0,
      vibration: 0,
      temperature: 71,
      latitude: 31.2308,
      longitude: 121.4730,
    },
    {
      id: 'R004',
      name: '压路机-04',
      status: 'offline',
      battery: 0,
      speed: 0,
      vibration: 0,
      temperature: 25,
      latitude: 31.2315,
      longitude: 121.4748,
    },
  ])

  // 告警信息
  const alerts = ref<AlertInfo[]>([
    {
      id: 'A001',
      type: 'warning',
      message: '压路机-03 电池电量低（23%）',
      time: '14:32:05',
      deviceId: 'R003',
    },
    {
      id: 'A002',
      type: 'error',
      message: '压路机-03 温度过高（71°C）',
      time: '14:28:17',
      deviceId: 'R003',
    },
    {
      id: 'A003',
      type: 'info',
      message: '压路机-01 完成第3遍碾压',
      time: '14:25:43',
      deviceId: 'R001',
    },
    {
      id: 'A004',
      type: 'info',
      message: '压路机-02 开始碾压作业',
      time: '14:20:00',
      deviceId: 'R002',
    },
    {
      id: 'A005',
      type: 'warning',
      message: '压路机-04 通信中断',
      time: '13:55:22',
      deviceId: 'R004',
    },
  ])

  // 系统参数
  const systemParams = ref<SystemParams>({
    targetVibration: 50,
    maxSpeed: 5.0,
    passCount: 6,
    temperatureLimit: 75,
  })

  // 作业进度
  const progress = ref({
    totalArea: 5000,
    completedArea: 3250,
    completedPasses: 4,
    requiredPasses: 6,
    avgCompaction: 93.5,
  })

  // 环境数据
  const environment = ref({
    temperature: 28,
    humidity: 65,
    windSpeed: 3.2,
    weather: '晴',
  })

  const selectedDevice = ref<string | null>(null)

  const onlineDevices = computed(() =>
    devices.value.filter((d) => d.status === 'online')
  )

  const warningDevices = computed(() =>
    devices.value.filter((d) => d.status === 'warning')
  )

  const completionRate = computed(() =>
    Math.round((progress.value.completedArea / progress.value.totalArea) * 100)
  )

  return {
    devices,
    alerts,
    systemParams,
    progress,
    environment,
    selectedDevice,
    onlineDevices,
    warningDevices,
    completionRate,
  }
})
