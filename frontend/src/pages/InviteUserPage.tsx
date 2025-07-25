import { useState } from "react";
import PopupModal from "../components/common/PopupModal";
import { Flex } from "@chakra-ui/react";

const InviteUserPage = (): React.ReactElement => {

    const demoRes = {
        "firstName": "",
        "lastName": "",
        "phoneNumber": "",
        "email": "",
        "role": "",
        "colourLevel": "",
        "animalTag": ""
    }

    const [isConfirmInviteOpen, setIsConfirmInviteOpen] = useState<boolean>(false)
    const [isQuitEditingOpen, setIsQuitEditingOpen] = useState<boolean>(false)
    const [isInviteConfirmedOpen, setIsInviteConfirmedOpen] = useState<boolean>(false)


    return ( 
        <Flex direction="column" gap="2rem" width="100%" pt="2rem">


            {/* Confirm Invite Popup */}
            <PopupModal 
                open={isConfirmInviteOpen}
                title="Invite User?"
                message="Are you sure you want to invite this user? A verification link will be sent to them."
                primaryButtonText="Invite"
                onPrimaryClick={() => {}}
                primaryButtonColor="blue"
                secondaryButtonText="Cancel"
                onSecondaryClick={() => setIsConfirmInviteOpen(false)}
            />
            {/* Quit Editing Popup */}
            <PopupModal 
                open={isQuitEditingOpen}
                title="Quit Editing?"
                message="Changes you made so far will not be saved."
                primaryButtonText="Leave"
                onPrimaryClick={() => {}}
                primaryButtonColor="red"
                secondaryButtonText="Keep Editing"
                onSecondaryClick={() => setIsQuitEditingOpen(false)}
            />
            {/* Invite Sent Confirmation Popup */}
            <PopupModal 
                open={isInviteConfirmedOpen}
                title="Quit Editing?"
                message="A verification link has successfully been sent to the user's email."
                primaryButtonText="Back to User Management"
                onPrimaryClick={() => {}}
                primaryButtonColor="blue"
            />
        </Flex>
     );
}
 
export default InviteUserPage;