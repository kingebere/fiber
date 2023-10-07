import { useDisclosure } from "@chakra-ui/react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface domainArray {
  domain: string
  status: boolean
}
const useDomain = (
  setProgressPercentage: Dispatch<SetStateAction<number>>,
  maxDomains: number
) => {
  const [domainArray, setDomainArray] = useState<
    { domain: string; status: boolean }[]
  >([])
  const [domainDetail, setDomainCount] = useState<number>(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  //useEffect to update the number of domain in cart
  useEffect(() => {
    setDomainCount(domainArray.length)
  }, [domainArray.length])

  //gets full percentage status of the cart
  useEffect(() => {
    //added Math.floor to keep the numbers whole
    const getAvailablePercentage = Math.floor(
      (domainArray.length / maxDomains) * 100
    )
    setProgressPercentage(getAvailablePercentage)
  }, [domainArray.length, maxDomains, setProgressPercentage])

  //deletes selected domain from cart
  function deleteCart(data: string) {
    const filteredResult: domainArray[] = domainArray.filter(
      (item: { domain: string }) => item.domain !== data
    )
    setDomainArray(filteredResult)
    //closes the modal
    onClose()
  }

  //removes domain with unavilable status
  function removeAllUnavailable() {
    const filteredResult: domainArray[] = domainArray.filter(
      (item: { status: boolean }) => item.status !== false
    )
    setDomainArray(filteredResult)
  }

  //deletes every domain from cart
  function clearAllItems() {
    setDomainArray([])
  }

  function getBestDomains() {
    //Source - Chatgpt . Couldnt figure it out myself , so I needed a starter guide

    // Determine the "ranking" of a domain
    function getDomainRank(domain: string): number {
      const endings: string[] = [".com", ".app", ".xyz"]
      const endingIndex: number = endings.findIndex((ending) =>
        domain.endsWith(ending)
      )
      const length: number = domain.length
      return endingIndex * 1000 + length // Prioritize by ending, then length
    }

    // Sort the domainArray based on the ranking
    domainArray.sort(
      (a: { domain: string }, b: { domain: string }) =>
        getDomainRank(a.domain) - getDomainRank(b.domain)
    )

    // Keep only the first numDomainsRequired domains
    const bestDomains: domainArray[] = domainArray.slice(0, maxDomains)

    setDomainArray(bestDomains)
  }

  return {
    domainArray,
    setDomainArray,
    domainDetail,
    removeAllUnavailable,
    deleteCart,
    clearAllItems,
    getBestDomains,
    isOpen,
    onOpen,
    onClose,
  }
}

export default useDomain
