import { Box, IconButton, Text } from "@chakra-ui/react"
import { MdOutlineRestoreFromTrash } from "react-icons/md"

interface domain {
  clearAllItems: () => void
}
export default function ClearCart({ clearAllItems }: domain) {
  return (
    <>
      {/* used IconButton instead of Icon , because of this warning . 
https://chakra-ui.com/docs/components/icon#usage */}
      <Box textAlign="center">
        <IconButton
          onClick={clearAllItems}
          aria-label="clear data"
          icon={<MdOutlineRestoreFromTrash />}
        />
        <Text color="blue.800" fontWeight="600">
          Remove All
        </Text>
      </Box>
    </>
  )
}
