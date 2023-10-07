import { useState } from "react"

const useProgress = () => {
  const [progressPercentage, setProgressPercentage] = useState<number>(0)
  return { progressPercentage, setProgressPercentage }
}

export default useProgress
