import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import { API } from "aws-amplify";

import { createSuperheroDB, updateSuperheroDB } from "../../graphql";

const classes = {
  addRuleForm: {
    marginTop: "20%",
    marginLeft: "10%",
    marginRight: "10%",
  },
  TextArea: {
    marginBottom: "30px",
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#000000",
    },
  },
  TextAreaRangeStart: {
    width: "45%",
    marginBottom: "30px",
  },
  TextAreaRangeEnds: {
    width: "45%",
    float: "right",
  },
  buttonAdd: {
    borderRadius: "50px",
    marginTop: "10px",
    color: "white",
    backgroundColor: "#000000",
    height: "50px",
    border: "1px ridge",
    "&:hover": {
      backgroundColor: "#000000",
      color: "white",
      border: "1px ridge",
    },
  },
  cancelbuttonEdit: {
    borderRadius: "50px",
    marginTop: "10px",
    width: "47.5%",
    color: "#000000",
    backgroundColor: "white",
    height: "50px",
    border: "1px ridge",
    "&:hover": {
      backgroundColor: "white",
      color: "#000000",
      border: "1px ridge",
    },
  },
  saveButtonEdit: {
    borderRadius: "50px",
    marginTop: "10px",
    width: "47.5%",
    color: "white",
    backgroundColor: "#000000",
    height: "50px",
    border: "1px ridge",
    "&:hover": {
      backgroundColor: "#000000",
      color: "white",
      border: "1px ridge",
    },
  },
  HelperTextDesign: {
    marginLeft: "0px",
  },
  categoriesHelperText: {
    color: "#d32f2f",
    marginBottom: "30px",
  },
};

const AddEditHero = (props) => {
  const init_state = {
    id: uuidv4(),
    name: "",
    powers: [],
    backstory: "",
  };

  const [currentSuperhero, setCurrentSuperhero] = useState(
    props.selectedSuperhero || init_state
  );
  const [loading, setLoading] = useState(false);
  const [checkValid, setCheckValid] = useState(false);

  useEffect(() => {
    if (props.selectedSuperhero) {
      setCurrentSuperhero(props.selectedSuperhero);
    } else {
      setCurrentSuperhero(init_state);
    }
  }, [props.selectedSuperhero]);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 60,
      minHeight: 35,
      marginBottom:
        checkValid && currentSuperhero["powers"].length == 0 ? "0px" : "30px",
      whiteSpace: "nowrap",
      overflowY: "scroll",
      border:
        checkValid && currentSuperhero.powers.length == 0
          ? "1px solid #d32f2f"
          : "1px solid #D3D3D3",
      boxShadow: "none",
      borderColor:
        checkValid && currentSuperhero.powers.length == 0
          ? "#d32f2f"
          : "#167595",
      "&:hover": {
        borderColor:
          checkValid && currentSuperhero.powers.length == 0
            ? "#d32f2f"
            : "#167595",
      },
      "&:focus": {
        borderColor:
          checkValid && currentSuperhero.powers.length == 0
            ? "#d32f2f"
            : "#167595",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 100,
    }),
  };

  const updateHero = (key, value) => {
    setCurrentSuperhero({
      ...currentSuperhero,
      [key]: value,
    });
  };

  /* 
    Request Function to insert list of all Superheroes from Dynamo DB
    Mutation: createSuperheroDB
    Payload: {id, name, powers, backstory}
    Sample Response: {id, name, powers, backstory}
    Authorization mode: API Key
  */

  const saveChanges = async () => {
    setCheckValid(true);
    // Check if Form Valid
    if (checkIsValid()) {
      // Insert into dynamoDB using GraphQL API
      console.log("calling add function in appsync");
      const superheroDetails = {
        id: currentSuperhero.id,
        name: currentSuperhero.name,
        powers: currentSuperhero.powers,
        backstory: currentSuperhero.backstory,
      };

      const isInserted = await API.graphql({
        query: createSuperheroDB,
        variables: { input: superheroDetails },
        authMode: "API_KEY",
      });
      console.log("got response:", isInserted);
      if (isInserted.hasOwnProperty("data")) {
        setLoading(true);
        let updatedHero = {
          ...currentSuperhero,
          id: isInserted.data.createSuperheroDB.id,
        };
        props.setSuperheros([...props.superheros, updatedHero]);
        resetFormState();
        setLoading(false);
      } else {
        setLoading(false)
      }
    }
  };

  // Function to reset Form State once user click on save button
  const resetFormState = () => {
    setCurrentSuperhero(init_state);
    props.setSelectedSuperhero(undefined);
    props.setAction("add");
    setCheckValid(false);
  };

  // Reset Form if user click Cancel button
  const cancelChanges = () => {
    resetFormState();
  };

  /* 
    Request Function to Update list of all Superheroes from Dynamo DB
    Mutation: updateSuperheroDB
    Payload: {id, name, powers, backstory}
    Sample Response: {id, name, powers, backstory}
    Authorization mode: API Key
  */

  const updateChanges = async () => {
    setCheckValid(true);
    setLoading(true);
    if (checkIsValid()) {
      console.log("calling update function in appsync");
      const superheroDetails = {
        id: currentSuperhero.id,
        name: currentSuperhero.name,
        powers: currentSuperhero.powers,
        backstory: currentSuperhero.backstory,
      };

      const isUpdated = await API.graphql({
        query: updateSuperheroDB,
        variables: { input: superheroDetails },
        authMode: "API_KEY",
      });

      if (isUpdated.hasOwnProperty("data")) {
        let prevList = props.superheros;
        prevList.map((hero, index) => {
          if (hero.id == currentSuperhero.id) {
            prevList[index] = currentSuperhero;
          }
        });
        props.setSuperheros(prevList);
        resetFormState();
        setLoading(false);
      }
    } else {
      setLoading(false)
    }
  };

  // Form Validation function which checks if all fields are inserted
  const checkIsValid = () => {
    let flag =
      currentSuperhero["name"].length > 0 &&
      currentSuperhero["powers"].length > 0 &&
      currentSuperhero["backstory"].length > 0
        ? true
        : false;
    return flag;
  };

  return (
    <>
      <div style={classes.addRuleForm}>
        <TextField
          id="outlined-basic"
          label="Add superhero name"
          variant="outlined"
          sx={classes.TextArea}
          value={currentSuperhero["name"]}
          onChange={(e) => updateHero("name", e.target.value)}
          error={checkValid && currentSuperhero["name"].trim() == ""}
          helperText={
            checkValid && currentSuperhero["name"].trim() == ""
              ? "Name field cannot be empty"
              : ""
          }
          FormHelperTextProps={{
            sx: classes.HelperTextDesign,
          }}
          fullWidth
        />
        <Select
          isMulti
          name="options"
          placeholder={<div>Select powers</div>}
          getOptionValue={(options) => options.name}
          options={props.powers}
          value={currentSuperhero["powers"]}
          onChange={(e) => updateHero("powers", e)}
          styles={customStyles}
        />
        {checkValid && currentSuperhero["powers"].length == 0 && (
          <FormHelperText
            id="component-helper-text"
            sx={classes.categoriesHelperText}
          >
            Categories field cannot be empty
          </FormHelperText>
        )}
        <TextField
          multiline
          rows={5}
          label="Add backstory"
          variant="outlined"
          sx={classes.TextArea}
          value={currentSuperhero["backstory"]}
          onChange={(e) => updateHero("backstory", e.target.value)}
          error={checkValid && currentSuperhero["backstory"].trim() == ""}
          helperText={
            checkValid && currentSuperhero["backstory"].trim() == ""
              ? "Parameter field cannot be empty"
              : ""
          }
          FormHelperTextProps={{
            sx: classes.HelperTextDesign,
          }}
          fullWidth
        />
        {props.action == "add" ? (
          <Button
            variant="outlined"
            sx={classes.buttonAdd}
            onClick={() => saveChanges()}
            fullWidth
          >
            {loading ? <CircularProgress /> : <>Save new superhero</>}
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              sx={classes.cancelbuttonEdit}
              style={{ marginRight: "5%" }}
              onClick={() => cancelChanges()}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              sx={classes.saveButtonEdit}
              onClick={() => updateChanges()}
              fullWidth
            >
              {loading ? <CircularProgress /> : <>Save</>}
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default AddEditHero;
