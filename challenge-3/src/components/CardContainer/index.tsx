import { Box } from "@chakra-ui/react"
import React, { useState } from "react"
import DomainCard from "../DomainCard"
import Modal from "../Modal"

interface domain {
  domainArray: { domain: string; status: boolean }[]
  deleteCart: (data: string) => void
  maxDomains: number
  onClose: () => void
  isOpen: boolean
  onOpen: () => void
}

export default function CardContainer({
  domainArray,
  deleteCart,
  maxDomains,
  onClose,
  isOpen,
  onOpen,
}: domain) {
  const [deleteUrl, setDeleteUrl] = useState<string>("")

  function deleteDomain(data: string) {
    // This opens the Modal
    onOpen()
    //This deletes the selected domain
    setDeleteUrl(data)
  }
  const removeUrlFromCart = () => {
    deleteCart(deleteUrl)
  }

  return (
    <>
      <Box marginTop="12px">
        {domainArray.map((item, i, array) => {
          return (
            //I had to add React.fragment to this to pass the keys, normally I prefer <></>
            <React.Fragment key={item.domain}>
              <DomainCard
                item={item}
                deleteDomain={deleteDomain}
                maxDomains={maxDomains}
                array={array}
              />
            </React.Fragment>
          )
        })}

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          Utility={removeUrlFromCart}
          modalBody="Are you sure you want to delete this domain?"
          modalHeader="Domain Deletion"
        />
      </Box>
    </>
  )
}
