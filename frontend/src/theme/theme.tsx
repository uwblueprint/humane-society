import { extendTheme } from "@chakra-ui/react";
import textStyles from "./textStyles";
import colors from "./colors";
import boxShadows from "./boxShadows";

const theme = extendTheme({
  colors,
  textStyles,
  boxShadows,
});

export default theme;
