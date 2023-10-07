import { Circle, HStack } from "@chakra-ui/react"

interface domain {
  domainDetail: number
  maxDomains: number
}
export default function DomainCount({ domainDetail, maxDomains }: domain) {
  return (
    <>
      {/* fun fact the css specificity is based from last to first element called, I just noticed while working */}
      <HStack justifyContent="end">
        <Circle
          padding="6px"
          size="40px"
          //A subtle color change, I couldnt think of another color to use ,soI left it this way.
          bg={domainDetail > maxDomains ? "red" : "tomato"}
          color="white"
        >
          {domainDetail}/{maxDomains}
        </Circle>
      </HStack>
    </>
  )
}
