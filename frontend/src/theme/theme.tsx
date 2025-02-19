import { extendTheme } from "@chakra-ui/react";
import textStyles from "./textStyles";
import colors from "./colors";

const theme = extendTheme({
  colors,
  textStyles,
});

export default theme;
