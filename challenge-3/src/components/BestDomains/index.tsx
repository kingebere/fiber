import { Box, IconButton, Text } from "@chakra-ui/react"
import { MdVerified } from "react-icons/md"

interface domain {
  getBestDomains: () => void
}
export default function BestDomains({ getBestDomains }: domain) {
  return (
    <>
      {/* used IconButton instead of Icon , because of this warning . 
https://chakra-ui.com/docs/components/icon#usage */}
      <Box textAlign="center">
        <IconButton
          onClick={getBestDomains}
          aria-label="love icon"
          icon={<MdVerified />}
        />
        {/* used a darker shade of blue to make the site pop
        P.S , my favourite color is blue. All my projects
        use Blue, so it is easier for me to work on the feel of my personal projects */}
        <Text color="blue.800" fontWeight="600">
          Best Domains
        </Text>
      </Box>
    </>
  )
}
