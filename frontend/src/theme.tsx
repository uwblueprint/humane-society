import { extendTheme } from "@chakra-ui/react";
import "@fontsource/poppins";
import "@fontsource/roboto";

const theme = extendTheme({
  textStyles: {
    h1: {
      fontFamily: "Poppins",
      fontWeight: 600,
      fontSize: "40px",
    },
    h2: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: "28px",
    },
    h3: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: "24px",
    },
    subheading: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: "20px",
    },
    body: {
      fontFamily: "Roboto",
      fontWeight: 400,
      fontSize: "18px",
      letterSpacing: "1.50%",
    },
    button: {
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: "18px",
    },
  },
});

export default theme;
