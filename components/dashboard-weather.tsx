"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  MapPin,
  RefreshCw,
  Sunrise,
  Sunset,
} from "lucide-react"

interface WeatherData {
  location: string
  country: string
  temperature: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  icon: string
  weatherId: number
  sunrise: number
  sunset: number
}

export function DashboardWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchWeather = async (lat?: number, lon?: number) => {
    setLoading(true)
    setError(null)

    try {
      let url = "/api/weather"

      if (lat && lon) {
        url += `?lat=${lat}&lon=${lon}`
      } else {
        // 默认使用北京
        url += "?city=Beijing"
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("获取天气数据失败")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setWeather(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取天气信息失败")
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lon: longitude })
          fetchWeather(latitude, longitude)
        },
        (error) => {
          console.error("获取位置失败:", error)
          // 如果获取位置失败，使用默认城市
          fetchWeather()
        },
      )
    } else {
      // 浏览器不支持地理位置，使用默认城市
      fetchWeather()
    }
  }

  useEffect(() => {
    getCurrentLocation()

    // 每30分钟更新一次天气
    const interval = setInterval(
      () => {
        if (location) {
          fetchWeather(location.lat, location.lon)
        } else {
          fetchWeather()
        }
      },
      30 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [location])

  const getWeatherIcon = (weatherId: number, icon: string) => {
    // 根据天气ID返回对应的图标
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudRain className="h-6 w-6 text-purple-500" />
    } else if (weatherId >= 300 && weatherId < 600) {
      return <CloudRain className="h-6 w-6 text-blue-500" />
    } else if (weatherId >= 600 && weatherId < 700) {
      return <Cloud className="h-6 w-6 text-gray-400" />
    } else if (weatherId >= 700 && weatherId < 800) {
      return <Cloud className="h-6 w-6 text-gray-500" />
    } else if (weatherId === 800) {
      return <Sun className="h-6 w-6 text-yellow-500" />
    } else {
      return <Cloud className="h-6 w-6 text-gray-500" />
    }
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return "text-blue-700 dark:text-blue-300"
    if (temp < 10) return "text-blue-600 dark:text-blue-400"
    if (temp < 25) return "text-green-600 dark:text-green-400"
    if (temp < 35) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleRefresh = () => {
    if (location) {
      fetchWeather(location.lat, location.lon)
    } else {
      fetchWeather()
    }
  }

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-blue-600 dark:text-blue-400">获取天气中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <Cloud className="h-12 w-12 mx-auto mb-3 opacity-50 text-gray-400" />
            <p className="text-sm text-muted-foreground mb-3">{error || "天气信息暂不可用"}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="border-gray-300 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
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
              {getWeatherIcon(weather.weatherId, weather.icon)}
              <span className="font-medium text-blue-800 dark:text-blue-200">实时天气</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getTemperatureColor(weather.temperature)} mb-1`}>
                {weather.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {weather.location}, {weather.country}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">{weather.condition}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">体感</span>
                <span className="font-medium">{weather.feelsLike}°C</span>
              </div>
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
                <Sunrise className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">日出</span>
                <span className="font-medium">{formatTime(weather.sunrise)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">日落</span>
                <span className="font-medium">{formatTime(weather.sunset)}</span>
              </div>
            </div>

            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
                最后更新: {lastUpdated.toLocaleTimeString("zh-CN")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
