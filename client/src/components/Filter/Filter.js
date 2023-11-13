import React from "react";
import styles from './Filter.module.css'

function FilterGallery({currentFolder, setCurrentFolder}) {

    const [dataFolders, setDataFolders] = React.useState(null);


    React.useEffect(() => {
        fetch("/gallery-folders")
          .then((res) => res.json())
          .then((data) => {
            setDataFolders(data);
          })
          .catch((error) => {
            console.error(error);
          });
    }, []);

    return (
        <>
        <div className={styles.filterTitle}>Folders: </div>
        <div className={styles.filter}>
                <button 
                    key='no-folder'
                    className={`${styles.item} ${currentFolder === '' ? styles.active : ''}`}
                    onClick={() => setCurrentFolder('')}
                >
                    No Folder
                </button>
            {dataFolders && dataFolders.map((folder, index) => (
                <button 
                    key={index}
                    className={`${styles.item} ${currentFolder === folder ? styles.active : ''}`}
                    onClick={() => setCurrentFolder(folder)}
                >
                    {folder}
                </button>
            ))}
        </div>
        </>

    )
}

export default FilterGallery;