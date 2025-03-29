import { extendTheme } from "@chakra-ui/react";
import textStyles from "./textStyles";
import colors from "./colors";
import shadows from "./boxShadows";
import scrollbarStyles from "./scrollBars";

const theme = extendTheme({
  colors,
  textStyles,
  shadows,
  styles: {
    global: {
      ".no-scrollbar": scrollbarStyles.noScrollbar,
    },
  },
});

export default theme;
