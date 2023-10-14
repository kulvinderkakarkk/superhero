import React from "react";
import { Grid, AppBar, Button } from "@mui/material";
import Image from "next/image";
import * as superhero_img from "../../assets/test3.png";

const classes = {
  textColorInherit: {
    width: "13%",
    color: "red",
    fontFamily: "Arial",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "50px",
    letterSpacing: "0.6px",
    display: "contents",
  },
  imageResize: {
    marginTop: "12px",
    height: "30px",
    width: "175px",
    marginLeft: "20px",
  },
  buttonPos: {
    marginLeft: "20px",
  },
};

const Navbar = ({ signOut, user }) => {
  return (
    <div sx={classes.root}>
      <AppBar position="static" color="inherit">
        <Grid justify={"left"} container>
          <Grid xs={11} item>
            <Image
              style={classes.imageResize}
              src={superhero_img}
              alt="superhero LOGO"
            />
          </Grid>
          <Grid xs={1} item>
            <Grid sx={classes.buttonPos} container>
              <Button
                disableRipple
                sx={classes.textColorInherit}
                onClick={signOut}
                color="inherit"
              >
                sign out
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </AppBar>
    </div>
  );
};

export default Navbar;
