import React from "react";
import PhotoAlbum from "react-photo-album";

function GalleryAlbum({data, setIndex, index}) {

 return (
    <PhotoAlbum 
    photos={data} 
    layout="masonry"
    onClick={({ index: current }) => setIndex(current)}
    />
 )

}

export default GalleryAlbum;