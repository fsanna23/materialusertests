import React, { useState, useRef } from "react";
import InsertPhotoIcon from "@material-ui/icons/InsertPhoto";
import { IconButton } from "@material-ui/core";
import { newSurveyStyle } from "../styles";

const useStyles = newSurveyStyle;

/*NOTE: the Material UI ToolTip component needs a child that accepts a ref,
therefore I need to change the functional component into a forwardRef.*/

const ImageInputBtn = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const fileInput = useRef(null);

  /*  Simulates the click on the input file */
  const onAddImage = () => {
    fileInput.current.click();
  };

  /*  Changes the image and creates a new content, adding it to the state */
  const onChangeImage = (e) => {
    const myImg = e.target.files[0];
    // RETURN IMAGE
    props.changeImage(myImg);
  };

  return (
    <IconButton
      className={classes.manageSurveyBoxIcon}
      onClick={() => {
        onAddImage();
      }}
      ref={ref}
      {...props}
    >
      <InsertPhotoIcon />
      <input
        style={{
          display: "none",
          top: "0px",
          right: "0px",
        }}
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={onChangeImage}
        onClick={(event) => {
          // Used to let the user select the same file if needed
          event.target.value = null;
        }}
      />
    </IconButton>
  );
});

export default ImageInputBtn;
