import React, { useState } from "react";
import { Flex, Text, IconButton } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import colors from "../../../theme/colors";
import textStyles from "../../../theme/textStyles";
import Button from "../../../components/common/Button";
import { MONTH_NUMBER_TO_NAME } from "../../../utils/CommonUtils";

interface CalendarDateSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const SHORT_MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// Helper to get the Sunday of the week for a given date
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

const CalendarDateSelector: React.FC<CalendarDateSelectorProps> = ({
  selectedDate,
  onChange,
}) => {
  const [visibleWeekStart, setVisibleWeekStart] = useState<Date>(() =>
    getStartOfWeek(selectedDate),
  );

  const shiftVisibleWeek = (days: number) => {
    const newDate = new Date(visibleWeekStart);
    newDate.setDate(newDate.getDate() + days);
    setVisibleWeekStart(newDate);
  };

  // Generate the 7 dates for the currently visible week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(visibleWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getRangeDisplay = () => {
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    const startMonth = SHORT_MONTH_NAMES[startDate.getMonth()];
    const endMonth = SHORT_MONTH_NAMES[endDate.getMonth()];

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}`;
    }
    return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`;
  };

  return (
    <Flex flexDirection="column" gap="1.5rem" width="100%">
      <Flex alignItems="center" gap="1rem">
        <Text style={textStyles.h3} margin="0">
          {/* getMonth is zero-indexed, so we add one */}
          {MONTH_NUMBER_TO_NAME[visibleWeekStart.getMonth() + 1]}{" "}
          {visibleWeekStart.getFullYear()}
        </Text>

        <Flex alignItems="center" gap="0.5rem">
          <IconButton
            aria-label="Previous Week"
            icon={<ChevronLeftIcon w={6} h={6} />}
            onClick={() => shiftVisibleWeek(-7)}
            variant="solid"
            isRound
            color={colors.white.default}
            bg={colors.blue[700]}
            _hover={{ bg: colors.blue[700] }}
            _active={{ bg: colors.blue[700] }}
            size="sm"
          />
          <Text style={textStyles.caption} color={colors.blue[700]} margin="0">
            {getRangeDisplay()}
          </Text>
          <IconButton
            aria-label="Next Week"
            icon={<ChevronRightIcon w={6} h={6} />}
            onClick={() => shiftVisibleWeek(7)}
            variant="solid"
            isRound
            color={colors.white.default}
            bg={colors.blue[700]}
            _hover={{ bg: colors.blue[700] }}
            _active={{ bg: colors.blue[700] }}
            size="sm"
          />
        </Flex>
      </Flex>

      <Flex justifyContent="space-between" gap="2rem">
        {weekDates.map((date, index) => {
          const isActive =
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
          return (
            <Flex
              flexDirection="column"
              key={index}
              align="center"
              flex="1"
              gap="0.75rem"
            >
              <Text style={textStyles.caption} color={colors.gray[500]} margin="0">
                {DAYS[index]}
              </Text>
              <Button
                variant={isActive ? "dark-blue" : "gray"}
                bg={isActive ? "blue.700" : "gray.200"}
                color="white"
                paddingBlock="0.5rem"
                borderRadius="0.5rem"
                onClick={() => onChange(date)}
                width="100%"
              >
                <Text
                  fontWeight={isActive ? "700" : "400"}
                  color={isActive ? colors.white.default : colors.gray[500]}
                  margin="0"
                >
                  {date.getDate()}
                </Text>
              </Button>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default CalendarDateSelector;
