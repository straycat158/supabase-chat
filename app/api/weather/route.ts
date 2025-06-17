import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const city = searchParams.get("city") || "Beijing"

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  if (!API_KEY) {
    return NextResponse.json({ error: "API密钥未配置" }, { status: 500 })
  }

  try {
    let url = ""

    if (lat && lon) {
      // 使用经纬度获取天气
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_cn`
    } else {
      // 使用城市名获取天气
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`)
    }

    const data = await response.json()

    // 转换为我们需要的格式
    const weatherData = {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // 转换为 km/h
      visibility: Math.round(data.visibility / 1000), // 转换为 km
      pressure: data.main.pressure,
      icon: data.weather[0].icon,
      weatherId: data.weather[0].id,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("获取天气数据失败:", error)
    return NextResponse.json({ error: "获取天气数据失败" }, { status: 500 })
  }
}
