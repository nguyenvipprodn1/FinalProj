import React, {useState, useEffect} from "react";
import { Box, Container, Unstable_Grid2 as Grid } from "@mui/material";
import { OverviewBudget } from "./overview/overview-budget";
import { OverviewTotalCustomers } from "./overview/overview-total-customers";
import { OverviewTasksProgress } from "./overview/overview-tasks-progress";
import { OverviewTotalProfit } from "./overview/overview-total-profit";
import { OverviewTraffic } from "./overview/overview-traffic";
import { OverviewSales } from "./overview/overview-sales";
import agent from "../../app/api/agent";

const DashBoard = () => {
  const [data, setData]= useState({});
  useEffect(() => {
    agent.Dashboard.get().then((res)=>{
      setData(res);
    }).catch((err)=> console.log(err));
  }, []);
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} lg={3}>
            <OverviewTotalCustomers
              difference={16}
              positive={false}
              sx={{ height: "100%" }}
              value={data.customer}
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <OverviewBudget
                difference={12}
                positive
                sx={{ height: "100%" }}
                value={data.productRemain}
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <OverviewTasksProgress sx={{ height: "100%" }} value={data.productSold} />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <OverviewTotalProfit sx={{ height: "100%" }} value={`${data.totalProfit}$`} />
          </Grid>
          <Grid xs={12} lg={8}>
            <OverviewSales
              chartSeries={[
                {
                  name: "This year",
                  data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
                },
                {
                  name: "Last year",
                  data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
                },
              ]}
              sx={{ height: "100%" }}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4}>
            <OverviewTraffic
              chartSeries={[63, 15, 22]}
              labels={["Desktop", "Tablet", "Phone"]}
              sx={{ height: "100%" }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashBoard;
