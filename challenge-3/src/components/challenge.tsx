import useCopy from "@/hooks/useCopy"
import useDomain from "@/hooks/useDomain"
import useProgress from "@/hooks/useProgress"
import { Box, useToast } from "@chakra-ui/react"
import CardContainer from "./CardContainer"
import CartFullStatus from "./CartFullStatus"
import DomainCount from "./DomainCount"
import Header from "./Header"
import ProgressContainer from "./ProgressContainer"

export interface ChallengeProps {
  /**
   * The maximum number of domains the user is allowed to have
   * in their cart. Invalid domains count toward this limit as well.
   */
  maxDomains: number
}

export function Challenge({ maxDomains }: ChallengeProps) {
  const toast = useToast()
  const { progressPercentage, setProgressPercentage } = useProgress()
  const {
    domainArray,
    setDomainArray,
    domainDetail,
    getBestDomains,
    removeAllUnavailable,
    deleteCart,
    clearAllItems,
    isOpen,
    onOpen,
    onClose,
  } = useDomain(setProgressPercentage, maxDomains)
  const { copyAllItems } = useCopy(domainArray)

  const submitHandler = async (data: { text: string }) => {
    const validExtensionsRegex = /\.(com|xyz|app)$/i // Added 'i' flag for case-insensitivity
    const endsWithValidExtension = validExtensionsRegex.test(data.text)

    try {
      if (endsWithValidExtension) {
        const wasDomainAdded = domainArray.some(
          (obj: { domain: string }) => data.text.toLowerCase() === obj.domain
        )

        if (!wasDomainAdded) {
          //Crawlee only works on the server , so placing the mock api on the clientside wouldnt work
          //So, I exported it into an API Route endpoint ,since you mentioned of course not to modify the function
          //That way the call would work
          //check their Site to confirm this . https://crawlee.dev
          //Here's a section from their site
          /**We believe websites are best scraped in the language they're written in. Crawlee
           * runs on Node.js and it's built in TypeScript to improve code completion in your IDE,
           * even if you don't use TypeScript yourself. */

          const download = await fetch("/api/getstatus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ domain: data.text.toLowerCase() }),
          })

          const isDomainAvailable = await download.json()

          //add domain object to the list of other domains in the array
          setDomainArray((prev: any) => {
            return [
              ...prev,
              {
                domain: data.text.toLowerCase(),
                status: isDomainAvailable.available,
              },
            ]
          })

          toast({
            title: "Added successfully",
            status: "success",
            isClosable: true,
          })
        } else {
          toast({
            title: "Already in Array",
            status: "error",
            isClosable: true,
          })
          throw new Error("Already in Array")
        }
      } else {
        throw new Error("Input does not end with a valid extension.")
      }
    } catch (error: any) {
      toast({
        title: error.message,
        status: "error",
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Box>
        <DomainCount maxDomains={maxDomains} domainDetail={domainDetail} />
        <Header submitHandler={submitHandler} />
        <ProgressContainer
          getBestDomains={getBestDomains}
          clearAllItems={clearAllItems}
          removeAllUnavailable={removeAllUnavailable}
          copyAllItems={copyAllItems}
          progressPercentage={progressPercentage}
        />
        <CartFullStatus domainArray={domainArray} maxDomains={maxDomains} />
        <CardContainer
          maxDomains={maxDomains}
          onClose={onClose}
          isOpen={isOpen}
          onOpen={onOpen}
          deleteCart={deleteCart}
          domainArray={domainArray}
        />
      </Box>
    </>
  )
}
