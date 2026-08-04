import React, { useState, useEffect, useMemo } from "react";
import { Flex, Grid, Icon, Text, useToast } from "@chakra-ui/react";
import {
  TableWrapper,
  TableHeader,
  TableEmptyState,
  TableColumn,
} from "../../../components/common/table";
import InteractionAPIClient from "../../../APIClients/InteractionAPIClient";
import { InteractionDTO } from "../../../types/InteractionTypes";
import InteractionDetailsModal from "../components/InteractionDetailsModal";
import ProfilePhoto from "../../../components/common/ProfilePhoto";

import { ReactComponent as AdminTag } from "../../../assets/icons/user-role/admin.svg";
import { ReactComponent as BehaviouristTag } from "../../../assets/icons/user-role/behaviourist.svg";
import { ReactComponent as StaffTag } from "../../../assets/icons/user-role/staff.svg";
import { ReactComponent as VolunteerTag } from "../../../assets/icons/user-role/volunteer.svg";

const roleIcons: Record<string, React.ElementType> = {
  Administrator: AdminTag,
  "Animal Behaviourist": BehaviouristTag,
  Staff: StaffTag,
  Volunteer: VolunteerTag,
};

const columns: TableColumn[] = [
  { label: "NAME" },
  { label: "ROLE" },
  { label: "INTERACTION" },
  { label: "DATE" },
  { label: "TIME" },
];

const gridTemplateColumns = "1fr 1fr 2fr 1fr 1fr";

const InteractionLogPage = (): React.ReactElement => {
  const toast = useToast();
  const [interactions, setInteractions] = useState<InteractionDTO[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const [selectedInteraction, setSelectedInteraction] =
    useState<InteractionDTO | null>(null);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const data = await InteractionAPIClient.getInteractions();
        setInteractions(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch interactions",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchInteractions();
  }, [toast]);

  const handleFilterChange = (selectedFilters: Record<string, string[]>) => {
    setFilters(selectedFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const filteredLogs = useMemo(() => {
    let result = interactions;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (log) =>
          `${log.actor.firstName} ${log.actor.lastName}`
            .toLowerCase()
            .includes(lowerSearch) ||
          log.shortDescription.toLowerCase().includes(lowerSearch) ||
          log.interactionType.toLowerCase().includes(lowerSearch),
      );
    }

    return result;
  }, [interactions, search]);

  const isEmpty = filteredLogs.length === 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <TableWrapper
        filterBarProps={{
          filterType: "interactionLog",
          filters,
          onFilterChange: handleFilterChange,
          search,
          onSearchChange: handleSearchChange,
          searchPlaceholder: "Search interactions...",
        }}
      >
        <Flex direction="column" width="100%">
          <TableHeader
            columns={columns}
            gridTemplateColumns={gridTemplateColumns}
          />
          {isEmpty ? (
            <TableEmptyState
              message="No interactions currently match."
              onClearFilters={handleClearFilters}
            />
          ) : (
            <Flex direction="column" width="100%">
              {filteredLogs.map((log) => (
                <Grid
                  key={log.id}
                  gridTemplateColumns={gridTemplateColumns}
                  padding="1rem 2.5rem"
                  alignItems="center"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => setSelectedInteraction(log)}
                >
                  <Flex align="center" gap="0.75rem">
                    <ProfilePhoto
                      image={log.actor.profilePhoto ?? undefined}
                      size="small"
                      type="user"
                    />
                    <Text textStyle="body" m={0} color="gray.700">
                      {log.actor.firstName} {log.actor.lastName}
                    </Text>
                  </Flex>
                  <Flex>
                    {roleIcons[log.actor.role] ? (
                      <Icon
                        as={roleIcons[log.actor.role]}
                        boxSize="2rem"
                        minWidth="max-content"
                      />
                    ) : (
                      <Text textStyle="body" m={0} color="gray.700">
                        {log.actor.role}
                      </Text>
                    )}
                  </Flex>
                  <Text textStyle="body" m={0} color="gray.700" noOfLines={1}>
                    {log.shortDescription}
                  </Text>
                  <Text textStyle="body" m={0} color="gray.700">
                    {formatDate(log.createdAt)}
                  </Text>
                  <Text textStyle="body" m={0} color="gray.700">
                    {formatTime(log.createdAt)}
                  </Text>
                </Grid>
              ))}
            </Flex>
          )}
        </Flex>
      </TableWrapper>

      <InteractionDetailsModal
        interaction={selectedInteraction}
        isOpen={selectedInteraction !== null}
        onClose={() => setSelectedInteraction(null)}
      />
    </>
  );
};

export default InteractionLogPage;
