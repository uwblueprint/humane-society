import React from "react";
import {
  Flex,
  Text,
  Image,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { FilterSection } from "../../types/FilterTypes";
import { CloseIcon } from "../../assets/icons";
import FilterSectionBody from "./FilterSectionBody";

type MobileFilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterSection[];
  selected: Record<string, string[]>;
  onOptionChange: (filterName: string, option: string) => void;
  onDateChange: (filterName: string, date: string | undefined) => void;
  onBulkOptionChange: (
    filterName: string,
    options: string[],
    select: boolean,
  ) => void;
};

const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  selected,
  onOptionChange,
  onDateChange,
  onBulkOptionChange,
}) => {
  if (!isOpen) return null;

  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="rgba(26, 32, 44, 0.6)"
      zIndex="1000"
      alignItems="flex-end"
      justifyContent="center"
      onClick={onClose}
    >
      <Flex
        bg="white"
        direction="column"
        width="100%"
        maxHeight="80vh"
        borderTopRadius="1rem"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          padding="1rem 1.25rem"
          borderBottom="1px solid"
          borderColor="gray.200"
          flexShrink={0}
        >
          <Text m={0} textStyle="bodyBold" color="gray.700">
            Filter
          </Text>
          <Box as="button" type="button" onClick={onClose} cursor="pointer">
            <Image src={CloseIcon} alt="Close" boxSize="1rem" />
          </Box>
        </Flex>

        <Flex
          direction="column"
          overflowY="auto"
          padding="0.5rem 1.25rem 1.5rem"
        >
          <Accordion allowMultiple defaultIndex={filters.map((_, i) => i)}>
            {filters.map((filter) => {
              const selectedValues = selected[filter.value] || [];
              return (
                <AccordionItem key={filter.name} borderColor="gray.200">
                  <AccordionButton paddingX="0" paddingY="0.75rem">
                    <Text
                      flex="1"
                      textAlign="left"
                      m={0}
                      textStyle="bodyBold"
                      color="gray.700"
                    >
                      {filter.name}
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel paddingX="0" paddingBottom="1rem">
                    <FilterSectionBody
                      filter={filter}
                      selectedValues={selectedValues}
                      onOptionChange={(option) =>
                        onOptionChange(filter.value, option)
                      }
                      onDateChange={(date) => onDateChange(filter.value, date)}
                      onBulkOptionChange={(options, select) =>
                        onBulkOptionChange(filter.value, options, select)
                      }
                    />
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MobileFilterPanel;
