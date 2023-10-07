import { Flex, Spacer } from "@chakra-ui/react"
import BestDomains from "../BestDomains"
import ClearCart from "../ClearCart"
import CopyCart from "../CopyCart"
import RemoveUnavailable from "../RemoveUnavailable"

interface domain {
  clearAllItems: () => void
  copyAllItems: () => void
  removeAllUnavailable: () => void
  getBestDomains: () => void
}
export default function IconFunctionalities({
  clearAllItems,
  copyAllItems,
  removeAllUnavailable,
  getBestDomains,
}: domain) {
  return (
    <>
      <Flex marginTop="12px" marginBottom="2px">
        <RemoveUnavailable removeAllUnavailable={removeAllUnavailable} />
        <Spacer />
        <ClearCart clearAllItems={clearAllItems} />
        <Spacer />
        <CopyCart copyAllItems={copyAllItems} />
        <Spacer />
        <BestDomains getBestDomains={getBestDomains} />
      </Flex>
    </>
  )
}
