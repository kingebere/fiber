import { Box, IconButton, Text } from "@chakra-ui/react"
import { MdCancel } from "react-icons/md"

interface domain {
  removeAllUnavailable: () => void
}
export default function RemoveUnavailable({ removeAllUnavailable }: domain) {
  return (
    <>
      {/* used IconButton instead of Icon , because of this warning . 
https://chakra-ui.com/docs/components/icon#usage */}
      <Box textAlign="center">
        <IconButton
          onClick={removeAllUnavailable}
          aria-label="clear data"
          icon={<MdCancel />}
        />
        <Text color="blue.800" fontWeight="600">
          Unavailable
        </Text>
      </Box>
    </>
  )
}
