import { red } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";

// A custom theme for this app
const theme = createMuiTheme({
	palette: {
		type: "dark",
		primary: {
			main: "#f5b240",
		},
		secondary: {
			main: "#ec7505",
		},
	},
});

export default theme;
