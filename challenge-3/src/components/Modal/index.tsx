import {
  Button,
  ModalBody,
  ModalCloseButton,
  Modal as ModalContainer,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { FC } from "react"

interface ModalPropInterface {
  isOpen: boolean
  onClose: () => void
  Utility: () => void
  modalHeader: string
  modalBody: string
}

const Modal: FC<ModalPropInterface> = ({
  isOpen,
  onClose,
  Utility,
  modalHeader,
  modalBody,
}) => {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalHeader}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>{modalBody}</ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            No
          </Button>
          <Button onClick={Utility} colorScheme="red">
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalContainer>
  )
}

export default Modal
