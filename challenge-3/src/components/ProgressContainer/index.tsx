import { Box, Divider } from "@chakra-ui/react"
import IconFunctionalities from "../IconFunctionalites"
import ProgressIndicator from "../ProgressIndicator"

interface domain {
  progressPercentage: number
  clearAllItems: () => void
  copyAllItems: () => void
  removeAllUnavailable: () => void
  getBestDomains: () => void
}
export default function ProgressContainer({
  progressPercentage,
  clearAllItems,
  copyAllItems,
  removeAllUnavailable,
  getBestDomains,
}: domain) {
  return (
    <>
      {progressPercentage ? (
        <>
          <Box marginBottom="15px" marginTop="44px">
            <ProgressIndicator progressPercentage={progressPercentage} />
            <IconFunctionalities
              clearAllItems={clearAllItems}
              getBestDomains={getBestDomains}
              copyAllItems={copyAllItems}
              removeAllUnavailable={removeAllUnavailable}
            />
          </Box>

          <Divider />
        </>
      ) : null}
    </>
  )
}
