import { extendTheme } from "@chakra-ui/react";
import textStyles from "./textStyles";
import colors from "./colors";
import shadows from "./boxShadows";

const theme = extendTheme({
  colors,
  textStyles,
  shadows,
});

export default theme;
