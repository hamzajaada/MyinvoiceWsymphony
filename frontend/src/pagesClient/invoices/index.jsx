import React, { useEffect, useState } from "react";
import {
  Box,
  useTheme,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useGetOnePackQuery, useUpdateInvoiceMutation } from "state/api";
import Header from "componementClient/Header";
import FlexBetween from "componentsAdmin/FlexBetween";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleOutline,
  HourglassEmpty,
  ErrorOutline,
} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import EmailIcon from "@mui/icons-material/Email";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";
import { toast } from "react-toastify";

const Invoices = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  if (!localStorage.getItem("userId")) {
    navigate("/");
  }
  const [updateInvoice] = useUpdateInvoiceMutation();
  const packId = localStorage.getItem("packId");
  const id = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const formPdf = "6630fdb21c1fec2176ead2c1";
  const { data: packData } = useGetOnePackQuery(packId);
  const [Facture, setFacture] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatePdf, setGeneratePdf] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const isNonMobile = useMediaQuery("(min-width: 1000px)");
  const isNoMobile = useMediaQuery("(min-width: 680px)");


  useEffect(() => {
    if (packData) {
      setGeneratePdf(
        packData.services.some((service) => service.serviceId._id === formPdf)
      );
      
    }
  }, [packData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/Api/Invoice/List/${id}`
        );
        setFacture(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "";
    }
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("fr-FR", options);
  };

  const columns = [
    {
      field: "_id",
      headerName: "Numéro de Facture",
      flex: 0.7,

      renderCell: (params) => (
        <span
          style={{
            display: "inline-block",
            fontWeight: "bold",
            color: "white",
            backgroundColor: "gray",
            borderRadius: "4px",
            padding: "5px 10px",
            lineHeight: "1",
          }}
        >
          #{params.value}
        </span>
      ),
    },
    {
      field: "clientId",
      headerName: "Client",
      flex: 1,
      renderCell: (params) => params.row.clientId.name,
    },
    {
      field: "date",
      headerName: "Date de création",
      flex: 0.7,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "dueDate",
      headerName: "Date d'échéance",
      flex: 0.5,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "items",
      headerName: "Produits",
      flex: 0.4,
      sortable: false,
      renderCell: (params) => {
        // Sum the quantities of all items in the array
        const totalQuantity = params.value.reduce(
          (acc, curr) => acc + curr.quantity,
          0
        );
        return totalQuantity;
      },
    },
    {
      field: "amount",
      headerName: "Montant",
      flex: 0.5,
      renderCell: (params) => {
        // Extract the amount from the payments array
        const paymentAmounts = params.value;
        const textColor = theme.palette.mode === "dark" ? "cyan" : "green";
        // Display the total amount
        return (
          <span style={{ color: textColor }}>
            {paymentAmounts.toFixed(2)} DH
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (params) => {
        const status = params.value;
        let icon, backgroundColor;

        switch (status) {
          case "sent":
            icon = (
              <HourglassEmpty style={{ color: "white", fontSize: "1rem" }} />
            );
            backgroundColor = "orange";
            break;
          case "paid":
            icon = (
              <CheckCircleOutline
                style={{ color: "white", fontSize: "1rem" }}
              />
            );
            backgroundColor = "green";
            break;
          case "late":
            icon = (
              <ErrorOutline style={{ color: "white", fontSize: "1rem" }} />
            );
            backgroundColor = "red";
            break;
          default:
            icon = null;
            backgroundColor = "transparent";
        }

        return (
          <span
            style={{
              display: "inline-block",
              alignItems: "center",
              color: "white",
              backgroundColor: backgroundColor,
              borderRadius: "4px",
              padding: "5px 10px",
              lineHeight: "1",
            }}
          >
            {icon} {status}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleDetails(params.row._id)}
            aria-label="details"
          >
            <InfoIcon />
          </IconButton>
          <IconButton
            onClick={() => handleEdit(params.row._id)}
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleEmail(params.row._id)}
            aria-label="email"
          >
            <EmailIcon />
          </IconButton>
          {/*{generatePdf === true ? (*/}
            <IconButton
              onClick={() => {
                setSelectedInvoiceId(params.row._id);
                setOpenDialog(true);
              }}
              aria-label="print"
            >
              <PrintIcon />
            </IconButton>
          {/*) : (
            ""  
          )}*/}
          <IconButton
            onClick={() => handleDelete(params.row._id)}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleDetails = (id) => {
    window.location.href = `/${userName}/factures/details/${id}`;
  };

  const handlePrint = (id) => {
    navigate(`/${userName}/factures/imprimer/${id}`);
  };

  const handlePrintLetter = (id) => {
    navigate(`/${userName}/factures/imprimer/letter/${id}`);
  };

  const handlePrintClassic = (id) => {
    navigate(`/${userName}/factures/imprimer/classic/${id}`);
  };

  const handleEmail = (id) => {
    navigate(`/${userName}/factures/email/${id}`);
  };

  const handleEdit = (id) => {
    window.location.href = `/${userName}/factures/edit/${id}`;
  };

  const handleDelete = async (id) => {
    try {
      const thisInvoice = Facture.find((f) => f._id === id);
      if (thisInvoice) {
        thisInvoice.active = false;
        const { data } = await updateInvoice({ id, InvoiceData: thisInvoice });
        if (data.success) {
          toast.success("La Facture a été supprimée ");
          setFacture(Facture.filter((f) => f._id !== id));
        } else {
          toast.error(
            "La suppresion de facture a échoué "
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Box m="1.5rem 2.5rem">
      {isNoMobile ? (
      <FlexBetween>
        <Header
          title="FACTURES"
          subtitle="Liste des bons des "
          total={Facture ? Facture.length : 0}
        />
        <Link to={`/${userName}/ajouterFacture`}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddOutlinedIcon />}
            sx={{ mt: 3, mb: 2 }}
          >
            Ajouter une facture
          </Button>
        </Link>
      </FlexBetween>
    ) : (
      <>
          <Box sx={{ display: "flex"}}>
            <Header
              title="FACTURES"
              subtitle="Liste des bons des "
              total={Facture ? Facture.length : 0}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Link to={`/${userName}/ajouterFacture`}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddOutlinedIcon />}
                sx={{ mt: 3, mb: 2 }}
              >
                Ajouter une facture
              </Button>
            </Link>
          </Box>
        </>
    )}
      <Box
        mt={1}
        height="80vh"
        sx={{
          overflowX: "auto",
          "& .MuiDataGrid-root": {
            border: "none",
            minWidth: isNonMobile ? "none" : "1000px",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            backgroundColor: theme.palette.background.test,
            lineHeight: "2rem",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          loading={isLoading || !Facture}
          getRowId={(row) => row._id}
          rows={Facture}
          columns={columns}
          rowsPerPageOptions={[20, 50, 100]}
          pagination
          paginationMode="server"
        />
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="print-dialog-title"
      >
        <DialogTitle
          id="print-dialog-title"
          sx={{ color: theme.palette.secondary[100] }}
        >
          Choisissez le type d'impression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sélectionnez le modèle que vous souhaitez imprimer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handlePrint(selectedInvoiceId);
              handleDialogClose();
            }}
            sx={{ color: theme.palette.secondary[200] }}
          >
            Modèle simple
          </Button>
          <Button
            onClick={() => {
              handlePrintLetter(selectedInvoiceId);
              handleDialogClose();
            }}
            sx={{ color: theme.palette.secondary[200] }}
          >
            Modèle letter-head
          </Button>
          <Button
            onClick={() => {
              handlePrintClassic(selectedInvoiceId);
              handleDialogClose();
            }}
            sx={{ color: theme.palette.secondary[200] }}
          >
            Modèle Classique
          </Button>
          <Button
            onClick={handleDialogClose}
            sx={{ color: theme.palette.secondary[200] }}
            autoFocus
          >
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
