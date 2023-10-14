import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { API } from "aws-amplify";

import SuperheroTable from "./SuperheroTable.js";
import AddEditHero from "./AddEditHero.js";
import { getAllSuperherosDB } from "../../graphql";

const classes = {
  root: { 
    marginLeft: "56px", 
    marginRight: "56px" 
  },
  itemConatiner: {
    height: "75vh",
  },
  loadingContainer: {
    height: "100%",
    width: "100%",
  },
  paper: {
    height: "100%",
    width: "100%",
    boxShadow: "none",
    overflow: "auto",
    backgroundColor: "white",
    position: "relative",
    scrollbarColor: "red yellow",
    "&::-webkit-scrollbar": {
      width: "5px",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 5px rgb(255, 251, 251)",
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#BEBEBE",
      borderRadius: "10px",
    },
  },
  header: {
    marginTop: "50px",
    marginBottom: "0px",
    fontSize: "18px",
    fontWeight: "700",
    lineHeight: "40px",
  },
};

const SuperheroList = (props) => {
  const [superheros, setSuperheros] = useState([]);
  const [action, setAction] = useState("add");
  const [selectedSuperhero, setSelectedSuperhero] = useState(undefined);
  const [powers, setPowers] = useState([
    { name: "Fly", label: "Fly" },
    { name: "Punch", label: "Punch" },
    { name: "Swim", label: "Swim" },
    { name: "Appear/Disappear", label: "Appear/Disappear" },
    { name: "Predict", label: "Predict" },
  ]);

  // Fetch Superhero List on Dynamo DB on initial Load
  useEffect(() => {
    fetchSuperheroList().then((list) => {
      setSuperheros(list);
    });
  }, []);

  /* 
    Request Function to get list of all Superheroes from Dynamo DB
    Mutation: getAllSuperheroesDB
    Payload: {id, name, powers, backstory}
    Sample Response: {id, name, powers, backstory}
    Authorization mode: API Key
  */
  const fetchSuperheroList = async () => {
    const allSuperheros = await API.graphql({
      query: getAllSuperherosDB,
      authMode: "API_KEY",
    });
    
    if (allSuperheros.hasOwnProperty("data")) {
      const allheroes = allSuperheros.data.getAllSuperherosDB.items;
      return allheroes;
    }
  };

  // Function to Reset Add/Edit Form State
  const resetRuleForm = () => {
    setSelectedSuperhero(undefined);
  };
  
  return (
    <div style={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <Typography variant="h6" sx={classes.header}>
            Superhero list
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h6" sx={classes.header}>
            Add new superhero
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={classes.container}>
        <Grid item xs={8} sx={classes.itemConatiner}>
          <Paper sx={classes.paper}>
            <SuperheroTable
              superheros={superheros}
              setSuperheros={setSuperheros}
              setAction={setAction}
              selectedSuperhero={selectedSuperhero}
              setSelectedSuperhero={setSelectedSuperhero}
              resetRuleForm={() => resetRuleForm()}
            />
          </Paper>
        </Grid>
        <Grid item xs={4} sx={classes.itemConatiner}>
          <Paper sx={classes.paper}>
            <AddEditHero
              powers={powers}
              superheros={superheros}
              setSuperheros={setSuperheros}
              action={action}
              setAction={setAction}
              selectedSuperhero={selectedSuperhero}
              setSelectedSuperhero={setSelectedSuperhero}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default SuperheroList;
