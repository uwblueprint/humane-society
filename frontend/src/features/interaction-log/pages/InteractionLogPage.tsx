import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Flex, Grid, Icon, Text } from "@chakra-ui/react";
import {
  TableWrapper,
  TableHeader,
  TableEmptyState,
  TableColumn,
} from "../../../components/common/table";
import InteractionAPIClient from "../../../APIClients/InteractionAPIClient";
import UserAPIClient from "../../../APIClients/UserAPIClient";
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
  const [interactions, setInteractions] = useState<InteractionDTO[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState<string>("");
  const [selectedInteraction, setSelectedInteraction] =
    useState<InteractionDTO | null>(null);

  const fetchInteractions = useCallback(async () => {
    try {
      const data = await InteractionAPIClient.getInteractions();

      const actorIdsWithPhotos = Array.from(
        new Set(
          data
            .filter((log) => log.actor.profilePhoto)
            .map((log) => log.actor.id),
        ),
      );
      let photoUrlsByActorId: Record<number, string> = {};
      if (actorIdsWithPhotos.length > 0) {
        try {
          photoUrlsByActorId = await UserAPIClient.getProfilePhotoUrls(
            actorIdsWithPhotos,
          );
        } catch {
          // Leave unresolved; ProfilePhoto falls back to the default avatar.
        }
      }

      setInteractions(
        data.map((log) => ({
          ...log,
          actor: {
            ...log.actor,
            profilePhoto: photoUrlsByActorId[log.actor.id] ?? null,
          },
        })),
      );
      setHasError(false);
    } catch (error) {
      setHasError(true);
    }
  }, []);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

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

    const hasActiveFilters = Object.values(filters).some(
      (vals) => vals && vals.length > 0,
    );
    if (hasActiveFilters) {
      result = result.filter((log) =>
        Object.keys(filters).every((key) => {
          const vals = filters[key];
          if (!vals || vals.length === 0) return true;
          if (key === "interactionType")
            return vals.includes(log.interactionType);
          if (key === "animalTag")
            return log.animalTag ? vals.includes(log.animalTag) : false;
          if (key === "role") return vals.includes(log.actor.role);
          if (key === "date") {
            const d = new Date(log.createdAt);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0",
            )}-${String(d.getDate()).padStart(2, "0")}`;
            return vals.includes(iso);
          }
          return true;
        }),
      );
    }

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
  }, [interactions, filters, search]);

  // Distinguish a genuinely empty list from a search that filtered everything
  // out: when the raw list has items but the filtered result is empty, an
  // active search (the only wired filter) must be excluding them.
  const isRawEmpty = interactions.length === 0;
  const isNoMatch = filteredLogs.length === 0;

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

  let emptyState: React.ReactElement | null = null;
  if (hasError) {
    emptyState = (
      <TableEmptyState
        message="Unable to load logs."
        linkLabel="Refresh page"
        onLinkClick={fetchInteractions}
      />
    );
  } else if (isRawEmpty) {
    emptyState = <TableEmptyState message="No interactions to display." />;
  } else if (isNoMatch) {
    emptyState = (
      <TableEmptyState
        message="No interactions currently match."
        linkLabel="Clear all"
        onLinkClick={handleClearFilters}
      />
    );
  }

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
          {emptyState ?? (
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
