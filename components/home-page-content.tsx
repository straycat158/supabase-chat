import type React from "react"
import { ArrowRight } from "lucide-react"

interface HomePageContentProps {
  title: string
  subtitle: string
  imageUrl: string
  imageAlt: string
  buttonText: string
  buttonLink: string
}

const HomePageContent: React.FC<HomePageContentProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  buttonText,
  buttonLink,
}) => {
  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-gray-700 mb-6">{subtitle}</p>
          <a
            href={buttonLink}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            {buttonText}
            <ArrowRight className="ml-2" size={20} />
          </a>
        </div>
        <div>
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={imageAlt}
            className="rounded-lg shadow-md"
            width={500}
            height={300}
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default HomePageContent
