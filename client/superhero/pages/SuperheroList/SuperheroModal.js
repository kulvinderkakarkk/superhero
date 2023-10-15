import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Image from "next/image";

import * as superhero_bg from "../../assets/superhero_bg.jpg";
import * as test3 from "../../assets/test3.png";

const classes = {
  style: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "35%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    padding: 0,
  },
  textboxStyle: {
    wordWrap: "break-word",
    mt: 2,
  },
  photoBox: {
    border: "2px solid red",
  },
  divAlign: { padding: "5%" },
  imageResize: { width: "100%", height: "300px" },
};

export default function SuperheroModal({
  open,
  setOpen,
  superheroName,
  superheroPowers,
  superheroBackstory,
}) {
  const handleOpen = () => setOpen({ ...open, isOpen: true });
  const handleClose = () => setOpen({ isOpen: false, superhero: [] });

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={classes.style}>
          <div sx={classes.photoBox}>
            <Image
              alt="Avatar"
              src={superhero_bg}
              style={classes.imageResize}
            ></Image>
          </div>
          <div style={classes.divAlign}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Please find description of superheros below:
            </Typography>
            <Typography
              id="modal-modal-description"
              align="justify"
              sx={classes.textboxStyle}
            >
              Hey! I am <b>{superheroName}</b>. I am a superhero. I can perform
              a lot of magical stuff that makes me a superhero. I can{" "}
              <b>{superheroPowers}</b>.<b>{superheroBackstory}</b>. That made me
              a true superhero!!
            </Typography>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
