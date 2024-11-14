import React, { useState } from "react";
import { TextField, useTheme, Button, Box } from "@mui/material";
import Header from "componentsAdmin/Header";
import { useAddServiceMutation } from "state/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddService = () => {
  const navigate = useNavigate()
  if(!localStorage.getItem('userId')) {
    navigate('/');
  }
  const theme = useTheme();
  const [serviceName, setServiceName] = useState("");
  const [addService] = useAddServiceMutation();
  const Navigate = useNavigate();

  const handleChange = (e) => {
    setServiceName(e.target.value); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const {data} = await addService( { ServiceName: serviceName });
      if (data.success) {
        toast.success("Service ajouté avec success");
        Navigate("/Services");
      } else {
        toast.error("Le service ne s'ajoute pas avec success");
        console.log(data.error);
      }
    } catch (error) {
      console.log(error);
    }
    
  };

  return (
    <Box m="1.5rem 2.5rem" >
      <Header title="AJOUTE DE SERVICES" subtitle="Ajoute d'une nouvelle service" />
      <form onSubmit={handleSubmit} sx={{
        backgroundImage: "none",
        backgroundColor: theme.palette.background.alt,
        borderRadius: "0.55rem",
      }} >
        <TextField
          label="Service Name"
          
          name="ServiceName"
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Add Service
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddService;
