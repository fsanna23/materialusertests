import React, { useState, useEffect, Fragment } from "react";
import { Grid, Box, Input, IconButton, Tooltip } from "@material-ui/core";
import NewQuestion from "./NewQuestion";
import ImageInputBtn from "./ImageInputBtn";
import pages from "./pages";
// Dialog
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@material-ui/core";
// DragAndDrop
import { DragDropContext, Droppable } from "react-beautiful-dnd";
// Styles
import { newSurveyStyle } from "../styles";
import AddIcon from "@material-ui/icons/Add";
import VideoCallIcon from "@material-ui/icons/VideoCall";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import PostAddIcon from "@material-ui/icons/PostAdd";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import NewImage from "./NewImage";
import NewTextField from "./NewTextField";
const useStyles = newSurveyStyle;

const content_type = {
  QUESTION: "QUESTION",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  TEXT: "TEXT",
};

function NewSurvey(props) {
  const classes = useStyles();
  const [surveyData, setSurveyData] = useState({
    title: "",
    description: "",
  });
  const [sections, setSections] = useState([
    {
      id: 1,
      content: [
        { id: 1, type: content_type.QUESTION, data: {} },
        { id: 2, type: content_type.QUESTION, data: {} },
      ],
    },
  ]);
  const [openDialog, setOpenDialog] = useState(false);

  /*  Updates the state when the drag ends */
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    console.log("The destination is ", destination);
    console.log("The source is ", source);
    console.log("The draggableId is ", draggableId);
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    let newSections = [...sections]; // array of sections
    let sourcePage = sections.find(
      (c) => c.id.toString() === source.droppableId
    ); // section with ID and content
    const sourcePageIndex = sections.indexOf(sourcePage);
    /* Alternative sourcePageIndex -->
    const sourcePageIndex = sections.findIndex(
      (c) => c.id.toString() === source.droppableId
    );
    */
    const movedContent = sourcePage.content.find(
      (c) => c.id.toString() === draggableId
    ); // content that has to be moved

    // Remove the content from the source page
    sourcePage.content.splice(source.index, 1);

    // If the content is moved in the same section that it was before
    if (source.droppableId === destination.droppableId) {
      // Insert the content in the new position of the same section
      sourcePage.content.splice(destination.index, 0, movedContent);
      // Update
      newSections[sourcePageIndex] = sourcePage;
      setSections(newSections);
      return;
    }

    let destinationPage = sections.find(
      (c) => c.id.toString() === destination.droppableId
    );
    const destinationPageIndex = sections.indexOf(destinationPage);
    destinationPage.content.splice(destination.index, 0, movedContent);
    // If the source section has no more content, remove it
    newSections[destinationPageIndex] = destinationPage;
    if (sourcePage.content.length === 0) {
      newSections.splice(sourcePageIndex, 1);
      let counter = sourcePage.id;
      for (let s of newSections) {
        if (s.id > sourcePage.id) {
          s.id = counter;
          counter++;
        }
      }
    } else {
      newSections[sourcePageIndex] = sourcePage;
    }
    setSections(newSections);

    /* OLD
    let newState = content;
    const movedContent = content.find((c) => c.id.toString() === draggableId);

    newState.splice(source.index, 1);
    newState.splice(destination.index, 0, movedContent);
    setContent(newState);*/
  };

  const onSaveSurvey = () => {
    /*  TODO: save survey data */
    console.log("The content is");
    console.log(sections);
  };

  const onChangeSurveyTitle = (e) => {
    setSurveyData({ ...surveyData, title: e.target.value });
  };

  const onChangeSurveyDescription = (e) => {
    setSurveyData({ ...surveyData, description: e.target.value });
  };

  const renderSections = () => {
    return sections.map((section, sectionIndex) => {
      const addContent = (newContent) => {
        let newSections = [...sections];
        newSections[sectionIndex].content = [
          ...newSections[sectionIndex].content,
          newContent,
        ];
        setSections(newSections);
      };

      const onAddQuestion = () => {
        const newQuestion = {
          id: section.content.length + 1,
          type: content_type.QUESTION,
          data: {},
        };
        addContent(newQuestion);
      };

      const onAddImage = (img) => {
        const newImage = {
          id: section.content.length + 1,
          type: content_type.IMAGE,
          data: { img: img },
        };
        addContent(newImage);

        // TODO upload to server
      };

      const onAddTextField = () => {
        const newTextField = {
          id: section.content.length + 1,
          type: content_type.TEXT,
          data: {},
        };
        addContent(newTextField);
      };

      const onOpenEmbedVideoDialog = () => {
        setOpenDialog(true);
      };

      const onCloseEmbedVideoDialog = () => {
        setOpenDialog(false);
      };

      const onAddVideo = (url) => {
        const newVideo = {
          id: section.content.length + 1,
          type: content_type.VIDEO,
          data: { url: url },
        };
        addContent(newVideo);
      };

      const onAddSection = () => {
        const newSection = {
          id: section.id,
          content: [
            {
              id: section.content.length + 1,
              type: content_type.QUESTION,
              data: {},
            },
          ],
        };
        let newSections = [...sections];
        let counter = section.id + 1;
        for (let s of newSections) {
          if (s.id >= section.id) {
            s.id = counter;
            counter++;
          }
        }
        newSections.splice(sectionIndex, 0, newSection);
        setSections(newSections);
      };

      const onRemoveSection = () => {
        let newSections = sections.filter((s, i) => i !== sectionIndex);
        let counter = section.id;
        for (let s of newSections) {
          if (s.id > section.id) {
            s.id = counter;
            counter++;
          }
        }
        console.log("The new sectins are", newSections);
        setSections(newSections);
      };

      const renderContent = (pageContent) => {
        /* TODO: consider move video parsing into a specific component */
        const parseVideoID = (url) => {
          const regexResult = url.match(/^[\s\S]*watch\?v=([\s\S]*)[\s\S]*$/);
          const separatorIndex = regexResult[1].indexOf("&");
          if (separatorIndex !== -1)
            return regexResult[1].substring(0, separatorIndex);
          return regexResult[1];
        };

        const getVideoThumbnail = (videoID) => {
          return `http://img.youtube.com/vi/${videoID}/0.jpg`;
        };

        return pageContent.map((cont, contentIndex) => {
          const updateSection = (newContent) => {
            let newSections = [...sections];
            newSections[sectionIndex].content[contentIndex] = newContent;
            setSections(newSections);
          };

          const removeContent = () => {
            let newContent = section.content.filter(
              (item, itemIndex) => contentIndex !== itemIndex
            );
            let counter = 1;
            for (let c of newContent) {
              c.id = counter;
              counter++;
            }
            updateSection(newContent);
          };

          const updateContent = (updates) => {
            let newContent = { ...cont };
            newContent.data = { ...cont.data, ...updates };
            updateSection(newContent);
          };

          switch (cont.type) {
            case content_type.QUESTION:
              return (
                <NewQuestion
                  key={cont.id}
                  content={cont.data}
                  id={cont.id}
                  index={contentIndex}
                  removeQuestion={removeContent}
                  update={updateContent}
                />
              );
            case content_type.IMAGE:
              return (
                <NewImage
                  key={cont.id}
                  id={cont.id}
                  index={contentIndex}
                  image={cont.data.img}
                  removeImage={removeContent}
                  update={updateContent}
                />
              );
            case content_type.VIDEO:
              /* NOTE: there's no meaning in showing the embedded video in
                 the survey editor, therefore we get the video thumbnail and
                 show that as an image. */
              const thumbnail = getVideoThumbnail(parseVideoID(cont.data.url));
              return (
                <NewImage
                  key={cont.id}
                  id={cont.id}
                  index={contentIndex}
                  url={thumbnail}
                  videoUrl={cont.data.url}
                  removeImage={removeContent}
                  update={updateContent}
                />
              );
            case content_type.TEXT:
              return (
                <NewTextField
                  key={cont.id}
                  id={cont.id}
                  index={contentIndex}
                  removeTextField={removeContent}
                  update={updateContent}
                />
              );
          }
        });
      };

      return (
        <Droppable
          key={"droppable-" + section.id}
          droppableId={section.id.toString()}
        >
          {(provided) => (
            <Grid
              container
              ref={provided.innerRef}
              {...provided.droppableProps}
              direction="column"
              justify="center"
              alignItems="center"
              id={"droppablegridcontainer-" + section.id}
              className={
                sections.length === 1
                  ? classes.questionsContainerGridHidden
                  : classes.questionsContainerGrid
              }
            >
              {sections.length === 1 ? (
                <Fragment />
              ) : (
                <Box className={classes.sectionNameContainer}>
                  <Typography variant="h6">
                    {"Section " + section.id}
                  </Typography>
                </Box>
              )}
              {renderContent(section.content)}
              {provided.placeholder}
              <Box
                component="span"
                id={"managesurveybox-" + section.id}
                className={
                  sections.length === 1
                    ? classes.manageSurveyBox
                    : classes.manageSurveyBoxSection
                }
              >
                <Tooltip title="Add question">
                  <IconButton
                    className={classes.manageSurveyBoxIcon}
                    onClick={() => {
                      onAddQuestion();
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Insert image">
                  <ImageInputBtn changeImage={onAddImage} />
                </Tooltip>
                <Tooltip title="Embed video">
                  <IconButton
                    className={classes.manageSurveyBoxIcon}
                    onClick={onOpenEmbedVideoDialog}
                  >
                    <VideoCallIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add text field">
                  <IconButton
                    className={classes.manageSurveyBoxIcon}
                    onClick={onAddTextField}
                  >
                    <TextFieldsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add section">
                  <IconButton
                    className={classes.manageSurveyBoxIcon}
                    onClick={onAddSection}
                  >
                    <PostAddIcon />
                  </IconButton>
                </Tooltip>
                {sections.length !== 1 ? (
                  <Tooltip title="Remove section">
                    <IconButton
                      className={classes.manageSurveyBoxIcon}
                      onClick={onRemoveSection}
                    >
                      <DeleteSweepIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Fragment />
                )}
              </Box>
              {openDialog === true ? (
                <EmbedVideoDialog
                  open={openDialog}
                  handleClose={onCloseEmbedVideoDialog}
                  handleSubmit={onAddVideo}
                />
              ) : (
                <Fragment />
              )}
            </Grid>
          )}
        </Droppable>
      );
    });
  };

  return (
    <Grid
      id="newsurveycontainer"
      container
      direction="column"
      justify="center"
      alignItems="center"
      className={classes.surveyGrid}
    >
      <Box width="60%" className={classes.surveyForm} id="firstboxcontainer">
        <Box width="100%">
          <form style={{ width: "100%" }}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              id="secondgridcontainer"
            >
              <Box width="70%" className={classes.titleInputBox}>
                <Input
                  placeholder="Your survey title"
                  inputProps={{ "aria-label": "description" }}
                  className={classes.titleInput}
                  fullWidth
                  value={surveyData.title}
                  onChange={onChangeSurveyTitle}
                />
              </Box>
              <Box width="50%" className={classes.titleInputBox}>
                <Input
                  placeholder="Your survey description"
                  inputProps={{ "aria-label": "description" }}
                  className={classes.descInput}
                  fullWidth
                  value={surveyData.description}
                  onChange={onChangeSurveyDescription}
                />
              </Box>
            </Grid>
            <DragDropContext onDragEnd={onDragEnd}>
              {renderSections()}
            </DragDropContext>
          </form>
          <Grid item className={classes.bottomButtonsContainer}>
            <Button
              variant="contained"
              color="primary"
              className={classes.bottomButton}
              onClick={() => {
                props.setPage(pages.MAIN);
              }}
            >
              Back to home page
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.bottomButton}
              onClick={() => {
                onSaveSurvey();
              }}
            >
              Save survey
            </Button>
          </Grid>
        </Box>
      </Box>
      {/*{openDialog === true ? (
        <EmbedVideoDialog
          open={openDialog}
          handleClose={onCloseEmbedVideoDialog}
          handleSubmit={onAddVideo}
        />
      ) : (
        <Fragment />
      )}*/}
    </Grid>
  );
}

function EmbedVideoDialog(props) {
  const [url, setUrl] = useState("");

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Embed video</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To embed a YouTube video into the survey, please insert its URL.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="embedvideourlfield"
          label="URL"
          type="url"
          fullWidth
          onChange={handleChange}
          value={url}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.handleClose();
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.handleSubmit(url);
            props.handleClose();
          }}
          color="primary"
        >
          Embed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewSurvey;
