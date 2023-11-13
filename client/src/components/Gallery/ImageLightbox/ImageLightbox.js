import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

function ImageLightBox({data, index, setIndex}) {

 return (
    <Lightbox
    slides={data}
    open={index >= 0}
    index={index}
    close={() => setIndex(-1)}
    plugins={[Download, Zoom]}
    carousel={{finite: true}}
  />
 )

}

export default ImageLightBox;