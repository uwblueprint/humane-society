import React, { useEffect, useState, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner} from "@chakra-ui/react";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import NavBar from "../../../components/common/navbar/NavBar";
import PetProfileSidebar from "../components/PetProfileSidebar";
import Button from "../../../components/common/Button";
import Search from "../../../components/common/Search";
import Pagination from "../../../components/common/Pagination";
import ProfilePhoto from "../../../components/common/ProfilePhoto";
import UserAPIClient from "../../../APIClients/UserAPIClient";
import { User } from "../../../types/UserTypes";
import { colorLevelMap } from "../../../types/TaskTypes";
import ColourLevelBadge from "../../../components/common/ColourLevelBadge";
import PetAPIClient from "../../../APIClients/PetAPIClient";
import PopupModal from "../../../components/common/PopupModal";
import { useDisclosure } from "@chakra-ui/react";

const AssignTaskPage = (): React.ReactElement => {
    const params = useParams<{ petId: string; taskId: string }>();
    const petId = Number(params.petId);
    const taskId = Number{params.taskId};
    const history = useHistory();

    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [petData, setPetData] = useState<any | null>(null);
    const [isRecurringTask, setIsRecurringTask] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        isOpen: isRecurringModalOpen,
        onOpen: openRecurringModal,
        onClose: closeRecurringModal,
    } = useDisclosure();

    const usersPerPage = 7;

    // fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await UserAPIClient.get();
                setUsers(fetchedUsers);
            } catch (error) {
                // console.error(`Failed to fetch user ${userId}:`, error);
                history.push("/not-found");
                // !!!! LOOK MORE INTO HOW TO DO SEND ERROR MSG !!!! -> from UserProfilePage
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // fetch pet data
    useEffect(() => {
        const fetchPet = async () => {
            try {
                const pet = await PetAPIClient.getPet(petId);
                setPetData(pet);
            } catch (error) {
                // console.error(`Failed to fetch pet ${petId}:`, error);
                history.push("/not-found");
            }
        };

        fetchPet();
    }, [petId, history]);

    // TODO: Fetch task data to check if recurring
    // For now, you'll need to add a TaskAPIClient.getTask(taskId) method
    // This is a placeholder - replace when TaskAPIClient is ready
    useEffect(() => {
        const fetchTask = async () => {
            try {
            // const task = await TaskAPIClient.getTask(taskId);
            // setIsRecurringTask(task.isRecurring);
                
            // Placeholder - assume not recurring for now
            setIsRecurringTask(false);
            } catch (error) {
                console.error("Failed to fetch task:", error);
            }
        };

        fetchTask();
    }, [taskId]);    


    // filters users based on search
    const filteredUsers = useMemo(() => {
        return users.filter((user) => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, usersPerPage]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleRowClick = (user: User) => {
        setSelectedUser(user);
        setSearchTerm(user.name);
    };

    const handleBackClick = () => {
        history.goBack();
    };

    const handleSaveClick = () => {
        if (!selectedUser) return;
    
        // If task is recurring, show the modal
        if (isRecurringTask) {
            openRecurringModal();
        } else {
            // If not recurring, save immediately
            handleConfirmAssignment(false);
        }
    };
  
    const handleConfirmAssignment = async (assignAllRecurring: boolean) => {
        if (!selectedUser) return;
    
        try {
            // TODO: Replace with actual API call when TaskAPIClient is ready
            console.log("Assigning task", taskId, "to user", selectedUser.id);
            console.log("Assign all recurring?", assignAllRecurring);
      
            // await TaskAPIClient.assignTask(taskId, selectedUser.id, assignAllRecurring);
      
            // Close modal if it's open
            closeRecurringModal();
      
            // Go back to pet profile
            history.goBack();
        } catch (error) {
            setErrorMessage(
                `Failed to assign task. ${error instanceof Error ? error.message : "Unknown error occurred."}`,
            );
            closeRecurringModal();
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" height="100vh">
                <Spinner />
            </Flex>
        );
    }

}

