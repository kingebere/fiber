import { useClipboard, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"

const useCopy = (domainArray: { domain: string; status: boolean }[]) => {
  const toast = useToast()
  const [clipWork, setClipWork] = useState<string>("")
  const { onCopy, setValue } = useClipboard(clipWork || "")

  useEffect(() => {
    setValue(clipWork)
  }, [clipWork, setValue, domainArray])

  useEffect(() => {
    const domainObject: string[] = domainArray.map((item) => {
      return item.domain
    })
    const copiedDomain: string = domainObject.toString()
    setClipWork(copiedDomain)
  }, [domainArray])

  //for this function here, getting the copied string proved to be a problem
  //at first I thought it wasnt copying, then I realized it was getting the empty
  //string first , I had to click it again to get the string. Well, that isnt what we want
  //so I wemt digging for answers online , till I saw this github issue
  //https://github.com/chakra-ui/chakra-ui/issues/6759#issuecomment-1317646888
  //This didnt fix it , but it gave me a starter guide on what I needed to do
  //Since I decided to create the array when a new domain is added and it worked perfectly
  //Since I added that the initial state should be an empty string or the new state , it replaces the empty string when
  //  the effect run . Eureka!!!!!!
  //So now when you copy something from chrome and paste into chakra ui input field, it will work fine
  function copyAllItems() {
    setValue(clipWork)
    onCopy()
    toast({
      title: "Copied",
      status: "success",
      isClosable: true,
    })
  }

  return { clipWork, copyAllItems }
}

export default useCopy
