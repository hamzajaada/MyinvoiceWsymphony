import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { Box, Typography, useTheme } from "@mui/material";
import { useGetDashboardClientQuery } from "state/api";

const BreakdownChart = ({ idBreakDownChart }) => {

  const id = localStorage.getItem("userId");
  const { data, isLoading } = useGetDashboardClientQuery(id);
  const theme = useTheme();

  if (!data || isLoading) return "Chargement...";

  const formattedData = [
    {
      id: "Payée",
      label: "Factures Payées",
      value: data.totalPaidInvoices,
      color: theme.palette.secondary[400],
    },
    {
      id: "Impayée",
      label: "Factures Impayées",
      value: data.totalUnpaidInvoices,
      color: theme.palette.secondary[200],
    },
  ];

  return (
    <div id={idBreakDownChart}>
    <Box
      height="400px"
      width="100%"
      // width="80%"
      minHeight="325px"
      minWidth="325px"
      position="relative"
    >
      <ResponsivePie
        data={formattedData}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: theme.palette.secondary[50],
              },
            },
            legend: {
              text: {
                fill: theme.palette.secondary[200],
              },
            },
            ticks: {
              line: {
                stroke: theme.palette.secondary[200],
                strokeWidth: 1,
              },
              text: {
                fill: theme.palette.secondary[200],
              },
            },
          },
          legends: {
            text: {
              fill: theme.palette.secondary[200],
            },
          },
          tooltip: {
            container: {
              color: "#12244D",
            },
          },
        }}
        colors={{ datum: "data.color" }}
        margin={{ top: 40, right: 80, bottom: 100, left: 50 }}
        sortByValue={true}
        innerRadius={0.45}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        enableArcLinkLabels={false}
        arcLinkLabelsTextColor={theme.palette.secondary[200]}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: -2,
            translateY: 50,
            itemsSpacing: 40,
            itemWidth: 85,
            itemHeight: 18,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: theme.palette.primary[100],
                },
              },
            ],
          },
        ]}
      />
      <Box
        width="83px"
        position="absolute"
        top="50.75%"
        left="50%"
        color={theme.palette.secondary[400]}
        textAlign="center"
        pointerEvents="none"
        sx={{
          transform: "translate(-67%, -110%)",
        }}
      >
        <Typography variant="h6" color="#f57628" fontWeight="bold">
          {true && "Total:"} {data.totalPaidAmount.toFixed(2)} DHs
        </Typography>
      </Box>
    </Box>
  </div>
  );
};

export default BreakdownChart;
