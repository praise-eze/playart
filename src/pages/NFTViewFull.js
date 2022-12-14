import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import {
  ArtNFTAddress,
  ArtNFTABI,
  shortenText,
  loadExternalURL,
} from "../components/Addons/Extras";
import Navbar from "../components/Navbar/Navbar";
import { useAccount, useSigner, useProvider } from "wagmi";
import styles from "./styles/NFTViewFull.module.scss";
import { useParams } from "react-router-dom";
import { BiShow } from "react-icons/bi";
import { MdOpenInNew } from "react-icons/md";
import { SiBinance } from "react-icons/si";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import Icon from "react-crypto-icons";
import LoadingBar from "react-top-loading-bar";
import Emptybar from "../components/Emptybar/Emptybar";

export const NFTViewFull = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const { token_id } = useParams();

  const [tokenUri, setTokenUri] = useState();
  const [tokenOwner, setTokenOwner] = useState();

  const [error, setError] = useState(false);
  const [Name, setName] = useState("");
  const [Tokenid, setTokenId] = useState("");
  const [Description, setDescription] = useState("");
  const [Image, setImage] = useState("");
  const [OwnerAddress, setOwnerAddress] = useState("");
  const [TokenAddress, setTokenAddress] = useState("");
  const [contractType, setContractType] = useState("ERC721");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    FecthNftData();
  }, []);

  const FecthNftData = async () => {
    setProgress(20);
    console.log("started");
    const ArtNFTContract = new ethers.Contract(
      ArtNFTAddress,
      ArtNFTABI,
      provider
    );
    console.log(ArtNFTContract);
    try {
      const tokenUri = await ArtNFTContract.tokenURI(token_id);
      const ownerAddress = await ArtNFTContract.ownerOf(token_id);
      setProgress(50);
      setTokenUri(tokenUri);
      setTokenOwner(ownerAddress);
      setOwnerAddress(ownerAddress);
      setTokenAddress(ArtNFTAddress);
      setTokenId(token_id);

      fetch(tokenUri)
        .then((response) => response.json())
        .then((data) => {
          setDescription(data.description);
          setName(data.name);
          setImage(data.image);
          setProgress(70);
          setProgress(100);
        });
      console.log(ownerAddress);
      console.log(tokenUri);
      setProgress(100);
    } catch (e) {
      setError(true);
      setProgress(100);
      console.log(e);
    }
  };

  return (
    <div>
      <LoadingBar
        color="#F76D6E"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <div>
        <Navbar />
      </div>
      <div
        style={{
          marginTop: "1.3em",
          height: "120vh",
          marginBottom: "14em",
          position: "relative",
        }}
      >
        {!error ? (
          <div
            style={{
              marginTop: "2.7em",
              marginBottom: "4em",
              position: "absolute",
              // top: "70%",
              left: "50%",
              msTransform: "translate(-50%, -0%)",
              transform: "translate(-50%, -0%)",
            }}
          >
            <div>
              {Name ? (
                <div className={styles.Placeholder}>
                  <div>
                    <img
                      className={styles.img}
                      width="500px"
                      height="500px"
                      src={Image}
                      alt="_blank"
                    />
                  </div>
                  <div>
                    <div className={styles.propsDetails}>
                      <span className={styles.name}>{Name}</span>
                      <br />
                      <span className={styles.name_tokenid}>
                        {Name} #
                        {Tokenid && Tokenid.length > 5
                          ? shortenText(Tokenid)
                          : Tokenid}
                      </span>
                      <br />
                      <span className={styles.description}>{Description}</span>
                      <br />
                      <br />
                      {OwnerAddress && (
                        <div className={styles.Fix}>
                          <Jazzicon
                            seed={jsNumberForAddress(OwnerAddress)}
                            diameter={50}
                            className={styles.Blockie}
                            // className={styles.Jazzicon}
                          />

                          <div className={styles.ownerheading}>
                            <span className={styles.textOwner}>
                              Current owner{" "}
                            </span>
                            <span className={styles.text}>
                              {shortenText(`${OwnerAddress}`)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1>Loading ..</h1>{" "}
                </div>
              )}

              <br />
              {Name && (
                <>
                  <div className={styles.traits}>
                    Traits
                    <>
                      <div
                        style={{
                          width: "120px",
                          height: "80px",
                          margin: "1em",
                          border: "2px solid black",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                        }}
                      >
                        <span style={{ fontSize: "18px", fontWeight: "200" }}>
                          TYPE
                        </span>
                        <span style={{ fontSize: "25px", fontWeight: "700" }}>
                          Art
                        </span>
                      </div>
                    </>
                  </div>

                  <br />
                  <div className={styles.traits}>
                    Details
                    <div className={styles.ownerheadingDetails}>
                      <br />
                      <div className={styles.AddIcons}>
                        <BiShow />
                        <span
                          onClick={() =>
                            loadExternalURL(
                              `https://mumbai.polygonscan.com/address/${TokenAddress}`
                            )
                          }
                          className={styles.traitsextra}
                        >
                          View on Polygon Mumbai scan
                        </span>
                      </div>
                      <div className={styles.AddIcons}>
                        <BiShow />
                        <span
                          onClick={() =>
                            loadExternalURL(
                              "https://testnets.opensea.io/collection/play-art"
                            )
                          }
                          className={styles.traitsextra}
                        >
                          View on Opensea
                        </span>
                      </div>
                      <div className={styles.AddIcons}>
                        <MdOpenInNew />
                        <span
                          onClick={() => {
                            loadExternalURL(tokenUri);
                          }}
                          className={styles.traitsextra}
                        >
                          Open original on IPFS
                        </span>
                      </div>
                      <div className={styles.AddIcons}>
                        <span className={styles.traitsextra}>
                          Polygon Mumbai Chain - {contractType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <br />
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <Emptybar
              firstText={"Invalid Token ID"}
              secondText={"Mint NFT ?"}
              link={true}
              linkurl={`/account/${address}`}
              buttonText={"Account"}
            />
          </>
        )}
      </div>
    </div>
  );
};
