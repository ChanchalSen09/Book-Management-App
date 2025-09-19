import { Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

const Navbar = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Book Management App
      </Typography>
    </Toolbar>
  </AppBar>
);

const AppFooter = () => (
  <Box
    component="footer"
    sx={{ bgcolor: "background.paper", py: 2, mt: 4, textAlign: "center" }}>
    <Typography variant="body2" color="text.secondary">
      Developed by Chanchal for Letest AI
    </Typography>
  </Box>
);

const Layout = () => (
  <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <Navbar />
    <Container maxWidth="lg" component="main" sx={{ flex: 1, py: 3 }}>
      <Outlet />
    </Container>
    <AppFooter />
  </Box>
);

export default Layout;
