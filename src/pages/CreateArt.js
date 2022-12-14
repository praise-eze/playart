import React, { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar/Navbar";
import {
  RoundButtonInputArt,
  RoundButtonTools,
} from "../components/RoundButton/RoundButtonTools";
import styles from "./styles/CreateArt.module.scss";
import CanvasDraw from "react-canvas-draw";
import {
  UilEye,
  UilEyeSlash,
  UilSun,
  UilMoon,
  UilImageDownload,
  UilHistoryAlt,
  UilSave,
  UilTrash,
  UilPen,
} from "@iconscout/react-unicons";
import { ChromePicker } from "react-color";
import rgbHex from "rgb-hex";
import { PrettoSlider } from "../components/Addons/Slider";
import { BrushPreviewCircle } from "../components/Addons/BrushPreviewCircle";
import { MaterialUISwitch } from "../components/Addons/SwitchButton";
import { FormControlLabel } from "@mui/material";
import { Back, Paint } from "@icon-park/react";
import { useParams } from "react-router-dom";
import Moralis from "moralis-v1";
import InputArtField from "../components/Addons/InputArtField";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import LoadingBar from "react-top-loading-bar";
import debounce from "lodash.debounce";
import { useDebounce } from "use-debounce";
import PreviewAndShareModal from "../components/Modals/PreviewAndShareModal";
import Emptybar from "../components/Emptybar/Emptybar";

export const CreateArt = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushRadius, setBrushRadius] = useState(10);
  const [allowPublicEdit, setAllowPublicEdit] = useState(false);
  const [allowPublicMint, setAllowPublicMint] = useState(false);
  const [lazyRadius, setLazyRadius] = useState(1);
  const [savedData, setSavedData] = useState("");
  const [artName, setArtName] = useState("");
  const [debouncedArtName] = useDebounce(artName, 1000);
  const [artUrlData, setArtUrlData] = useState("");
  const [creator, setCreator] = useState("");
  const { address, isConnected } = useAccount();
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [artData, setArtData] = useState([]);
  const [showPreviewAndHideModal, setShowPreviewAndHideModal] = useState(false);

  const navigate = useNavigate();
  const saveableCanvas = useRef("");

  const { object_id } = useParams();

  useEffect(() => {
    const loadMoralis = async () => {
      await Moralis.start({
        appId: process.env.REACT_APP_APPLICATION_ID,
        serverUrl: process.env.REACT_APP_SERVER_URL,
        masterKey: process.env.REACT_APP_MASTER_KEY,
      });
    };
    loadMoralis();
    LoadData();
  }, []);

  useEffect(() => {
    LoadData();
  }, [address]);

  const LoadData = async () => {
    setSavedData(saveableCanvas?.current?.getSaveData());
    setArtUrlData(saveableCanvas?.current?.getDataURL());
    setProgress(20);
    const ArtTestData = Moralis.Object.extend("ArtTestData");
    // console.log("checking ...");
    const artTestDataquery = new Moralis.Query(ArtTestData);

    artTestDataquery.get(object_id?.toString()).then(
      async (Dataquery) => {
        ////// UPDATE ALL STATES /////////////
        setProgress(50);
        setShowNavbar(Dataquery?.attributes.ShowNavbar);
        setShowColorPalette(Dataquery?.attributes.ShowColorPalette);
        setBrushColor(Dataquery?.attributes.BrushColor);
        setBrushRadius(Dataquery?.attributes.BrushRadius);
        setAllowPublicEdit(Dataquery?.attributes.AllowPublicEdit);
        setAllowPublicMint(Dataquery?.attributes.AllowPublicMint);
        setLazyRadius(Dataquery?.attributes.LazyRadius);
        setSavedData(Dataquery?.attributes.SavedData);
        setArtName(Dataquery?.attributes.ArtName);
        setCreator(Dataquery?.attributes.ArtCreator);
        setArtUrlData(Dataquery?.attributes.ArtUrlData);
        saveableCanvas.current.loadSaveData(Dataquery?.attributes.SavedData);
        // console.log(Dataquery?.attributes.AllowPublicEdit);
        // console.log(allowPublicEdit);
        /*
        console.log(Dataquery?.attributes.ShowNavbar);
        console.log(Dataquery?.attributes.ShowColorPalette);
        console.log(Dataquery?.attributes.BrushColor);
        console.log(Dataquery?.attributes.BrushRadius);
        console.log(Dataquery?.attributes.AllowPublicEdit);
        console.log(Dataquery?.attributes.LazyRadius);
        console.log(Dataquery?.attributes.SavedData);
        */
        //  console.log(Dataquery);
        debounceSaveData(
          Dataquery?.attributes.ShowNavbar,
          Dataquery?.attributes.ShowColorPalette,
          Dataquery?.attributes.BrushColor,
          Dataquery?.attributes.BrushRadius,
          Dataquery?.attributes.LazyRadius,
          Dataquery?.attributes.AllowPublicEdit,
          Dataquery?.attributes.AllowPublicMint,
          Dataquery?.attributes.ArtName,
          Dataquery?.attributes.ArtCreator
        );
        ////// END UPDATE ALL STATES /////////////
        setArtData(Dataquery);
        //  console.log(artData);
        // console.log(object_id);
        setProgress(100);
      },
      (error) => {
        console.log(error);
      }
    );
  };
  window.addEventListener("load", () => {
    setProgress(100);
  });

  useEffect(() => {
    debounceSaveData(
      showNavbar,
      showColorPalette,
      brushColor,
      brushRadius,
      lazyRadius,
      allowPublicEdit,
      allowPublicMint,
      artName,
      creator
    );
  }, [
    showNavbar,
    showColorPalette,
    brushColor,
    brushRadius,
    lazyRadius,
    allowPublicEdit,
    allowPublicMint,
    debouncedArtName,
  ]);

  const SaveData = (
    showNavbar,
    showColorPalette,
    brushColor,
    brushRadius,
    lazyRadius,
    allowPublicEdit,
    allowPublicMint,
    artName,
    creator
  ) => {
    /*
    console.log(allowPublicEdit);
    console.log(isConnected && creator === address);
    console.log(creator);
    console.log(creator, address, isConnected);
    */
    if (allowPublicEdit || (isConnected && creator === address)) {
      setProgress(50);
      const ArtTestData = Moralis.Object.extend("ArtTestData");
      const artTestDataquery = new Moralis.Query(ArtTestData);
      artTestDataquery.get(object_id?.toString()).then(
        async (Dataquery) => {
          setProgress(50);

          Dataquery.set("ShowNavbar", showNavbar);
          Dataquery.set("ShowColorPalette", showColorPalette);
          Dataquery.set("BrushColor", brushColor);
          Dataquery.set("BrushRadius", brushRadius);
          Dataquery.set("LazyRadius", lazyRadius);
          Dataquery.set("SavedData", saveableCanvas.current?.getSaveData());
          Dataquery.set("AllowPublicEdit", allowPublicEdit);
          Dataquery.set("AllowPublicMint", allowPublicMint);
          Dataquery.set("ArtName", artName);
          Dataquery.set("ArtUrlData", saveableCanvas.current?.getDataURL());
          setArtUrlData(Dataquery?.attributes.ArtUrlData);
          // console.log("saved to the mongo");
          Dataquery.set("ArtCreator", isConnected ? address : "");
          setProgress(70);
          setSavedData(Dataquery?.SavedData);
          setArtData(Dataquery);
          await Dataquery.save();
          setProgress(100);
          // console.log(Dataquery);
        },
        (error) => {
          // sendNotification("Invalid post ID", "Post ID was not found", "danger");
          console.log(
            "Failed to create new object, with error code: " + error.message
          );
        }
      );
    }
  };
  const debounceSaveData = useCallback(debounce(SaveData, 2100), []);
  useEffect(() => {
    return () => {
      debounceSaveData.cancel();
    };
  }, []);

  return (
    <>
      <LoadingBar
        color="#F76D6E"
        height="5px"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div
        style={{
          display:
            allowPublicEdit || (isConnected && creator === address)
              ? "block"
              : "none",
        }}
      >
        <div>{showNavbar && <Navbar />}</div>
        <div
          style={{
            margin: "1% 10%",
          }}
        >
          <div
            className={[styles.editCanvasbtn, "edit canvas buttons"].join(" ")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
              <RoundButtonTools
                onClick={() => {
                  navigate("/");
                }}
              >
                <Back theme="outline" size="30" fill="#000000" />
              </RoundButtonTools>
              <br />
              <RoundButtonTools onClick={() => console.log(allowPublicEdit)}>
                <Paint theme="outline" size="30" fill="#000000" />
              </RoundButtonTools>

              <RoundButtonTools
                onClick={() => {
                  saveableCanvas.current.eraseAll();
                }}
              >
                <UilTrash size="30" color="#00000" />
              </RoundButtonTools>
              <RoundButtonTools
                onClick={() => {
                  saveableCanvas.current.undo();
                }}
              >
                <UilHistoryAlt size="30" color="#00000" />
              </RoundButtonTools>
              <RoundButtonTools
                onClick={() => {
                  debounceSaveData(
                    showNavbar,
                    showColorPalette,
                    brushColor,
                    brushRadius,
                    lazyRadius,
                    allowPublicEdit,
                    allowPublicMint,
                    artName,
                    creator
                  );
                }}
              >
                <UilSave size="30" color="#00000" />
              </RoundButtonTools>
              <RoundButtonTools
                onClick={() => {
                  console.log(saveableCanvas.current?.getDataURL());

                  console.log("download the image");
                }}
              >
                <UilImageDownload size="30" color="#00000" />
              </RoundButtonTools>
              <RoundButtonTools>
                <UilSun size="30" color="#00000" />
                {/* <UilMoon size="30" color="#00000" />  */}
              </RoundButtonTools>
              <RoundButtonTools>
                {showNavbar ? (
                  <UilEye
                    onClick={() => setShowNavbar(false)}
                    size="30"
                    color="#00000"
                  />
                ) : (
                  <UilEyeSlash
                    onClick={() => setShowNavbar(true)}
                    size="30"
                    color="#00000"
                  />
                )}
              </RoundButtonTools>
            </div>
            <div className={styles.ExportAspect} style={{ gap: "1em" }}>
              <div style={{ marginLeft: "2em" }}>
                <InputArtField
                  value={artName}
                  onChange={(event) => setArtName(event.target.value)}
                  placeholder="Untitled Art"
                  icon={<UilPen size="24" color="#00000" />}
                />
              </div>
              <div>
                <RoundButtonInputArt
                  padding="0em 1.3em"
                  width="200px"
                  borderRadius="38px"
                  cursor="pointer"
                  onClick={() => {
                    setShowPreviewAndHideModal(true);
                  }}
                >
                  Preview and Share
                </RoundButtonInputArt>
              </div>
            </div>
          </div>
          <div
            className={styles.HeadMainCanvsSection}
            style={{ display: "flex", alignItems: "center", gap: "3%" }}
          >
            <div
              style={{ margin: showNavbar ? ".7em 0em" : "2.5em 0em" }}
              className={styles.CanvasDraw}
            >
              <CanvasDraw
                ref={(canvasDraw) => {
                  saveableCanvas.current = canvasDraw;
                }}
                style={{ borderRadius: "20px" }}
                canvasWidth={810}
                canvasHeight={810}
                brushRadius={brushRadius}
                immediateLoading={true}
                lazyRadius={lazyRadius}
                brushColor={brushColor}
                // saveData={}
                onChange={() => {
                  setSavedData(saveableCanvas.current?.getSaveData());
                  setArtUrlData(saveableCanvas.current?.getDataURL());
                  debounceSaveData(
                    showNavbar,
                    showColorPalette,
                    brushColor,
                    brushRadius,
                    lazyRadius,
                    allowPublicEdit,
                    allowPublicMint,
                    artName,
                    creator
                  );
                }}
              />
            </div>
            <div className={styles.CanvasDrawSettingPanel}>
              {/*//////****    BRUSH PROPS    */}
              <div className={styles.BrushProperties}>
                <div
                  className={styles.BrushPropertiesText}
                  style={{
                    backgroundColor: "rgba(255,255,255,.1)",
                    color: "black",
                    width: "100%",
                    height: "3.7em",
                    padding: "1em 1.9em",
                    fontWeight: "700",
                  }}
                >
                  <span>Properties</span>
                </div>
                <div
                  style={{ overflow: "auto", height: "30em", width: "100%" }}
                >
                  <div style={{ width: "100%", padding: "1em 1em" }}>
                    {showColorPalette && (
                      <div
                        style={{
                          marginTop: ".3em",
                          position: "absolute",
                          zIndex: "9",
                          marginLeft: "-13em",
                        }}
                      >
                        <ChromePicker
                          color={brushColor}
                          onChange={(color) => {
                            setBrushColor(
                              "#" +
                                rgbHex(
                                  color.rgb.r,
                                  color.rgb.g,
                                  color.rgb.b,
                                  color.rgb.a
                                )
                            );
                          }}
                          onChangeComplete={(color) => {
                            setBrushColor(
                              "#" +
                                rgbHex(
                                  color.rgb.r,
                                  color.rgb.g,
                                  color.rgb.b,
                                  color.rgb.a
                                )
                            );
                          }}
                        />
                      </div>
                    )}
                    <span style={{ userSelect: "none", fontSize: "15px" }}>
                      Brush color
                    </span>
                    <div
                      style={{
                        borderRadius: "10px",
                        margin: "0.4em 0.7em",
                        height: "2.5em",
                        padding: "0.45em",
                        border: "1px solid black",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        !showColorPalette
                          ? setShowColorPalette(true)
                          : setShowColorPalette(false)
                      }
                    >
                      <div
                        style={{
                          userSelect: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-around",
                        }}
                      >
                        <span style={{ fontWeight: "600" }}>{brushColor} </span>{" "}
                        <BrushPreviewCircle
                          height={`20px`}
                          width={`20px`}
                          color={brushColor}
                          border="1px solid #8860CE"
                        />
                      </div>
                    </div>

                    {/*  <ReactSlider />
                     */}

                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "1em",
                        }}
                      >
                        <span style={{ fontSize: "15px", userSelect: "none" }}>
                          Brush radius
                        </span>
                        <span style={{ fontWeight: "600", fontSize: "15px" }}>
                          {brushRadius}
                        </span>
                      </div>
                      <div style={{ margin: "0em 0.8em" }}>
                        <PrettoSlider
                          valueLabelDisplay="auto"
                          aria-label="pretto slider"
                          min={1}
                          max={100}
                          value={brushRadius}
                          onChange={(e) => {
                            setBrushRadius(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: "15px", userSelect: "none" }}>
                          Lazy radius
                        </span>
                        <span style={{ fontWeight: "600", fontSize: "15px" }}>
                          {lazyRadius}
                        </span>
                      </div>
                      <div style={{ margin: "0em 0.8em" }}>
                        <PrettoSlider
                          valueLabelDisplay="auto"
                          aria-label="pretto slider"
                          min={1}
                          max={100}
                          value={lazyRadius}
                          onChange={(e) => {
                            setLazyRadius(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: "15px", userSelect: "none" }}>
                      Brush preview
                    </span>
                    <div>
                      <div
                        style={{
                          margin: "0.4em 0.7em",
                          border: "1px solid black",
                          borderRadius: "12px",
                          height: "11em",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <BrushPreviewCircle
                          height={`${brushRadius}px`}
                          width={`${brushRadius}px`}
                          color={brushColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isConnected && (
                <div className={styles.PageSettings}>
                  <div
                    className={styles.BrushPropertiesText}
                    style={{
                      backgroundColor: "rgba(255,255,255,.1)",
                      color: "black",
                      width: "100%",
                      height: "3.7em",
                      padding: "1em 1.9em",
                      fontWeight: "700",
                    }}
                  >
                    <span>Settings</span>
                  </div>
                  <div style={{ width: "100%", padding: "1em 1em" }}>
                    <span>Public Edit</span>
                    <div
                      style={{
                        margin: "0.1em 0.2em",
                        height: "2.5em",
                        cursor: "pointer",
                      }}
                    >
                      <FormControlLabel
                        onChange={(event) => {
                          setAllowPublicEdit(event.target.checked);
                        }}
                        checked={allowPublicEdit}
                        control={<MaterialUISwitch sx={{ m: 1 }} />}
                        label="Yes"
                      />
                    </div>
                  </div>
                  <div style={{ width: "100%", padding: "0.5em 1em" }}>
                    <span>Public Mint</span>
                    <div
                      style={{
                        margin: "0.1em 0.2em",
                        height: "2.5em",
                        cursor: "pointer",
                      }}
                    >
                      <FormControlLabel
                        onChange={(event) => {
                          setAllowPublicMint(event.target.checked);
                        }}
                        checked={allowPublicMint}
                        control={<MaterialUISwitch sx={{ m: 1 }} />}
                        label="Yes"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <PreviewAndShareModal
          previewcanvasdata={savedData}
          show={showPreviewAndHideModal}
          object_id={object_id}
          data={savedData}
          onHide={() => setShowPreviewAndHideModal(false)}
        />
      </div>
      {artData && !allowPublicEdit && isConnected && creator !== address && (
        <>
          <Navbar />
          <div>
            <Emptybar
              firstText={"You cant edit someone else art without permission"}
              secondText={"You can request permission from the art creator"}
              link={true}
              linkurl={`/`}
              buttonText={"Back home"}
            />
          </div>
        </>
      )}
    </>
  );
};
