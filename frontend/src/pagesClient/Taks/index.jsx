import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, useTheme, Button, IconButton } from "@mui/material";
import { useUpdateTaxMutation } from "state/api";
import Header from "componentsAdmin/Header";
import { DataGrid } from "@mui/x-data-grid";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import FlexBetween from "componentsAdmin/FlexBetween";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
// hello

const Categories = () => {
  const navigate = useNavigate();
  if (!localStorage.getItem("userId")) {
    navigate("/");
  }
  const theme = useTheme();
  const id = localStorage.getItem("userId");
  const [Taks, setTaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userName = localStorage.getItem("userName");
  const isNonMobile = useMediaQuery("(min-width: 1000px)");

  // hadi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/Api/Tax/Entreprise/${id}`
        );
        setTaks(response.data);
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
  const [updateTaks] = useUpdateTaxMutation();

  const columns = [
    {
      field: "name",
      headerName: "Taxes",
      flex: 1,
    },
    {
      field: "TaksValleur",
      headerName: "Valeur",
      flex: 1,
      renderCell: (params) => {
        const Taxe = params.value;
        return <span>{Taxe} %</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.2,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row._id)}
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
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

  const handleEdit = (id) => {
    window.location.href = `/${userName}/Taks/edit/${id}`;
  };

  const handleDelete = async (id) => {
    try {
      const thisTax = Taks.find((t) => t._id === id)
      if(thisTax) {
        thisTax.active = false
        const {data} = await updateTaks({id, taxData: thisTax})
        if(data.success) {
          toast.success("Le Taxe est supprimé avec succès");
          setTaks(Taks.filter((t) => t._id !== id));
        } else {
          toast.error("La suppresion de Taxe a échoué");
        }
      }
      // window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Taxes" subtitle="Liste de Vos Taxes" />
        <Link to={`/${userName}/Taks/new`}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddOutlinedIcon />}
            sx={{ mt: 3, mb: 2 }}
          >
            Ajouter un Taxe
          </Button>
        </Link>
      </FlexBetween>

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
          loading={isLoading}
          getRowId={(row) => row._id}
          rows={Taks || []}
          columns={columns}
        />
      </Box>
    </Box>
  );
};

export default Categories;
