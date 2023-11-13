import React, { useEffect } from "react";
import styles from './Gallery.module.css';
import GalleryAlbum from "./PhotoAlbum/Album";
import ImageLightBox from "./ImageLightbox/ImageLightbox";
import FilterGallery from "../Filter/Filter";

function Gallery() {
    const [data, setData] = React.useState(null);
    const [currentFolder, setCurrentFolder] = React.useState('');
    const [index, setIndex] = React.useState(-1);

    useEffect(() => {
        let fetchUrl = '/gallery-api';
        if (currentFolder != '') {
            fetchUrl = `/gallery-api/${currentFolder}`;
        }
        fetch(fetchUrl)
        .then((res) => res.json())
        .then((data) => {
            setData(data);
        })
        .catch((error) => {
            console.error(error);
        });
    }, [currentFolder]);

    const dataMin = data && data.map(imageItem => ({
        src: imageItem.srcMin,
        width: imageItem.width,
        height: imageItem.height
    }));
    

    return (
        <div className={styles.gallery}>
            <FilterGallery currentFolder={currentFolder} setCurrentFolder={setCurrentFolder}/>
            <div className={styles.list}>
                <GalleryAlbum data={dataMin} index={index} setIndex={setIndex}/>
                <ImageLightBox data={data} index={index} setIndex={setIndex}/>
            </div>
        </div>
    )
}

export default Gallery;
