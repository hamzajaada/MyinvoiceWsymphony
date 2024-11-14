import React, { useEffect, useState } from "react";
import { useGetDeviDetailsQuery } from "state/api";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid, Button, Typography, Paper } from "@mui/material";
import styled from "styled-components";
import profileImage from "assets/logo.png";
import FlexBetween from "componementClient/FlexBetween";

const DeviItem = ({ item }) => {
  return (
    <tr>
      <td className="border px-4 py-2" align="center">{item.productName}</td>
      <td className="border px-4 py-2" align="center">{item.quantity}</td>
      <td className="border px-4 py-2" align="center">{item.price.toFixed(2)} DH</td>
    </tr>
  );
};

const DeviTax = ({ tax }) => {
  return (
    <tr>
      <td className="border px-4 py-2" align="center">{tax.taxeName}</td>
      <td className="border px-4 py-2" align="center">{tax.value} %</td>
    </tr>
  );
};

const DeviDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [devi, setDevi] = useState(null);
  const { data } = useGetDeviDetailsQuery(id);

  useEffect(() => {
    if (data) {
      setDevi(data);
    }
  }, [data]);

  const printDevi = () => {
    window.print();
  };

  if (!devi) return <Typography variant="h6">Chargement...</Typography>;

  const {itemsTable,} = data;
  const sousTotale = itemsTable.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <Box m="1.5rem 2.5rem">
      <Paper className="p-6">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          className="mb-6"
        >
          <Box
            component="img"
            alt="profile"
            src={profileImage}
            height="100px"
            width="150px"
            sx={{ objectFit: "cover" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={printDevi}
            sx={{
              backgroundColor: "#ff7b00",
              color: "#fff",
              "&:hover": { backgroundColor: "#cc6200" },
              "@media print": { display: "none" },
            }}
          >
            Imprimer
          </Button>
        </Box>
        <DeviContainer>
          <Header>
            <Logo src={devi.userLogo.url} alt="Company Logo" />
            <UserInfo>
              <Typography variant="h5" className="font-semibold">
                {devi.userName}
              </Typography>
              <Typography>{devi.userAddress}</Typography>
              <Typography>{devi.userEmail}</Typography>
              <Typography>{devi.userPhone}</Typography>
            </UserInfo>
          </Header>
          <FlexBetween>
            <ClientInfo>
              <Typography variant="h6" className="font-semibold">
                Devi à:
              </Typography>
              <Typography>{devi.clientName}</Typography>
              <Typography>{devi.clientAddress}</Typography>
              <Typography>{devi.clientEmail}</Typography>
              <Typography>{devi.clientPhone}</Typography>
            </ClientInfo>
            <DeviMeta>
              <Typography>
                <strong>Date de Devi:</strong> {devi.formattedDate}
              </Typography>
              <Typography>
                <strong>Statut:</strong> {devi.deviStatus}
              </Typography>
              <Typography>
                <strong>Numéro de Devi:</strong> {devi._id}
              </Typography>
            </DeviMeta>
          </FlexBetween>

          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Produit</th>
                <th className="border px-4 py-2">Quantité</th>
                <th className="border px-4 py-2">Prix</th>
              </tr>
            </thead>
            <tbody>
              {devi.itemsTable.map((item, index) => (
                <DeviItem key={index} item={item} />
              ))}
            </tbody>
          </table>
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Taxe</th>
                <th className="border px-4 py-2">Taux</th>
              </tr>
            </thead>
            <tbody>
              {devi.taxesTable.map((tax, index) => (
                <DeviTax key={index} tax={tax} />
              ))}
            </tbody>
          </table>
          <TotalAmount>
          <Typography variant="h5" className="text-right font-semibold">
              Sous-Total : {sousTotale.toFixed(2)} DH
            </Typography>
            <Box m={2}/>  
            <Typography variant="h5" className="text-right font-semibold">
              Montant total: {devi.amount.toFixed(2)} DH
            </Typography>
          </TotalAmount>
          <Signature>
            <Typography>Signature:</Typography>
            <img
              src={devi.userSignature.url}
              alt="Signature"
              className="mt-2"
            />
          </Signature>
        </DeviContainer>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{ "@media print": { display: "none" } }}
        >
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(-1)}
              sx={{
                backgroundColor: "#ff7b00",
                color: "#fff",
                "&:hover": { backgroundColor: "#cc6200" },
              }}
            >
              Annuler
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DeviDetails;

// Styles
const DeviContainer = styled.div`
  font-family: Arial, sans-serif;
  padding: 20px;
`;
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const Logo = styled.img`
  max-width: 150px;
`;
const UserInfo = styled.div`
  text-align: right;
`;
const ClientInfo = styled.div`
  margin-bottom: 20px;
`;
const DeviMeta = styled.div`
  margin-bottom: 20px;
`;
const TotalAmount = styled.div`
  text-align: right;
  margin-bottom: 20px;
`;
const Signature = styled.div`
  text-align: left;
  margin-top: 40px;

  img {
    max-width: 200px;
  }
`;
