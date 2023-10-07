import { Box, IconButton, Text } from "@chakra-ui/react"
import { MdContentCopy } from "react-icons/md"

interface domain {
  copyAllItems: () => void
}
export default function CopyCart({ copyAllItems }: domain) {
  return (
    <>
      {/* used IconButton instead of Icon , because of this . 
https://chakra-ui.com/docs/components/icon#usage */}
      <Box textAlign="center">
        <IconButton
          onClick={copyAllItems}
          aria-label="Search database"
          icon={<MdContentCopy />}
        />
        <Text color="blue.800" fontWeight="600">
          Copy All
        </Text>
      </Box>
    </>
  )
}
