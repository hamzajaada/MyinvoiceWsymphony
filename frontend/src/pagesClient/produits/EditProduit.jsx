import React, { useState, useEffect } from "react";
import {
  useMediaQuery,
  TextField,
  useTheme,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import Header from "componentsAdmin/Header";
import {
  useGetAllCategoriesQuery,
  useUpdateProduitMutation,
  useGetOneProduitQuery,
} from "state/api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditProduit = () => {
  const Navigate = useNavigate();
  if (!localStorage.getItem("userId")) {
    Navigate("/");
  }
  const theme = useTheme();
  const { id } = useParams();
  const { data: produitData } = useGetOneProduitQuery(id);
  const { data: categorieData } = useGetAllCategoriesQuery(localStorage.getItem('userId'));
  const [produit, setProduit] = useState({
    categoryId: "",
    name: "",
    description: "",
    quantity: 0,
    price: 0,
  });

  useEffect(() => {
    if (produitData) {
      setProduit(produitData);
    }
  }, [produitData]);

  const [editProduit] = useUpdateProduitMutation();
  const userName = localStorage.getItem("userName");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduit((prevProduit) => ({
      ...prevProduit,
      [name]:
        name === "quantity" || name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleCategoryChange = (event) => {
    setProduit({ ...produit, categoryId: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const {data} = await editProduit({ id, ProduitData: produit });
      if(data.success) {
        toast.success("Le Produit a été modifié avec succès")
        Navigate(`/${userName}/produits`);
      } else {
        toast.error("La modification du Produit a échoué")
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      if(produitData) {
        const {data} = await editProduit({ id, ProduitData: { ...produitData, active: false } })
        if(data.success) {
          toast.success("Le Produit a été supprimé avec succès")
          Navigate(`/${userName}/produits`);
        } else {
          toast.error("La Suppresion du Produit a échoué")
        }
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  const isNonMobile = useMediaQuery('(min-width: 480px)');
  return (
    <Box m="1.5rem 2.5rem">
      <Header title="MODIFICATION DU PRODUIT" subtitle="Modification du produit que vus avez sélectionné" />
      <Box m={2} />
      <form
        onSubmit={handleSubmit}
        sx={{
          backgroundImage: "none",
          backgroundColor: theme.palette.background.alt,
          borderRadius: "0.55rem",
        }}
      >
        <TextField
          label="Nom de produit"
          name="name"
          value={produit.name}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={produit.description}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Prix"
          name="price"
          type="number"
          value={produit.price}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Quantité"
          name="quantity"
          type="number"
          value={produit.quantity}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="categories-label">Catégorie</InputLabel>
          <Select
            labelId="categories-label"
            id="category-select"
            value={produit.categoryId}
            onChange={handleCategoryChange}

            renderValue={() => {
              const selectedCategorie = categorieData?.find(
                (category) => category._id === produit.categoryId
              );
              return (
                <Typography>
                  {
                    selectedCategorie
                      ? selectedCategorie.categoryName
                      : "Catégorie introuvable"
                  }
                </Typography>
              );
            }}
          >
            {categorieData &&
              categorieData.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.categoryName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Modifier le produit
          </Button>
          <Button
            onClick={handleDelete}
            aria-label="delete"
            sx={{ 
                  display : isNonMobile ? "inline" : "block",
                  ml: isNonMobile ? 2 : 0,
                  mt: isNonMobile ? 0 : 2,
                }}
            variant="contained"
            color="primary"
          >
            Supprimer le produit
          </Button>
        </Box>
        <Box mt={2} display="flex" justifyContent="left">
            <Button
              onClick={() => Navigate(-1)}
              aria-label="cancel"
              variant="contained"
              color="secondary"
            >
              Annuler
            </Button>
          </Box>
      </form>
    </Box>
  );
};

export default EditProduit;