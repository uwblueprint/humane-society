import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { AddTaskFormData } from "./AddTaskFormTypes";
import TaskTemplateAPIClient from "../../../../APIClients/TaskTemplateAPIClient";
import Input from "../../../../components/common/Input";
import Pagination from "../../../../components/common/Pagination";
import { TableEmptyState } from "../../../../components/common/table";
import TaskCategoryBadge from "../../../../components/common/TaskCategoryBadge";
import { Task } from "../../../../types/TaskTypes";
import TemplateSearch from "./TemplateSearch";

interface AddTaskTemplateSelectionProps {
  petName: string;
  control: Control<AddTaskFormData>;
  setValue: UseFormSetValue<AddTaskFormData>;
}

const AddTaskTemplateSelection = ({
  petName,
  control,
  setValue,
}: AddTaskTemplateSelectionProps): React.ReactElement => {
  const toast = useToast();
  const [taskTemplates, setTaskTemplates] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const NUM_ITEMS_PER_PAGE = 6;

  const search = useWatch({ control, name: "search" });
  const selectedTemplate = useWatch({ control, name: "selectedTemplate" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templatesData = await TaskTemplateAPIClient.getAllTaskTemplates();
        setTaskTemplates(templatesData);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: error instanceof Error ? error.message : "Unknown error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredTemplates = useMemo(() => {
    return taskTemplates
      .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.id - a.id);
  }, [taskTemplates, search]);

  const paginatedTemplates = useMemo(() => {
    return filteredTemplates.slice(
      (page - 1) * NUM_ITEMS_PER_PAGE,
      page * NUM_ITEMS_PER_PAGE,
    );
  }, [filteredTemplates, page]);

  const onSelectTemplate = (template: Task) => {
    setValue("selectedTemplate", template, { shouldValidate: true });
  };

  const onClearSelection = () => {
    setValue("selectedTemplate", null, { shouldValidate: true });
    setValue("search", "");
  };

  if (loading) {
    return (
      <Flex height="100%" align="center" justify="center" p="4rem">
        <Spinner size="xl" />
      </Flex>
    );
  }
  return (
    <Flex flexDirection="column" gap="2.5rem">
      {/* Section 1: Pet Name */}
      <Flex flexDirection="column">
        <FormLabel color="gray.600" marginBottom="0.38rem" fontWeight="normal">
          Pet Name:
        </FormLabel>
        <Input value={petName} disabled />
      </Flex>

      {/* Section 2: Task Template */}
      <Controller
        control={control}
        name="selectedTemplate"
        rules={{ required: "Please select a task template." }}
        render={({ fieldState: { error } }) => (
          <FormControl isRequired isInvalid={!!error}>
            <FormLabel
              color="gray.600"
              marginBottom="0.38rem"
              fontWeight="normal"
            >
              Task Template:
            </FormLabel>
            <Controller
              control={control}
              name="search"
              render={({ field }) => (
                <TemplateSearch
                  search={field.value}
                  onSearchChange={field.onChange}
                  selectedTemplate={selectedTemplate}
                  onClearSelection={onClearSelection}
                />
              )}
            />
            {error && (
              <FormErrorMessage fontSize="12px">
                {error.message}
              </FormErrorMessage>
            )}
          </FormControl>
        )}
      />

      {/* Section 3: Suggestions */}
      <Flex flexDirection="column">
        <Text color="gray.600">Suggestions:</Text>
        <Flex direction="column" gap="1.5rem" width="100%">
          <Box overflowX="auto">
            <Table
              variant="simple"
              backgroundColor={
                paginatedTemplates.length === 0 ? "transparent" : "white"
              }
              borderRadius={paginatedTemplates.length === 0 ? "none" : "md"}
            >
              <Tbody>
                {paginatedTemplates.length === 0 ? (
                  <Tr>
                    <Td colSpan={4}>
                      <TableEmptyState message="No tasks to display. Please add a template." />
                    </Td>
                  </Tr>
                ) : (
                  paginatedTemplates.map((template) => (
                    <Tr
                      key={template.id}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ backgroundColor: "gray.50" }}
                      onClick={() => onSelectTemplate(template)}
                      backgroundColor={
                        selectedTemplate?.id === template.id
                          ? "blue.50"
                          : "transparent"
                      }
                    >
                      <Td>
                        <Text textStyle="body" fontWeight="medium" margin="0">
                          {template.name}
                        </Text>
                      </Td>
                      <Td>
                        <TaskCategoryBadge
                          taskCategory={template.category}
                          iconSize="2rem"
                        />
                      </Td>
                      <Td>
                        <Text
                          textStyle="body"
                          noOfLines={1}
                          overflow="hidden"
                          margin="0"
                        >
                          {template.instructions}
                        </Text>
                      </Td>
                      <Td
                        textAlign="center"
                        width="60px"
                        minWidth="40px"
                        padding="0"
                      >
                        {selectedTemplate?.id === template.id && (
                          <CheckIcon boxSize="20px" color="blue.700" />
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          <Pagination
            value={page}
            onChange={setPage}
            numberOfItems={filteredTemplates.length}
            itemsPerPage={NUM_ITEMS_PER_PAGE}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AddTaskTemplateSelection;
