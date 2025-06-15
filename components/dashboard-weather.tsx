"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye } from "lucide-react"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  icon: string
}

export function DashboardWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 使用免费的 OpenWeatherMap API
        // 这里使用北京作为默认城市，你可以根据需要修改
        const API_KEY = "your_openweather_api_key" // 需要替换为实际的API密钥
        const city = "Beijing"

        // 由于这是演示，我们使用模拟数据
        // 在实际应用中，你需要注册 OpenWeatherMap 并获取 API 密钥
        const mockWeatherData: WeatherData = {
          location: "北京",
          temperature: Math.floor(Math.random() * 20) + 10, // 10-30度随机温度
          condition: ["晴朗", "多云", "小雨", "阴天"][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%湿度
          windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h风速
          visibility: Math.floor(Math.random() * 5) + 10, // 10-15km能见度
          icon: ["☀️", "⛅", "🌧️", "☁️"][Math.floor(Math.random() * 4)],
        }

        // 模拟API延迟
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setWeather(mockWeatherData)
        setLoading(false)
      } catch (err) {
        setError("获取天气信息失败")
        setLoading(false)
      }
    }

    fetchWeather()

    // 每30分钟更新一次天气
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "晴朗":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "多云":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "小雨":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      case "阴天":
        return <Cloud className="h-6 w-6 text-gray-600" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 10) return "text-blue-600 dark:text-blue-400"
    if (temp < 25) return "text-green-600 dark:text-green-400"
    return "text-red-600 dark:text-red-400"
  }

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{error || "天气信息暂不可用"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.condition)}
              <span className="font-medium text-blue-800 dark:text-blue-200">天气信息</span>
            </div>
            <span className="text-2xl">{weather.icon}</span>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getTemperatureColor(weather.temperature)} mb-1`}>
                {weather.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground">
                {weather.location} · {weather.condition}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">湿度</span>
                <span className="font-medium">{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">风速</span>
                <span className="font-medium">{weather.windSpeed}km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-muted-foreground">能见度</span>
                <span className="font-medium">{weather.visibility}km</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">体感</span>
                <span className="font-medium">{weather.temperature + Math.floor(Math.random() * 4 - 2)}°C</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
