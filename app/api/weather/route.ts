import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const API_KEY = "99301065916a826fea3d0324e6366bd0"

  try {
    // 固定使用北京作为查询城市
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Beijing,CN&appid=${API_KEY}&units=metric&lang=zh_cn`

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 缓存30分钟
    })

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`)
    }

    const data = await response.json()

    // 转换为我们需要的格式
    const weatherData = {
      location: "北京",
      country: "中国",
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
