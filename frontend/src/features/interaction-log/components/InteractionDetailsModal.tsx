import React from "react";
import { Box, Flex, Grid, Icon, Text, Avatar } from "@chakra-ui/react";
import ContentModal from "../../../components/common/ContentModal";
import { InteractionDTO } from "../../../types/InteractionTypes";

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

interface InteractionDetailsModalProps {
  interaction: InteractionDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

const InteractionDetailsModal: React.FC<InteractionDetailsModalProps> = ({
  interaction,
  isOpen,
  onClose,
}) => {
  if (!interaction) return null;

  const date = new Date(interaction.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    .toLowerCase();

  const content = (
    <Flex direction="column" gap="1.5rem">
      {/* Interaction Type + Long Description */}
      <Box>
        <Text m={0} fontWeight="700" textStyle="h3" color="gray.700">
          {interaction.interactionType}
        </Text>
        <Text m={0} mt="0.5rem" textStyle="body" color="gray.600">
          {interaction.longDescription}
        </Text>
      </Box>

      {/* User */}
      <Box>
        <Text m={0} fontWeight="700" textStyle="body" color="gray.700">
          User
        </Text>
        <Flex align="center" gap="0.75rem" mt="0.5rem">
          <Avatar
            size="sm"
            name={`${interaction.actor.firstName} ${interaction.actor.lastName}`}
            src={interaction.actor.profilePhoto ?? undefined}
          />
          <Text m={0} textStyle="body" color="gray.700">
            {interaction.actor.firstName} {interaction.actor.lastName}
          </Text>
        </Flex>
      </Box>

      {/* Role */}
      <Box>
        <Text m={0} fontWeight="700" textStyle="body" color="gray.700">
          Role
        </Text>
        <Flex mt="0.5rem">
          {roleIcons[interaction.actor.role] ? (
            <Icon
              as={roleIcons[interaction.actor.role]}
              boxSize="2rem"
              minWidth="max-content"
            />
          ) : (
            <Text m={0} textStyle="body" color="gray.700">
              {interaction.actor.role}
            </Text>
          )}
        </Flex>
      </Box>

      {/* Date & Time */}
      <Grid templateColumns="1fr 1fr" gap="1rem">
        <Box>
          <Text m={0} fontWeight="700" textStyle="body" color="gray.700">
            Date
          </Text>
          <Text m={0} mt="0.5rem" textStyle="body" color="gray.600">
            {formattedDate}
          </Text>
        </Box>
        <Box>
          <Text m={0} fontWeight="700" textStyle="body" color="gray.700">
            Time
          </Text>
          <Text m={0} mt="0.5rem" textStyle="body" color="gray.600">
            {formattedTime}
          </Text>
        </Box>
      </Grid>
    </Flex>
  );

  return (
    <ContentModal
      open={isOpen}
      title="Interaction Details"
      content={content}
      onClose={onClose}
    />
  );
};

export default InteractionDetailsModal;
