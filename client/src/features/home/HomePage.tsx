import { Container, Typography, Box, Stack } from "@mui/material";
import { UIProvider } from "./context/ui";
import Banner from "./components/banner";
import Products from "./components/products";
import Footer from "./components/footer";
import AppDrawer from "./components/drawer";
import Promotions from "./components/promotions";
import SearchBox from "./components/search";

export default function HomePage() {
  return (
    <>
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          background: "#fff",
        }}
      >
        <Stack>
          <UIProvider>
            <Banner />
            <Promotions />
            <SearchBox />
            <Box display="flex" justifyContent="center" sx={{ p: 4 }}>
              <Typography variant="h4">Our Products</Typography>
            </Box>
            <Products />
            <Footer />
            <AppDrawer />
          </UIProvider>
        </Stack>
      </Container>
    </>
  );
}
