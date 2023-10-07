import { isDomainValid } from "@/utils/isDomainValid"
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Spinner,
} from "@chakra-ui/react"
import { Field, Formik } from "formik"
import { useState } from "react"

interface Props {
  submitHandler: (values: { text: string }) => void
}

export default function Header({ submitHandler }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  return (
    <>
      <Formik
        initialValues={{
          text: "",
        }}
        onSubmit={async (values: { text: string }) => {
          setIsSubmitting(true)
          //a nice hack to await the response since I decided not to
          // return any value back. So the spinner can shine . :)
          await submitHandler(values)
          //removes the input value on a succesful addition
          values.text = ""
          setIsSubmitting(false)
        }}
      >
        {/* Generally, I searched the internet for inspiration on how to start the project,
        I had to choose between https://Namecheap.com and https://hostinger.com/domain-name-search.
        I love the fact that hostinger didnt redirect to a new page onSuccess
        and that was exactly what I wanted . You type , click enter and see your results underneath the search
        So, I did a UX rip-off from Hostinger .  */}
        {({ handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <FormControl isInvalid={!!errors.text && touched.text}>
              <FormLabel htmlFor="text">Domain</FormLabel>
              <FormErrorMessage>{errors.text}</FormErrorMessage>
              {/* :( Sad that i cant use type=url because the requiremnt said https://xyz.com isnt allowed, so type=text it would be */}
              <Field
                as={Input}
                id="text"
                name="text"
                type="text"
                variant="filled"
                marginBottom="5px"
                required={true}
                //Placeholder gotten from
                placeholder="Enter your desired domain name"
                validate={(value: string) => {
                  //helper function to validate a domain
                  return isDomainValid(value)
                }}
              />
            </FormControl>
            <Button type="submit" width="100%" colorScheme="blue">
              {isSubmitting ? <Spinner /> : "Find"}
            </Button>
          </form>
        )}
      </Formik>
    </>
  )
}
