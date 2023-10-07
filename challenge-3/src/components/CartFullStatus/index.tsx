import { Box } from "@chakra-ui/react"

interface domain {
  domainArray: { domain: string; status: boolean }[]
  maxDomains: number
}
export default function CartFullStatus({ domainArray, maxDomains }: domain) {
  return (
    <>
      {domainArray.length > maxDomains && (
        <Box
          fontWeight="600"
          background="red"
          width="100%"
          padding="10px"
          color="white"
          title="Cart is Full, Please remove some"
        >
          Cart is Full, Please remove some
        </Box>
      )}
    </>
  )
}
