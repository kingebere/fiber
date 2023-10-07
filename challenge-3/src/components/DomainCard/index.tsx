import {
  Box,
  Button,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react"

interface Details {
  // plan: string | undefined;
  item: { domain: string; status: boolean }
  deleteDomain: (data: string) => void
  maxDomains: number
  array: { domain: string; status: boolean }[]
}

export default function DomainCard({
  deleteDomain,
  item,
  maxDomains,
  array,
}: Details) {
  return (
    <>
      <Stack divider={<StackDivider />} spacing="4">
        <Card marginBottom="1rem">
          <Box
            mb={4}
            bg={item.status ? "blue.500" : "red.500"}
            color="white"
            borderTopLeftRadius="6px"
            borderTopRightRadius="4px"
            marginBottom="0"
            padding="7px"
            textAlign="center"
          >
            {item.status ? "Available" : "Unavailable"}
          </Box>
          <CardBody>
            {/* Text overflow very important, I hate when that happens, imagine someone searches for https://llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch.co.uk/,*/}
            {/* The longest website in the world, https://www.vice.com/en/article/539ana/the-long-forgotten-battle-for-the-longest-domain-name-on-the-internet */}
            {/* I added title as a prop to get that nice native full name when you hover a url */}
            <Text
              fontWeight="600"
              marginBottom="10px"
              width="250px"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
              title={item.domain}
            >
              {" "}
              {item.domain}
            </Text>
            <Button
              marginRight="12px"
              borderWidth="6px"
              border="1px"
              borderColor="gray.200"
              color="white"
              colorScheme={maxDomains === array.length ? "blue" : "gray"}
              isDisabled={maxDomains === array.length ? false : true}
            >
              Add
            </Button>
            <Button
              color="white"
              colorScheme="red"
              onClick={() => deleteDomain(item.domain)}
            >
              Delete
            </Button>
          </CardBody>
        </Card>
      </Stack>
    </>
  )
}
