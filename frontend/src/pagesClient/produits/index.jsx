import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, useTheme, Button, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {  useUpdateProduitMutation } from "state/api";
import Header from "componementClient/Header";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlexBetween from "componentsAdmin/FlexBetween";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Products  = () => {
  const theme = useTheme();
  const id = localStorage.getItem('userId');
  const userName = localStorage.getItem("userName");

  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width: 1000px)");
  const isNoMobile = useMediaQuery("(min-width: 680px)");

  const [Product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/Api/Produit/Entreprise/${id}`);
        setProduct(response.data);
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

  const [updateProduit] = useUpdateProduitMutation();
  const columns = [
    {
      field: "name",
      headerName: "Nom",
      flex: 0.7,
      renderCell: (params) => {
        const name = params.value;
        let icon = <ShoppingCartIcon style={{fontSize: '1rem' }} />;
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0px 0.2rem', 
            }}
          >
            {icon}
            <span style={{ marginLeft: '0.25rem', fontSize: '0.8rem',}}>{name}</span>
          </div>
        );
    },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
        field: "categoryId",
        headerName: "Catégorie",
        flex: 0.6,
        renderCell: (params) => params.row.categoryId.categoryName,
    },
    {
        field: "quantity",
        headerName: "Quantité",
        flex: 0.5,
    },
    {
        field: "price",
        headerName: "Prix",
        flex: 0.5,
        renderCell: (params) => {
            const textColor = theme.palette.mode === "dark" ? "cyan" : "green";
            // Display the total amount
            return (
              <span style={{ color: textColor }}>
                  {params.value.toFixed(2)} DH
              </span>
              );
        },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
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
    window.location.href = `/${userName}/produits/edit/${id}`;
    };
  
    const handleDelete = async (id) => {
      try {
        const thisProd = Product.find((p) => p._id === id)
        if(thisProd) {
          thisProd.active = false
          const {data} = await updateProduit({id, ProduitData: thisProd})
          if(data.success) {
            toast.success("Le Produit a été supprimé avec succès")
            setProduct(Product.filter((p) => p._id !== id))
          } else {
            toast.error("La Suppresion du Produit a échoué")
          }
        }
        // window.location.reload()
      } catch (error) {
        console.log(error);
      }
    };


  return (
    <Box m="1.5rem 2.5rem">
      {isNoMobile ? (
      <FlexBetween>
        <Header title="PRODUITS" subtitle="Liste entier de vos "   total= {Product ? Product.length : 0} />        
        <Link to={`/${userName}/ajouterProduit`}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddOutlinedIcon />}
            sx={{ mt: 3, mb: 2 }}
          >
            Ajouter un produit
          </Button>
        </Link>
      </FlexBetween>
          ) : (
            <>
                <Box sx={{ display: "flex"}}>
                  <Header
                    title="PRODUITS"
                    subtitle="Liste entier de vos "
                    total= {Product ? Product.length : 0}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Link to={`/${userName}/ajouterProduit`}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddOutlinedIcon />}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Ajouter un produit
                    </Button>
                  </Link>
                </Box>
              </>
          )}
      {/* <AddButton label="Nouveau Produit"  /> */}
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
          loading={isLoading }
          getRowId={(row) => row._id}
          rows={Product}
          columns={columns}
          rowsPerPageOptions={[20, 50, 100]}
          pagination
          paginationMode="server"
        />
      </Box>
    </Box>
  );
};

export default Products;