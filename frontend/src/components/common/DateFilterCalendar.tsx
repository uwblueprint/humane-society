import React, { useState } from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { MONTH_NUMBER_TO_NAME, getDaysInMonth } from "../../utils/CommonUtils";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type DateFilterCalendarProps = {
  selected?: string;
  onChange: (date: string | undefined) => void;
};

const toISODate = (year: number, month: number, day: number): string =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const DateFilterCalendar: React.FC<DateFilterCalendarProps> = ({
  selected,
  onChange,
}) => {
  const initialDate = selected ? new Date(`${selected}T00:00:00`) : new Date();
  const [visibleYear, setVisibleYear] = useState(initialDate.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(initialDate.getMonth() + 1);

  const shiftMonth = (delta: number) => {
    let newMonth = visibleMonth + delta;
    let newYear = visibleYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setVisibleMonth(newMonth);
    setVisibleYear(newYear);
  };

  const daysInMonth = getDaysInMonth(visibleMonth, visibleYear);
  const firstWeekday = new Date(visibleYear, visibleMonth - 1, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDayClick = (day: number) => {
    const iso = toISODate(visibleYear, visibleMonth, day);
    onChange(iso === selected ? undefined : iso);
  };

  return (
    <Flex direction="column" gap="0.75rem" width="100%">
      <Flex alignItems="center" justifyContent="space-between">
        <Box
          as="button"
          type="button"
          aria-label="Previous month"
          cursor="pointer"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeftIcon color="gray.600" boxSize="1.25rem" />
        </Box>
        <Text
          m={0}
          flex="1"
          textAlign="center"
          textStyle="bodyBold"
          color="gray.700"
        >
          {MONTH_NUMBER_TO_NAME[visibleMonth]} {visibleYear}
        </Text>
        <Box
          as="button"
          type="button"
          aria-label="Next month"
          cursor="pointer"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRightIcon color="gray.600" boxSize="1.25rem" />
        </Box>
      </Flex>

      <Flex>
        {DAY_LABELS.map((label) => (
          <Flex key={label} width="2rem" justifyContent="center">
            <Text m={0} textStyle="caption" color="gray.500">
              {label}
            </Text>
          </Flex>
        ))}
      </Flex>

      <Flex wrap="wrap" width="14rem">
        {cells.map((day, index) => {
          const iso = day ? toISODate(visibleYear, visibleMonth, day) : null;
          const isSelected = !!iso && iso === selected;
          return (
            <Flex
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              width="2rem"
              height="2rem"
              alignItems="center"
              justifyContent="center"
            >
              {day && (
                <Flex
                  as="button"
                  type="button"
                  width="1.75rem"
                  height="1.75rem"
                  borderRadius="50%"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  bg={isSelected ? "blue.700" : "transparent"}
                  _hover={{ bg: isSelected ? "blue.700" : "gray.100" }}
                  onClick={() => handleDayClick(day)}
                >
                  <Text
                    m={0}
                    textStyle="body"
                    color={isSelected ? "white" : "gray.700"}
                  >
                    {day}
                  </Text>
                </Flex>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default DateFilterCalendar;
