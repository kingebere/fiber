import { Progress } from "@chakra-ui/react"

interface domain {
  progressPercentage: number
}
export default function ProgressIndicator({ progressPercentage }: domain) {
  return (
    <>
      {/* I love the chakra stripes , so beautiful */}
      <Progress hasStripe value={progressPercentage} />
    </>
  )
}
